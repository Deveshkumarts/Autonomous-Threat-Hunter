import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card"
import { Activity } from "lucide-react"

interface ActivityData {
  id: number
  employee: string
  action: string
  time: string
  isAnomaly: boolean
}

export function ActivityPanel() {
  const [activities, setActivities] = useState<ActivityData[]>([])

  useEffect(() => {
    fetch("http://localhost:8000/dashboard/activity")
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(console.error)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.length === 0 ? (
            <p className="text-sm text-textMuted text-center">No recent activity.</p>
          ) : (
            activities.map((activity, idx) => (
              <div key={idx} className="flex gap-4 relative">
                {idx !== activities.length - 1 && (
                  <span className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-border"></span>
                )}
                <div className="relative z-10 w-6 h-6 rounded-full bg-surface border-2 border-border flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full ${activity.isAnomaly ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm font-medium text-text">{activity.employee}: {activity.action}</p>
                  <p className="text-xs text-textMuted mt-1">{activity.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
