"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageSquareText, ClipboardList, ChevronRight } from "lucide-react";
import { PatientShell } from "@/components/medix";

const fullHistory = [
  { title: "Mental Health Check-in (Chat)", date: "Oct 12, 2025 · 09:24 AM", type: "chat", score: null },
  { title: "Standard Form (PHQ-9)", date: "Oct 8, 2025 · 02:17 PM", type: "form", score: "Score: 18 (Moderate-Severe)" },
  { title: "Mental Health Check-in (Chat)", date: "Oct 3, 2025 · 11:02 AM", type: "chat", score: null },
  { title: "Standard Form (GAD-7)", date: "Sep 28, 2025 · 10:00 AM", type: "form", score: "Score: 12 (Moderate)" },
  { title: "Mental Health Check-in (Chat)", date: "Sep 21, 2025 · 08:45 PM", type: "chat", score: null },
];

export default function History() {
  return (
    <PatientShell>
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Assessment History</h1>
            <p className="text-sm text-muted-foreground">Review your past check-ins and questionnaire results.</p>
          </div>
        </div>

        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          <ul className="divide-y">
            {fullHistory.map((h, i) => (
              <li key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3 flex-1">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${h.type === "chat" ? "bg-primary/20 text-primary" : "bg-orange-100 text-orange-600"}`}>
                    {h.type === "chat" ? <MessageSquareText className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium group-hover:text-primary transition-colors">{h.title}</p>
                    <p className="text-xs text-muted-foreground">{h.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 sm:ml-auto">
                  {h.score && (
                    <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                      {h.score}
                    </span>
                  )}
                  <span className="hidden sm:flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] text-green-700">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PatientShell>
  );
}