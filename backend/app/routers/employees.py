from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud, models
from ..database import get_db
from ..services.risk_engine import evaluate_employee_risk
from ..services.report_generator import generate_forensic_report

router = APIRouter(prefix="/employees", tags=["employees"])

@router.get("", response_model=List[schemas.Employee])
@router.get("/", response_model=List[schemas.Employee])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_employees(db, skip=skip, limit=limit)

@router.get("/{employee_id}/risk", response_model=schemas.RiskResponse)
def get_employee_risk(employee_id: str, db: Session = Depends(get_db)):
    return evaluate_employee_risk(db, employee_id)

@router.get("/{employee_id}/timeline")
def get_employee_timeline(employee_id: str, db: Session = Depends(get_db), limit: int = 50):
    logs = db.query(models.LogEvent).filter(models.LogEvent.employee_id == employee_id).order_by(models.LogEvent.timestamp.desc()).limit(limit).all()
    return logs

@router.get("/{employee_id}/responses", response_model=List[schemas.ResponseHistoryItem])
def get_employee_responses(employee_id: str, db: Session = Depends(get_db), limit: int = 20):
    responses = db.query(models.ResponseHistory).filter(models.ResponseHistory.employee_id == employee_id).order_by(models.ResponseHistory.timestamp.desc()).limit(limit).all()
    
    result = []
    for r in responses:
        result.append({
            "id": r.id,
            "employee_id": r.employee_id,
            "timestamp": r.timestamp,
            "risk_score": r.risk_score,
            "triggered_actions": r.triggered_actions.split(", ") if r.triggered_actions else [],
            "status": r.status
        })
    return result

@router.get("/{employee_id}/report")
def download_forensic_report(employee_id: str, db: Session = Depends(get_db)):
    try:
        buffer = generate_forensic_report(db, employee_id)
        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Forensic_Report_{employee_id}.pdf"
            }
        )
    except ValueError:
        raise HTTPException(status_code=404, detail="Employee not found")
