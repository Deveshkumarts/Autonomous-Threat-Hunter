from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Employee(Base):
    __tablename__ = "employees"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    department = Column(String)
    
    baseline = relationship("Baseline", back_populates="employee", uselist=False)
    logs = relationship("LogEvent", back_populates="employee")
    anomalies = relationship("Anomaly", back_populates="employee")

class Baseline(Base):
    __tablename__ = "baselines"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.id"), unique=True)
    
    normal_login_time = Column(String) # e.g. "09:00:00"
    login_variance_mins = Column(Integer)
    avg_downloads_per_day = Column(Float)
    avg_uploads_per_day = Column(Float)
    frequent_departments = Column(String) # Comma separated
    usb_usage_freq = Column(String) # "Never", "Rare", "Frequent"
    working_hours_start = Column(String)
    working_hours_end = Column(String)
    
    employee = relationship("Employee", back_populates="baseline")

class LogEvent(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    activity = Column(String)
    severity = Column(String)
    
    employee = relationship("Employee", back_populates="logs")

class Anomaly(Base):
    __tablename__ = "anomalies"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    activity = Column(String)
    prediction = Column(String)
    anomaly_score = Column(Float)
    risk = Column(String)
    
    employee = relationship("Employee", back_populates="anomalies")

class ResponseHistory(Base):
    __tablename__ = "response_history"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    risk_score = Column(Integer)
    triggered_actions = Column(String) # Comma separated
    status = Column(String)
    
    employee = relationship("Employee")
