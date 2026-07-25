from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models
from datetime import datetime, timedelta
import io
import csv

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_employees = db.query(models.Employee).count()
    
    # Active high-risk alerts (e.g. from the last 24 hours where risk was > 60)
    yesterday = datetime.utcnow() - timedelta(days=1)
    high_risk_responses = db.query(models.ResponseHistory).filter(
        models.ResponseHistory.risk_score > 60,
        models.ResponseHistory.timestamp >= yesterday
    ).count()
    
    return {
        "active_monitored_users": total_employees,
        "high_risk_alerts": high_risk_responses,
        "system_status": "Healthy"
    }

@router.get("/alerts")
def get_recent_alerts(db: Session = Depends(get_db)):
    # Returns recent high risk responses
    responses = db.query(models.ResponseHistory).order_by(
        models.ResponseHistory.timestamp.desc()
    ).limit(10).all()
    
    result = []
    for r in responses:
        emp = db.query(models.Employee).filter(models.Employee.id == r.employee_id).first()
        result.append({
            "id": r.id,
            "employee": emp.name if emp else r.employee_id,
            "department": emp.department if emp else "Unknown",
            "riskScore": r.risk_score,
            "status": "High" if r.risk_score > 60 else ("Medium" if r.risk_score > 30 else "Safe"),
            "time": r.timestamp.strftime("%H:%M")
        })
    return result

@router.get("/export/csv")
def export_global_csv(db: Session = Depends(get_db)):
    # Export logs and anomalies
    logs = db.query(models.LogEvent).order_by(models.LogEvent.timestamp.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["Timestamp", "Employee ID", "Activity", "Severity"])
    for log in logs:
        writer.writerow([
            log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            log.employee_id,
            log.activity,
            log.severity
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=Global_Threat_Export.csv"}
    )

@router.get("/activity")
def get_global_activity(db: Session = Depends(get_db)):
    logs = db.query(models.LogEvent).order_by(
        models.LogEvent.timestamp.desc()
    ).limit(10).all()
    
    result = []
    for log in logs:
        emp = db.query(models.Employee).filter(models.Employee.id == log.employee_id).first()
        result.append({
            "id": log.id,
            "employee": emp.name if emp else log.employee_id,
            "action": log.activity,
            "time": log.timestamp.strftime("%H:%M"),
            "isAnomaly": log.severity in ["High", "Critical"]
        })
    return result
