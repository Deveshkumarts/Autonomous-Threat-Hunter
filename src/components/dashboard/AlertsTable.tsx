import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table"
import { Badge } from "../ui/badge"

interface AlertData {
  id: number
  employee: string
  department: string
  riskScore: number
  status: string
  time: string
}

export function AlertsTable() {
  const [alerts, setAlerts] = useState<AlertData[]>([])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/dashboard/alerts`)
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(console.error)
  }, [])

  const getRiskBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "high":
        return <Badge variant="high">High</Badge>
      case "medium":
        return <Badge variant="medium">Medium</Badge>
      case "safe":
      default:
        return <Badge variant="safe">Safe</Badge>
    }
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Recent Critical Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-textMuted">No recent alerts.</TableCell>
              </TableRow>
            ) : (
              alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium text-text">{alert.employee}</TableCell>
                  <TableCell>{alert.department}</TableCell>
                  <TableCell>{alert.riskScore}</TableCell>
                  <TableCell>{getRiskBadge(alert.status)}</TableCell>
                  <TableCell className="text-right">{alert.time}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
