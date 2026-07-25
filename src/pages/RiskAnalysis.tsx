import React, { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { ShieldAlert, TrendingUp, Users, AlertTriangle, ArrowRight } from "lucide-react"

interface AlertData {
  id: number
  employee: string
  department: string
  riskScore: number
  status: string
  time: string
}

export function RiskAnalysis() {
  const [loading, setLoading] = useState(true)
  const [criticalAlerts, setCriticalAlerts] = useState<AlertData[]>([])

  useEffect(() => {
    // Fetch critical alerts for the queue
    fetch(`${import.meta.env.VITE_API_URL}/dashboard/alerts`)
      .then(res => res.json())
      .then((data: AlertData[]) => {
        // Filter for high/critical risk and take top 5
        const highRisk = data.filter(a => a.riskScore >= 60).slice(0, 5)
        setCriticalAlerts(highRisk)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-orange-500" /> Global Risk Analysis
        </h1>
        <p className="text-sm text-textMuted mt-1">
          High-level overview of organizational risk distribution and critical anomalies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Risk Tier Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center border-t border-border/50">
            {loading ? (
              <p className="text-textMuted">Loading data...</p>
            ) : (
              <div className="w-full flex justify-around items-end h-40 px-4">
                <div className="flex flex-col items-center justify-end gap-2 w-1/4 h-full">
                  <div className="w-full bg-green-500/80 rounded-t-sm" style={{ height: '80%' }}></div>
                  <span className="text-sm text-text">Safe</span>
                </div>
                <div className="flex flex-col items-center justify-end gap-2 w-1/4 h-full">
                  <div className="w-full bg-yellow-500/80 rounded-t-sm" style={{ height: '40%' }}></div>
                  <span className="text-sm text-text">Medium</span>
                </div>
                <div className="flex flex-col items-center justify-end gap-2 w-1/4 h-full">
                  <div className="w-full bg-orange-500/80 rounded-t-sm" style={{ height: '20%' }}></div>
                  <span className="text-sm text-text">High</span>
                </div>
                <div className="flex flex-col items-center justify-end gap-2 w-1/4 h-full">
                  <div className="w-full bg-red-500/80 rounded-t-sm" style={{ height: '5%' }}></div>
                  <span className="text-sm text-text">Critical</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Highest Risk Departments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" /> At-Risk Departments
            </CardTitle>
          </CardHeader>
          <CardContent className="border-t border-border/50 pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text">Engineering</span>
                <span className="text-sm text-red-400 font-bold">12 Anomalies</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm font-medium text-text">HR</span>
                <span className="text-sm text-orange-400 font-bold">4 Anomalies</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm font-medium text-text">Sales</span>
                <span className="text-sm text-yellow-400 font-bold">2 Anomalies</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" /> Critical Review Queue (Top 5)
          </CardTitle>
        </CardHeader>
        <CardContent className="border-t border-border/50 pt-4">
           {loading ? (
             <div className="py-8 text-center text-textMuted">Loading queue...</div>
           ) : criticalAlerts.length === 0 ? (
             <div className="py-8 text-center text-textMuted">No critical threats currently in the queue.</div>
           ) : (
             <div className="space-y-3">
               {criticalAlerts.map((alert, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 bg-surface/50 border border-border rounded-lg hover:border-red-500/30 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                       <AlertTriangle className="w-5 h-5 text-red-500" />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-text">{alert.employee}</h4>
                       <p className="text-xs text-textMuted">{alert.department} &bull; {alert.time}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-6">
                     <div className="text-right">
                       <span className="block text-xs text-textMuted">Risk Score</span>
                       <span className="text-lg font-bold text-red-500">{alert.riskScore}</span>
                     </div>
                     <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center gap-2 text-sm font-medium">
                       Review <ArrowRight className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </CardContent>
      </Card>
    </div>
  )
}
