import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { ShieldAlert, ArrowLeft, Activity, Shield, Clock } from "lucide-react"

interface RiskBreakdownItem {
  score: number
  reason: string
}

interface RiskData {
  total_score: number
  risk_level: string
  breakdown: RiskBreakdownItem[]
}

interface TimelineEvent {
  id: number
  timestamp: string
  activity: string
  severity: string
}

interface ResponseEvent {
  id: number
  timestamp: string
  risk_score: number
  triggered_actions: string[]
  status: string
}

export function EmployeeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [risk, setRisk] = useState<RiskData | null>(null)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [responses, setResponses] = useState<ResponseEvent[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchData = async () => {
    try {
      const [riskRes, timelineRes, responseRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/employees/${id}/risk`),
        fetch(`${import.meta.env.VITE_API_URL}/employees/${id}/timeline`),
        fetch(`${import.meta.env.VITE_API_URL}/employees/${id}/responses`)
      ])
      
      const rData = await riskRes.json()
      const tData = await timelineRes.json()
      const respData = await responseRes.json()
      
      setRisk(rData)
      setTimeline(tData)
      setResponses(respData)
      setLastUpdated(new Date())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchData()
    // Poll every 5 seconds for updates (or we could use websocket)
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [id])

  const getRiskColor = (level: string) => {
    if (level === "High" || level === "Critical") return "text-risk-high"
    if (level === "Medium") return "text-risk-medium"
    return "text-risk-safe"
  }

  if (!risk) return <div className="p-8 text-textMuted text-center">Loading profile...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/employees")} className="p-2 hover:bg-surface rounded-full transition-colors text-textMuted hover:text-text">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text">Employee: {id}</h1>
            <p className="text-sm text-textMuted flex items-center gap-2 mt-1">
              <Clock className="w-3.5 h-3.5" /> Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <a 
          href={`${import.meta.env.VITE_API_URL}/employees/${id}/report`}
          download
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          Download Forensic Report (PDF)
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Score Card */}
        <Card className="col-span-1 border-border bg-surface/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Current Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className={`text-6xl font-bold ${getRiskColor(risk.risk_level)}`}>
              {risk.total_score}
            </div>
            <div className={`text-xl font-medium mt-2 ${getRiskColor(risk.risk_level)}`}>
              {risk.risk_level} Risk
            </div>
          </CardContent>
        </Card>

        {/* Risk Breakdown Panel */}
        <Card className="col-span-1 md:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" /> Explainable Risk Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {risk.breakdown.length === 0 ? (
              <p className="text-textMuted">No significant risk factors detected in recent activity.</p>
            ) : (
              <div className="space-y-3">
                {risk.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                    <span className="text-text font-medium">{item.reason}</span>
                    <span className="text-risk-high font-bold">+{item.score}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 border-t border-border mt-4">
                  <span className="text-text font-bold">Total Aggregated Risk</span>
                  <span className={`font-bold text-lg ${getRiskColor(risk.risk_level)}`}>{risk.total_score}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Autonomous Responses */}
        <Card className="border-border border-red-900/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-risk-high">
              <Shield className="w-5 h-5" /> Autonomous Security Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <p className="text-textMuted">No automated actions have been triggered for this employee recently.</p>
            ) : (
              <div className="space-y-4">
                {responses.map((resp) => (
                  <div key={resp.id} className="p-4 bg-red-950/20 border border-red-900/30 rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-textMuted">{new Date(resp.timestamp).toLocaleString()}</span>
                      <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full font-medium">Score: {resp.risk_score}</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1">
                      {resp.triggered_actions.map((act, i) => (
                        <li key={i} className="text-sm text-red-200">{act}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" /> Recent Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto pr-2">
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
              {timeline.length === 0 ? (
                <p className="text-textMuted pl-8">No recent events found.</p>
              ) : (
                timeline.map((event) => (
                  <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-slate-500 bg-surface shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-border bg-background shadow">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-blue-400">{event.activity}</span>
                      </div>
                      <time className="block text-xs text-textMuted">{new Date(event.timestamp).toLocaleString()}</time>
                    </div>
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
