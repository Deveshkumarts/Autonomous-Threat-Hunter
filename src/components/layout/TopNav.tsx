import React from "react"
import { Shield, Search, Bell, UserCircle } from "lucide-react"

export function TopNav() {
  return (
    <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-500" />
        <span className="font-semibold text-lg text-text">SentinelX</span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
          <input 
            type="text" 
            placeholder="Search alerts, employees, IPs..." 
            className="pl-9 pr-4 py-2 w-64 bg-background border border-border rounded-md text-sm text-text focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        <button className="relative text-textMuted hover:text-text transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-risk-high rounded-full border-2 border-surface"></span>
        </button>
        
        <div className="flex items-center gap-2 cursor-pointer border-l border-border pl-6">
          <UserCircle className="w-8 h-8 text-textMuted" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text">Admin</span>
            <span className="text-xs text-textMuted">SecOps Lead</span>
          </div>
        </div>
      </div>
    </header>
  )
}
