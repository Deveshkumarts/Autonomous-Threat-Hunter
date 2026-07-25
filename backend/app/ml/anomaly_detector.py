import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime
from .. import schemas, models
from ..database import SessionLocal

MODEL_PATH = "isolation_forest.joblib"

def extract_features(log: schemas.LogEventCreate, baseline: models.Baseline) -> list:
    # 1. Hour of day
    dt = log.timestamp or datetime.utcnow()
    hour = dt.hour
    
    # 2. Activity severity
    sev_map = {"Info": 0, "Low": 1, "Medium": 2, "High": 3, "Critical": 4}
    sev = sev_map.get(log.severity, 0)
    
    # 3. Is frequent department (heuristic from log activity, assuming activity contains department name if it's an access)
    is_frequent_dept = 1
    if "Accessed" in log.activity and baseline.frequent_departments:
        depts = [d.strip() for d in baseline.frequent_departments.split(",")]
        is_frequent_dept = 1 if any(d in log.activity for d in depts) else 0
        
    # 4. Is USB event
    is_usb = 1 if "USB" in log.activity else 0
    if is_usb and baseline.usb_usage_freq == "Never":
        is_usb = 5 # Heavily penalize
        
    # 5. Outside working hours
    start_hr = int(baseline.working_hours_start.split(":")[0])
    end_hr = int(baseline.working_hours_end.split(":")[0])
    outside_hours = 1 if hour < start_hr or hour > end_hr else 0
    
    return [hour, sev, is_frequent_dept, is_usb, outside_hours]

class AnomalyDetector:
    def __init__(self):
        self.model = None
        self._load_model()
        
    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
        else:
            self.model = IsolationForest(contamination=0.05, random_state=42)
            # Dummy training to initialize if no historical data available
            X_dummy = [[9, 0, 1, 0, 0], [10, 1, 1, 0, 0], [14, 0, 1, 0, 0], [16, 2, 1, 0, 0], [11, 0, 1, 0, 0]] * 10
            self.model.fit(X_dummy)
            joblib.dump(self.model, MODEL_PATH)

    def train(self, X):
        self.model = IsolationForest(contamination=0.05, random_state=42)
        self.model.fit(X)
        joblib.dump(self.model, MODEL_PATH)

    def predict(self, log: schemas.LogEventCreate, baseline: models.Baseline) -> schemas.AnomalyResponse:
        features = extract_features(log, baseline)
        X = np.array([features])
        
        # Isolation Forest prediction: 1 for inliers, -1 for outliers
        pred = self.model.predict(X)[0]
        
        # Score: lower is more anomalous. Convert to 0-1 range where 1 is highly anomalous.
        score = self.model.decision_function(X)[0]
        # normalize score roughly (score usually between -0.5 and 0.5)
        normalized_score = max(0, min(1, 0.5 - score))
        
        # Add strong heuristics
        if features[4] == 1 and features[1] >= 2: # outside hours and medium+ severity
            pred = -1
            normalized_score = max(normalized_score, 0.8)
        if features[3] == 5: # USB used but baseline is Never
            pred = -1
            normalized_score = max(normalized_score, 0.95)
        if "External Upload" in log.activity:
            pred = -1
            normalized_score = max(normalized_score, 0.99)
            
        is_anomaly = pred == -1
        
        risk = "Low"
        if normalized_score > 0.8:
            risk = "Critical"
        elif normalized_score > 0.6:
            risk = "High"
        elif normalized_score > 0.4:
            risk = "Medium"
            
        if not is_anomaly:
            risk = "Safe"
            
        return schemas.AnomalyResponse(
            employee=log.employee_id,
            prediction="Anomaly" if is_anomaly else "Normal",
            anomaly_score=round(normalized_score, 2),
            risk=risk
        )

detector = AnomalyDetector()
