import React, { useState, useEffect, useRef } from "react"
import { Play, Pause, Trash2, Search, Filter, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "../components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { generateRandomLog, type LogEvent, type EmployeeData } from "../utils/logGenerator"

export function LiveLogs() {
  const [logs, setLogs] = useState<LogEvent[]>([])
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("All")
  const [severityFilter, setSeverityFilter] = useState("All")
  
  // Use a ref to keep track of the latest employees for the interval closure
  const employeesRef = useRef(employees)
  useEffect(() => {
    employeesRef.current = employees
  }, [employees])

  useEffect(() => {
    // Fetch valid employees from backend
    fetch("http://localhost:8000/employees")
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (!isPaused) {
      interval = setInterval(() => {
        const emps = employeesRef.current
        if (emps.length === 0) return

        const newLog = generateRandomLog(emps)
        if (!newLog) return

        // Add log optimistically
        setLogs(prev => [newLog, ...prev].slice(0, 100))

        // Analyze log with AI backend
        fetch("http://localhost:8000/analyze-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee_id: newLog.employeeId,
            activity: newLog.activity,
            severity: newLog.severity
          })
        })
          .then(res => res.json())
          .then(data => {
            setLogs(prev => prev.map(log => 
              log.id === newLog.id 
                ? { ...log, prediction: data.prediction, anomalyScore: data.anomaly_score, risk: data.risk }
                : log
            ))
          })
          .catch(console.error)

      }, 2000)
    }
    return () => clearInterval(interval)
  }, [isPaused])

  const getRiskBadge = (risk?: string, fallbackSeverity?: string) => {
    const level = risk || fallbackSeverity || "Info"
    switch (level) {
      case "Safe":
      case "Low": 
        return <Badge variant="severityLow">{level}</Badge>
      case "Medium": 
        return <Badge variant="severityMedium">{level}</Badge>
      case "High": 
        return <Badge variant="severityHigh">{level}</Badge>
      case "Critical": 
        return <Badge variant="severityCritical">{level}</Badge>
      default: 
        return <Badge variant="severityInfo">{level}</Badge>
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.activity.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDept = departmentFilter === "All" || log.department === departmentFilter
    const matchesSev = severityFilter === "All" || log.risk === severityFilter || (!log.risk && log.severity === severityFilter)

    return matchesSearch && matchesDept && matchesSev
  })

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text">Live AI Logs</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border">
              <span className={`w-2 h-2 rounded-full ${!isPaused ? 'bg-risk-safe animate-pulse' : 'bg-textMuted'}`}></span>
              <span className="text-xs font-medium text-textMuted">Live</span>
            </div>
          </div>
          <p className="text-sm text-textMuted mt-1">Real-time stream of security events analyzed by the AI engine.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
              isPaused 
                ? "bg-risk-safe text-white border-transparent hover:bg-risk-safe/90" 
                : "bg-surface border-border text-text hover:bg-slate-700/50"
            }`}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? "Resume Stream" : "Pause Stream"}
          </button>
          <button 
            onClick={() => setLogs([])}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-md text-sm font-medium hover:bg-slate-700/50 transition-colors text-risk-high hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
            Clear Logs
          </button>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center bg-surface/50">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm text-text focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-textMuted" />
            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-background border border-border rounded-md text-sm text-text py-2 px-3 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Departments</option>
              <option value="HR">HR</option>
              <option value="Engineering">Engineering</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Sales</option>
              <option value="IT">IT</option>
              <option value="System">System</option>
            </select>
          </div>
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-background border border-border rounded-md text-sm text-text py-2 px-3 focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Risks</option>
            <option value="Safe">Safe</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <div className="px-3 py-1.5 rounded-full bg-background border border-border text-xs font-medium text-textMuted">
            {logs.length} / 100 Logs
          </div>
        </div>
        <CardContent className="flex-1 p-0 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-surface z-10">
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>AI Prediction</TableHead>
                <TableHead className="text-right">Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-textMuted">
                    {logs.length === 0 ? (employees.length === 0 ? "Connecting to AI Engine..." : "Waiting for logs...") : "No logs match the current filters."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const isAnomaly = log.prediction === "Anomaly"
                  return (
                    <TableRow key={log.id} className={`animate-in fade-in slide-in-from-top-2 duration-300 ${isAnomaly ? 'bg-risk-high/10 hover:bg-risk-high/20' : ''}`}>
                      <TableCell className="text-textMuted whitespace-nowrap">{log.timestamp}</TableCell>
                      <TableCell>
                        <div className="font-medium text-text">{log.employeeName}</div>
                        <div className="text-xs text-textMuted">{log.employeeId}</div>
                      </TableCell>
                      <TableCell>{log.department}</TableCell>
                      <TableCell className="text-text">{log.activity}</TableCell>
                      <TableCell>
                        {log.prediction ? (
                          <div className={`flex items-center gap-1.5 ${isAnomaly ? 'text-risk-high font-medium' : 'text-risk-safe'}`}>
                            {isAnomaly && <AlertTriangle className="w-4 h-4" />}
                            {log.prediction}
                            {log.anomalyScore !== undefined && (
                              <span className="text-xs opacity-70">({log.anomalyScore.toFixed(2)})</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-textMuted text-xs animate-pulse">Analyzing...</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{getRiskBadge(log.risk, log.severity)}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
