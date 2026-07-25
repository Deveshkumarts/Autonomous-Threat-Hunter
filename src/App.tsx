import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "./components/layout/AppLayout"
import { Dashboard } from "./pages/Dashboard"
import { LiveLogs } from "./pages/LiveLogs"
import { Employees } from "./pages/Employees"
import { EmployeeDetails } from "./pages/EmployeeDetails"
import { Honeyfiles } from "./pages/Honeyfiles"

import { RiskAnalysis } from "./pages/RiskAnalysis"
import { Reports } from "./pages/Reports"

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/live-logs" element={<LiveLogs />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:id" element={<EmployeeDetails />} />
          <Route path="/honeyfiles" element={<Honeyfiles />} />
          <Route path="/risk-analysis" element={<RiskAnalysis />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
