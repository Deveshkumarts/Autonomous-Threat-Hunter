export type Severity = "Info" | "Low" | "Medium" | "High" | "Critical"

export interface LogEvent {
  id: string
  timestamp: string
  employeeId: string
  employeeName: string
  department: string
  activity: string
  severity: Severity
  prediction?: string
  anomalyScore?: number
  risk?: string
}

export interface EmployeeData {
  id: string
  name: string
  department: string
}

const activities = [
  { action: "Logged In", severity: "Info" },
  { action: "Logged Out", severity: "Info" },
  { action: "File Opened", severity: "Low" },
  { action: "Downloaded 120 Files", severity: "Medium" },
  { action: "USB Device Connected", severity: "High" },
  { action: "USB Device Removed", severity: "Info" },
  { action: "Accessed Finance Folder", severity: "High" },
  { action: "External Upload", severity: "Critical" },
  { action: "Permission Change", severity: "Medium" },
  { action: "Honeyfile Access", severity: "Critical" },
]

export function generateRandomLog(employees: EmployeeData[]): LogEvent | null {
  if (!employees || employees.length === 0) return null;
  
  const employee = employees[Math.floor(Math.random() * employees.length)]
  const activity = activities[Math.floor(Math.random() * activities.length)]
  
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, "0")
  const minutes = now.getMinutes().toString().padStart(2, "0")
  const seconds = now.getSeconds().toString().padStart(2, "0")
  
  return {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: `${hours}:${minutes}:${seconds}`,
    employeeId: employee.id,
    employeeName: employee.name,
    department: employee.department,
    activity: activity.action,
    severity: activity.severity as Severity,
  }
}
