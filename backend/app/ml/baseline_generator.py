import random
from datetime import datetime, timedelta
from ..database import SessionLocal, engine
from .. import models, schemas
from .anomaly_detector import detector, extract_features

def create_db_and_tables():
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)

def generate_baselines():
    create_db_and_tables()
    db = SessionLocal()
    
    departments = ["HR", "Engineering", "Finance", "Sales", "IT"]
    usb_freqs = ["Never", "Rare", "Frequent"]
    
    historical_logs = []
    
    for i in range(1, 21):
        emp_id = f"EMP{i:03d}"
        dept = random.choice(departments)
        
        # Create Employee
        emp = models.Employee(id=emp_id, name=f"Employee {i}", department=dept)
        db.add(emp)
        
        # Create Baseline
        start_hr = random.randint(7, 10)
        end_hr = start_hr + 8
        usb = random.choice(usb_freqs)
        
        baseline = models.Baseline(
            employee_id=emp_id,
            normal_login_time=f"{start_hr:02d}:00:00",
            login_variance_mins=30,
            avg_downloads_per_day=random.uniform(2.0, 20.0),
            avg_uploads_per_day=random.uniform(0.5, 5.0),
            frequent_departments=dept,
            usb_usage_freq=usb,
            working_hours_start=f"{start_hr:02d}:00:00",
            working_hours_end=f"{end_hr:02d}:00:00"
        )
        db.add(baseline)
        
        # Generate some normal historical logs for this employee
        for day in range(30):
            # Login
            log_time = datetime.utcnow() - timedelta(days=day)
            log_time = log_time.replace(hour=start_hr, minute=random.randint(0, 59))
            
            historical_logs.append((
                schemas.LogEventCreate(employee_id=emp_id, activity="Logged In", severity="Info", timestamp=log_time),
                baseline
            ))
            
            # Normal activity
            act_time = log_time.replace(hour=start_hr + random.randint(1, 7))
            historical_logs.append((
                schemas.LogEventCreate(employee_id=emp_id, activity=f"Accessed {dept} Folder", severity="Low", timestamp=act_time),
                baseline
            ))
            
            if usb != "Never" and random.random() < 0.2:
                usb_time = act_time + timedelta(minutes=15)
                historical_logs.append((
                    schemas.LogEventCreate(employee_id=emp_id, activity="USB Device Connected", severity="Medium", timestamp=usb_time),
                    baseline
                ))
    
    db.commit()
    
    # Train Isolation Forest on historical logs
    X_train = []
    for log, bline in historical_logs:
        X_train.append(extract_features(log, bline))
        # Also save to db optionally
        db_log = models.LogEvent(
            employee_id=log.employee_id,
            activity=log.activity,
            severity=log.severity,
            timestamp=log.timestamp
        )
        db.add(db_log)
        
    db.commit()
    db.close()
    
    if X_train:
        detector.train(X_train)
        print("Generated 20 employees and trained Isolation Forest model.")

if __name__ == "__main__":
    generate_baselines()
