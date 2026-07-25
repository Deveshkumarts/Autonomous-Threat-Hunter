import { useEffect, useState } from "react"

export interface SecurityResponseEvent {
  id: number
  employee_id: string
  timestamp: string
  risk_score: number
  triggered_actions: string[]
  status: string
}

export function useSecurityWebsocket() {
  const [events, setEvents] = useState<SecurityResponseEvent[]>([])

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws")
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === "SECURITY_RESPONSE") {
          setEvents(prev => [message.data, ...prev].slice(0, 50)) // Keep last 50 events
        }
      } catch (e) {
        console.error("Error parsing websocket message", e)
      }
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
    }

    return () => {
      ws.close()
    }
  }, [])

  return { events }
}
