import React, { useState, useEffect } from "react"
import { Folder, FileSpreadsheet, FileText, ChevronRight, HardDrive, Search, ShieldAlert, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import type { EmployeeData } from "../utils/logGenerator"

const honeyfiles = [
  { name: "Salary_2026.xlsx", type: "excel", icon: FileSpreadsheet, size: "124 KB", modified: "Oct 12, 2025" },
  { name: "CEO_Passwords.xlsx", type: "excel", icon: FileSpreadsheet, size: "18 KB", modified: "Nov 04, 2025" },
  { name: "Financial_Report.pdf", type: "pdf", icon: FileText, size: "2.4 MB", modified: "Jan 15, 2026" },
  { name: "Confidential_Project.docx", type: "word", icon: FileText, size: "845 KB", modified: "Feb 28, 2026" },
]

export function Honeyfiles() {
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [simulationStatus, setSimulationStatus] = useState<{message: string, isError: boolean} | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/employees/`)
      .then(res => res.json())
      .then((data: EmployeeData[]) => {
        setEmployees(data)
        if (data.length > 0) {
          setSelectedEmployee(data[0].id)
        }
      })
      .catch(console.error)
  }, [])

  const handleFileClick = async (fileName: string) => {
    if (!selectedEmployee) return
    
    setSimulationStatus(null)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/analyze-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: selectedEmployee,
          activity: `Honeyfile Access Detected: ${fileName}`,
          severity: "Critical"
        })
      })

      if (response.ok) {
        setSimulationStatus({ message: `Successfully simulated access to ${fileName} for ${selectedEmployee}`, isError: false })
        setTimeout(() => setSimulationStatus(null), 5000)
      } else {
        setSimulationStatus({ message: "Failed to simulate access", isError: true })
      }
    } catch (e) {
      console.error(e)
      setSimulationStatus({ message: "Network error during simulation", isError: true })
    }
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" /> AI Honeyfiles Simulation
        </h1>
        <p className="text-sm text-textMuted mt-1">
          Simulate an insider threat accessing a decoy file. This will immediately trigger the Autonomous Response Engine.
        </p>
      </div>

      {/* Simulation Control Bar */}
      <Card className="border-red-900/50 bg-red-950/10">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-medium text-text">Simulate action as:</label>
            <select 
              className="bg-surface border border-border text-text rounded-md px-3 py-1.5 outline-none focus:ring-1 focus:ring-red-500"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
              ))}
            </select>
          </div>
          
          {simulationStatus && (
            <div className={`text-sm flex items-center gap-2 ${simulationStatus.isError ? 'text-red-400' : 'text-green-400'}`}>
              {simulationStatus.isError ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {simulationStatus.message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fake File Explorer UI */}
      <Card className="flex-1 flex flex-col overflow-hidden border-border bg-surface">
        <CardHeader className="border-b border-border p-3 flex flex-row items-center gap-4 space-y-0">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <div className="flex items-center text-sm text-textMuted flex-1 bg-background rounded-md px-3 py-1.5 border border-border">
            <HardDrive className="w-4 h-4 mr-2" />
            <span>Company Shared Drive</span>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span>Management</span>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-text font-medium">Confidential</span>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-textMuted" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-background border border-border rounded-md pl-8 pr-3 py-1.5 text-sm w-48 focus:outline-none"
              disabled
            />
          </div>
        </CardHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-border p-3 hidden sm:block">
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-textMuted hover:bg-background cursor-pointer">
                <Folder className="w-4 h-4 text-blue-400" /> HR
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-textMuted hover:bg-background cursor-pointer">
                <Folder className="w-4 h-4 text-blue-400" /> Engineering
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-textMuted hover:bg-background cursor-pointer">
                <Folder className="w-4 h-4 text-blue-400" /> Sales
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-blue-600/20 text-blue-400 cursor-pointer font-medium border border-blue-500/30">
                <Folder className="w-4 h-4 text-blue-400 fill-blue-400/20" /> Management
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 p-4 bg-background overflow-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {honeyfiles.map((file, idx) => {
                const Icon = file.icon
                return (
                  <div 
                    key={idx}
                    onClick={() => handleFileClick(file.name)}
                    className="flex flex-col items-center p-4 rounded-lg border border-transparent hover:border-border hover:bg-surface transition-all cursor-pointer group relative"
                    title={`Click to simulate ${selectedEmployee || 'employee'} opening this file`}
                  >
                    <div className="w-16 h-16 mb-3 relative flex items-center justify-center">
                      <Icon className={`w-12 h-12 ${file.type === 'excel' ? 'text-green-500' : file.type === 'pdf' ? 'text-red-500' : 'text-blue-500'}`} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-medium text-text text-center break-all w-full leading-tight">{file.name}</span>
                    <span className="text-xs text-textMuted mt-1">{file.size}</span>
                    
                    {/* Hover indicator */}
                    <div className="absolute inset-0 border-2 border-red-500/0 group-hover:border-red-500/30 rounded-lg pointer-events-none transition-colors"></div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
