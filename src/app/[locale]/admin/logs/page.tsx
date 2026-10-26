"use client";

import { AdminShell } from "@/components/medix";
import { Activity, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";

const mockLogs = [
  { id: 1, action: "AI Model Deployment", user: "Admin (IT)", details: "Uploaded GigaChat 20B (INT8) to Local Server", time: "10 mins ago", type: "system" },
  { id: 2, action: "Safety Override Triggered", user: "Patient MD-12345", details: "Suicidal ideation detected in chat", time: "25 mins ago", type: "critical" },
  { id: 3, action: "New Doctor Provisioned", user: "Admin (IT)", details: "Created account for dr.ivanov@hospital.ru", time: "1 hour ago", type: "info" },
  { id: 4, action: "Prescription Confirmed", user: "Dr. Smith", details: "Aviandr prescribed to Patient MD-12345", time: "2 hours ago", type: "success" },
  { id: 5, action: "PHQ-9 Form Submitted", user: "Patient MD-12345", details: "Score: 18 (Moderate-Severe)", time: "3 hours ago", type: "info" },
];

export default function AdminLogs() {
  return (
    <AdminShell>
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div>
          <h1 className="text-[22px] font-bold text-foreground">System Audit Logs</h1>
          <p className="text-sm text-muted-foreground">Immutable record of all clinical and system actions.</p>
        </div>

        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          <ul className="divide-y">
            {mockLogs.map((log) => (
              <li key={log.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-muted/10 transition-colors">
                
                {/* Log Icon & Details */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                    log.type === "critical" ? "bg-destructive/10 text-destructive" :
                    log.type === "success" ? "bg-success/10 text-success" :
                    log.type === "system" ? "bg-indigo-100 text-indigo-600" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {log.type === "critical" ? <ShieldAlert className="h-5 w-5" /> :
                     log.type === "success" ? <CheckCircle2 className="h-5 w-5" /> :
                     log.type === "system" ? <Activity className="h-5 w-5" /> :
                     <FileText className="h-5 w-5" />}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.details}</p>
                  </div>
                </div>
                
                {/* User & Time (Stacks on mobile) */}
                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-muted-foreground sm:ml-auto w-full sm:w-auto pl-14 sm:pl-0">
                  <span className="font-medium text-foreground bg-muted/50 px-2 py-1 rounded-md">{log.user}</span>
                  <span className="w-20 text-right shrink-0">{log.time}</span>
                </div>

              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}