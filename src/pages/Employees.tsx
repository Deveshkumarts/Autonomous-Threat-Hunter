import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "../components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table"
import type { EmployeeData } from "../utils/logGenerator"
import { ChevronRight, ShieldAlert } from "lucide-react"

export function Employees() {
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/employees/`)
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(console.error)
  }, [])

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-text">Monitored Employees</h1>
        <p className="text-sm text-textMuted mt-1">Select an employee to view their detailed risk profile and timeline.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 p-0 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-surface z-10">
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-textMuted">Loading employees...</TableCell>
                </TableRow>
              ) : (
                employees.map(emp => (
                  <TableRow 
                    key={emp.id} 
                    className="cursor-pointer hover:bg-surface/80 group"
                    onClick={() => navigate(`/employees/${emp.id}`)}
                  >
                    <TableCell className="font-medium">{emp.id}</TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell className="text-right">
                      <button className="text-blue-400 group-hover:text-blue-300 flex items-center justify-end w-full gap-1">
                        View Profile <ChevronRight className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
