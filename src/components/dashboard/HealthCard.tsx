import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { CheckCircle2, Server, Database, Activity, RadioReceiver } from "lucide-react"

export function HealthCard() {
  const items = [
    { label: "AI Engine", status: "Online", icon: RadioReceiver },
    { label: "Database", status: "Online", icon: Database },
    { label: "Log Stream", status: "Online", icon: Activity },
    { label: "WebSocket", status: "Online", icon: Server },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border">
                <div className="p-2 rounded-lg bg-risk-safe/10 text-risk-safe">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-textMuted">{item.label}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-risk-safe" />
                    <span className="text-sm font-medium text-text">{item.status}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
