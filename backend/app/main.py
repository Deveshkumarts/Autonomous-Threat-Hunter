from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import employees, baseline, logs, anomalies, websocket, dashboard

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SentinelX API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(websocket.router)
app.include_router(employees.router)
app.include_router(baseline.router)
app.include_router(logs.router)
app.include_router(anomalies.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"message": "SentinelX API is running."}
