import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Download, FileText, Database } from "lucide-react"
import type { EmployeeData } from "../utils/logGenerator"

export function Reports() {
  const [employees, setEmployees] = useState<EmployeeData[]>([])

  useEffect(() => {
    fetch("http://localhost:8000/employees/")
      .then(res => res.json())
      .then((data) => setEmployees(data))
      .catch(console.error)
  }, [])

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-400" /> Reports & Exports
        </h1>
        <p className="text-sm text-textMuted mt-1">
          Generate forensic PDF reports and export system-wide data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Global CSV Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-green-400" /> Global Data Export
            </CardTitle>
          </CardHeader>
          <CardContent className="border-t border-border/50 pt-4 space-y-4">
            <p className="text-sm text-textMuted">
              Download a full CSV export of all recorded anomalies, security alerts, and autonomous responses across the entire organization.
            </p>
            <a 
              href="http://localhost:8000/dashboard/export/csv"
              download
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Download Full CSV
            </a>
          </CardContent>
        </Card>

        {/* PDF Forensic Hub */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-400" /> Employee Forensic PDFs
            </CardTitle>
          </CardHeader>
          <CardContent className="border-t border-border/50 pt-4 space-y-4">
            <p className="text-sm text-textMuted">
              Select an employee to instantly generate and download their comprehensive forensic investigation PDF.
            </p>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {employees.length === 0 ? (
                <p className="text-sm text-textMuted">Loading employees...</p>
              ) : (
                employees.map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-text">{emp.name}</p>
                      <p className="text-xs text-textMuted">{emp.id} - {emp.department}</p>
                    </div>
                    <a 
                      href={`http://localhost:8000/employees/${emp.id}/report`}
                      download
                      className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </a>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
