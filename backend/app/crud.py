from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

def get_employee(db: Session, employee_id: str):
    return db.query(models.Employee).filter(models.Employee.id == employee_id).first()

def get_employees(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Employee).offset(skip).limit(limit).all()

def get_baseline(db: Session, employee_id: str):
    return db.query(models.Baseline).filter(models.Baseline.employee_id == employee_id).first()

def create_log(db: Session, log: schemas.LogEventCreate):
    db_log = models.LogEvent(
        employee_id=log.employee_id,
        activity=log.activity,
        severity=log.severity,
        timestamp=log.timestamp or datetime.utcnow()
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def create_anomaly(db: Session, anomaly_data: schemas.AnomalyResponse):
    db_anomaly = models.Anomaly(
        employee_id=anomaly_data.employee,
        prediction=anomaly_data.prediction,
        anomaly_score=anomaly_data.anomaly_score,
        risk=anomaly_data.risk
    )
    db.add(db_anomaly)
    db.commit()
    db.refresh(db_anomaly)
    return db_anomaly

def get_anomalies(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Anomaly).offset(skip).limit(limit).all()
