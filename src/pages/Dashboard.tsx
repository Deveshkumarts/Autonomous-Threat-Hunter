import React from "react"
import { StatCards } from "../components/dashboard/StatCards"
import { AlertsTable } from "../components/dashboard/AlertsTable"
import { ActivityPanel } from "../components/dashboard/ActivityPanel"
import { HealthCard } from "../components/dashboard/HealthCard"

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-sm text-textMuted mt-1">Overview of your insider threat detection system.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-surface border border-border rounded-md text-sm font-medium hover:bg-slate-700/50 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
            View All Alerts
          </button>
        </div>
      </div>
      
      <StatCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <AlertsTable />
        </div>
        <div className="flex flex-col gap-6">
          <ActivityPanel />
          <HealthCard />
        </div>
      </div>
    </div>
  )
}
