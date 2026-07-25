import React from "react"
import { TopNav } from "./TopNav"
import { Sidebar } from "./Sidebar"
import { SecurityResponsePanel } from "../dashboard/SecurityResponsePanel"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-background p-6">
          {children}
        </main>
      </div>
      <SecurityResponsePanel />
    </div>
  )
}
