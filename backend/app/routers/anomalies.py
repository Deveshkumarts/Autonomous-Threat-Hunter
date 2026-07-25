from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/anomalies", tags=["anomalies"])

@router.get("/", response_model=List[schemas.AnomalyResponse])
def read_anomalies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    anomalies = crud.get_anomalies(db, skip=skip, limit=limit)
    return [
        schemas.AnomalyResponse(
            employee=a.employee_id,
            prediction=a.prediction,
            anomaly_score=a.anomaly_score,
            risk=a.risk
        ) for a in anomalies
    ]
