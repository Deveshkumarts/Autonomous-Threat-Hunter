from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db
from ..ml.anomaly_detector import detector
from ..services.risk_engine import evaluate_employee_risk, process_autonomous_response
from .websocket import manager # We will create this

router = APIRouter(tags=["logs"])

@router.post("/analyze-log", response_model=schemas.AnomalyResponse)
async def analyze_log(log: schemas.LogEventCreate, db: Session = Depends(get_db)):
    # Get employee baseline
    baseline = crud.get_baseline(db, employee_id=log.employee_id)
    if not baseline:
        raise HTTPException(status_code=404, detail="Employee baseline not found")
        
    # Save the log to the database
    crud.create_log(db, log)
    
    # Predict anomaly
    anomaly_response = detector.predict(log, baseline)
    
    # Save anomaly if it is one
    if anomaly_response.prediction == "Anomaly":
        crud.create_anomaly(db, anomaly_response)
        
    # Evaluate Risk Score based on recent logs
    risk_response = evaluate_employee_risk(db, log.employee_id)
    
    # Check if we need an autonomous response
    response = process_autonomous_response(db, risk_response)
    
    if response:
        # Broadcast via WebSocket
        await manager.broadcast({
            "type": "SECURITY_RESPONSE",
            "data": {
                "id": response.id,
                "employee_id": response.employee_id,
                "timestamp": response.timestamp.isoformat(),
                "risk_score": response.risk_score,
                "triggered_actions": response.triggered_actions.split(", "),
                "status": response.status
            }
        })
        
    return anomaly_response
