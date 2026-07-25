# 🛡️ Autonomous Threat Hunter

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![Scikit-Learn](https://img.shields.io/badge/AI-Scikit--Learn-orange)

An AI-driven cybersecurity platform designed to detect insider threats, compromised accounts, and data exfiltration attempts in real-time. Moving beyond traditional static rules, the Autonomous Threat Hunter uses machine learning to understand the "normal" behavioral baseline of every employee and reacts autonomously when critical thresholds are breached.

## ✨ Key Features

- **🧠 Behavioral AI Baseline Engine:** Uses Scikit-Learn (Isolation Forest) to learn historical employee behavior (working hours, download volumes, IP patterns) and detect anomalies in real-time.
- **🔍 Explainable Risk Scoring:** Transparent AI that doesn't just block users, but explains *exactly why* they were flagged (e.g., "+30 points for massive download volume").
- **🍯 AI Honeyfile Simulation:** Deploy highly tempting decoy files (e.g., `CEO_Passwords.xlsx`) on the network. If an attacker touches them, the system triggers an immediate lockdown.
- **⚡ Autonomous Response Engine:** Zero human latency. The system automatically disables downloads or locks out user sessions the millisecond a risk threshold is breached.
- **📄 Automated Forensic PDFs:** Instantly generates detailed, downloadable PDF incident reports mapping to MITRE ATT&CK techniques, saving security teams hours of triage.

## 🛠️ Tech Stack

- **Frontend:** React.js, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Python, FastAPI, SQLAlchemy, WebSockets, ReportLab
- **Database:** PostgreSQL (Hosted on NeonDB)
- **Machine Learning:** Scikit-Learn, Pandas, NumPy

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Deveshkumarts/Autonomous-Threat-Hunter.git
cd Autonomous-Threat-Hunter
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```
**Environment Variables:** Create a `.env` file in the `backend` folder containing your database URL:
```env
DATABASE_URL=postgresql://user:password@your-db-url.com/neondb
```

Run the backend:
```bash
uvicorn app.main:app --reload
```

### 3. Frontend Setup
Open a new terminal in the project root:
```bash
npm install
npm run dev
```

The frontend will be running on `http://localhost:5173` and the backend API will be available at `http://localhost:8000`.

## 📸 Screenshots
*(Add screenshots of your dashboard, risk analysis page, and forensic reports here)*

## 📄 License
This project is licensed under the MIT License.
