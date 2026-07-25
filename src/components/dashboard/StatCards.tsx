import React, { useState, useEffect } from "react"
import { Users, UserCheck, ShieldAlert, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "../ui/card"

export function StatCards() {
  const [stats, setStats] = useState({
    active_monitored_users: 0,
    high_risk_alerts: 0,
    system_status: "Loading..."
  })

  useEffect(() => {
    fetch("http://localhost:8000/dashboard/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error)
  }, [])

  const items = [
    { label: "Monitored Employees", value: stats.active_monitored_users, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "System Status", value: stats.system_status, icon: UserCheck, color: "text-risk-safe", bg: "bg-risk-safe/10" },
    { label: "Active High Risk", value: stats.high_risk_alerts, icon: ShieldAlert, color: "text-risk-high", bg: "bg-risk-high/10" },
    { label: "Recent Incidents", value: stats.high_risk_alerts, icon: AlertTriangle, color: "text-risk-medium", bg: "bg-risk-medium/10" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {items.map((item, idx) => {
        const Icon = item.icon
        return (
          <Card key={idx}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-xl ${item.bg}`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm text-textMuted font-medium">{item.label}</p>
                <h4 className="text-2xl font-bold text-text mt-1">{item.value}</h4>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
