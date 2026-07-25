from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BaselineBase(BaseModel):
    normal_login_time: str
    login_variance_mins: int
    avg_downloads_per_day: float
    avg_uploads_per_day: float
    frequent_departments: str
    usb_usage_freq: str
    working_hours_start: str
    working_hours_end: str

class Baseline(BaselineBase):
    id: int
    employee_id: str
    class Config:
        orm_mode = True
        from_attributes = True

class EmployeeBase(BaseModel):
    id: str
    name: str
    department: str

class Employee(EmployeeBase):
    baseline: Optional[Baseline] = None
    class Config:
        orm_mode = True
        from_attributes = True

class LogEventCreate(BaseModel):
    employee_id: str
    activity: str
    severity: str
    timestamp: Optional[datetime] = None

class AnomalyResponse(BaseModel):
    employee: str
    prediction: str
    anomaly_score: float
    risk: str

class RiskBreakdownItem(BaseModel):
    score: int
    reason: str

class RiskResponse(BaseModel):
    employee_id: str
    total_score: int
    risk_level: str
    breakdown: List[RiskBreakdownItem]

class ResponseHistoryItem(BaseModel):
    id: int
    employee_id: str
    timestamp: datetime
    risk_score: int
    triggered_actions: List[str]
    status: str

    class Config:
        orm_mode = True
        from_attributes = True
