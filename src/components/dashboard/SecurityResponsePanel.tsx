import React, { useEffect, useState } from "react"
import { ShieldAlert, X } from "lucide-react"
import { useSecurityWebsocket, type SecurityResponseEvent } from "../../hooks/useSecurityWebsocket"

export function SecurityResponsePanel() {
  const { events } = useSecurityWebsocket()
  const [visibleEvents, setVisibleEvents] = useState<SecurityResponseEvent[]>([])

  useEffect(() => {
    // When a new event arrives, add it to visible events if not already there
    if (events.length > 0) {
      const latest = events[0]
      setVisibleEvents(prev => {
        if (!prev.find(e => e.id === latest.id)) {
          return [latest, ...prev]
        }
        return prev
      })
    }
  }, [events])

  const removeEvent = (id: number) => {
    setVisibleEvents(prev => prev.filter(e => e.id !== id))
  }

  if (visibleEvents.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {visibleEvents.map((event) => (
        <div 
          key={event.id}
          className="bg-red-950/90 border border-red-500/50 rounded-lg shadow-xl shadow-red-900/20 backdrop-blur-sm p-4 animate-in slide-in-from-right-8"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <ShieldAlert className="w-5 h-5" />
              Autonomous Action Triggered
            </div>
            <button onClick={() => removeEvent(event.id)} className="text-red-400/70 hover:text-red-200">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-red-200 mb-2">
            <span className="font-semibold text-white">{event.employee_id}</span> exceeded risk threshold (Score: {event.risk_score}).
          </div>
          <ul className="text-xs text-red-300 space-y-1 list-disc pl-4">
            {event.triggered_actions.map((action, idx) => (
              <li key={idx}>{action}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
