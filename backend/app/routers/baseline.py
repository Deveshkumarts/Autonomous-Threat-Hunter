from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/baseline", tags=["baseline"])

@router.get("/{employee_id}", response_model=schemas.Baseline)
def read_baseline(employee_id: str, db: Session = Depends(get_db)):
    db_baseline = crud.get_baseline(db, employee_id=employee_id)
    if db_baseline is None:
        raise HTTPException(status_code=404, detail="Baseline not found")
    return db_baseline
