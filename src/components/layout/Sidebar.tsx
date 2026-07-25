import React from "react"
import { NavLink } from "react-router-dom"
import { ShieldAlert, LayoutDashboard, Activity, Users, Bell, Search, FileKey, BarChart3, Settings, Shield } from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Activity, label: "Live Logs", path: "/live-logs" },
  { icon: Users, label: "Employees", path: "/employees" },
  { icon: ShieldAlert, label: "Risk Analysis", path: "/risk-analysis" },
  { icon: FileKey, label: "Honeyfiles", path: "/honeyfiles" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
]

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-surface h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item, idx) => {
          const Icon = item.icon
          return (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white bg-blue-600/20 text-blue-400"
                    : "text-textMuted hover:bg-surface hover:text-text hover:bg-slate-700/50"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
