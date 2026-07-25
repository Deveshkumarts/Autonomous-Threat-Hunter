from datetime import datetime, timedelta
from typing import List
from sqlalchemy.orm import Session
from .. import models, schemas

def evaluate_employee_risk(db: Session, employee_id: str) -> schemas.RiskResponse:
    # 1. Fetch baseline
    baseline = db.query(models.Baseline).filter(models.Baseline.employee_id == employee_id).first()
    if not baseline:
        return schemas.RiskResponse(employee_id=employee_id, total_score=0, risk_level="Low", breakdown=[])

    # 2. Fetch recent logs (last 24 hours)
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_logs = db.query(models.LogEvent).filter(
        models.LogEvent.employee_id == employee_id,
        models.LogEvent.timestamp >= yesterday
    ).all()

    breakdown: List[schemas.RiskBreakdownItem] = []
    total_score = 0
    
    # Flags to avoid counting the same violation type multiple times excessively, or we can just count them.
    # The requirement says: "If multiple suspicious events occur, combine the scores."
    # We will accumulate scores based on recent events.
    
    # For downloaded files, we aggregate the total count from logs if possible, but our logs are events like "Downloaded 120 Files".
    # Let's parse that.
    downloaded_files = 0
    usb_inserted = False
    confidential_access = False
    external_upload = False
    honeyfile_access = False
    outside_hours = False
    new_location = False # We don't have location in logs currently, but we can simulate it if activity contains "New Location" or similar, or just randomly for simulation.
    
    start_hr = int(baseline.working_hours_start.split(":")[0])
    end_hr = int(baseline.working_hours_end.split(":")[0])

    for log in recent_logs:
        act = log.activity.lower()
        
        # Outside hours check
        hour = log.timestamp.hour
        if hour < start_hr or hour > end_hr:
            outside_hours = True
            
        # Downloads check
        if "download" in act:
            # try to extract number
            parts = act.split()
            for p in parts:
                if p.isdigit():
                    downloaded_files += int(p)
                    
        # USB check
        if "usb" in act and "connect" in act:
            usb_inserted = True
            
        # Confidential check
        if "finance" in act or "confidential" in act or "admin" in act:
            if baseline.frequent_departments and "Finance" not in baseline.frequent_departments:
                confidential_access = True
                
        # External Upload
        if "external upload" in act:
            external_upload = True
            
        # Honeyfile
        if "honeyfile" in act:
            honeyfile_access = True
            
        # New Location (Simulation: if log activity explicitly says new location)
        if "new location" in act or "new device" in act:
            new_location = True

    # Calculate Score
    if outside_hours:
        breakdown.append(schemas.RiskBreakdownItem(score=10, reason="Login outside working hours"))
        total_score += 10
        
    if new_location:
        breakdown.append(schemas.RiskBreakdownItem(score=20, reason="Login from new device/location"))
        total_score += 20
        
    if downloaded_files > 100:
        breakdown.append(schemas.RiskBreakdownItem(score=30, reason=f"Downloaded abnormal number of files ({downloaded_files})"))
        total_score += 30
        
    if usb_inserted:
        breakdown.append(schemas.RiskBreakdownItem(score=15, reason="USB inserted"))
        total_score += 15
        
    if confidential_access:
        breakdown.append(schemas.RiskBreakdownItem(score=15, reason="Accessed confidential folders"))
        total_score += 15
        
    if external_upload:
        breakdown.append(schemas.RiskBreakdownItem(score=25, reason="External upload detected"))
        total_score += 25
        
    if honeyfile_access:
        breakdown.append(schemas.RiskBreakdownItem(score=40, reason="Honeyfile accessed"))
        total_score += 40
        
    # Cap total score at 100
    total_score = min(total_score, 100)
    
    risk_level = "Low"
    if total_score > 60:
        risk_level = "High"
    elif total_score > 30:
        risk_level = "Medium"

    return schemas.RiskResponse(
        employee_id=employee_id,
        total_score=total_score,
        risk_level=risk_level,
        breakdown=breakdown
    )

def process_autonomous_response(db: Session, risk_response: schemas.RiskResponse) -> models.ResponseHistory | None:
    score = risk_response.total_score
    
    if score < 31:
        return None # No action
        
    actions = []
    
    if 31 <= score <= 60:
        actions.append("Increase monitoring")
        actions.append("Notify Admin")
    elif score > 60:
        actions.append("Disable Downloads")
        actions.append("Disable USB")
        actions.append("Require Manager Approval")
        actions.append("Start Screen Recording (Simulated)")
        actions.append("Generate Alert")
        
    actions_str = ", ".join(actions)
    
    # Check if we already triggered this exact response recently (last 1 hour) to avoid spam
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    recent_response = db.query(models.ResponseHistory).filter(
        models.ResponseHistory.employee_id == risk_response.employee_id,
        models.ResponseHistory.timestamp >= one_hour_ago,
        models.ResponseHistory.triggered_actions == actions_str
    ).first()
    
    if recent_response:
        return None
        
    # Create new response history record
    db_response = models.ResponseHistory(
        employee_id=risk_response.employee_id,
        timestamp=datetime.utcnow(),
        risk_score=score,
        triggered_actions=actions_str,
        status="Triggered"
    )
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    
    return db_response
