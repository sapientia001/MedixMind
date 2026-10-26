"use client";

import { DoctorShell } from "@/components/medix";
import { Users, ShieldAlert, CheckCircle2, TrendingUp, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DoctorCommandCenter({ 
  metrics, 
  recentAlerts, 
  recentNotes 
}: { 
  metrics: { totalPatients: number; criticalPatients: number; stablePatients: number };
  recentAlerts: any[];
  recentNotes: any[];
}) {
  return (
    <DoctorShell>
      <div className="max-w-[1200px] mx-auto space-y-6">
        <h1 className="text-[22px] font-bold text-foreground">Clinical Dashboard</h1>

        {/* METRICS GRID */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground mt-2">{metrics.totalPatients}</p>
          </div>

          <div className="rounded-xl border border-destructive/20 bg-destructive-soft p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-destructive">Critical / Needs Review</p>
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-3xl font-bold text-destructive mt-2">{metrics.criticalPatients}</p>
          </div>

          <div className="rounded-xl border border-success/20 bg-success-soft p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-success-foreground">Stable</p>
              <CheckCircle2 className="h-5 w-5 text-success-foreground" />
            </div>
            <p className="text-3xl font-bold text-success-foreground mt-2">{metrics.stablePatients}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* RECENT ALERTS */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-destructive" /> Recent Alerts
              </h2>
              <Link href="/doctor/alerts" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent alerts.</p>
            ) : (
              <ul className="space-y-3">
                {recentAlerts.map((alert: any) => (
                  <li key={alert.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/10">
                    <div>
                      <p className="text-sm font-semibold text-destructive">Critical Alert</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{alert.trigger}</p>
                    </div>
                    <Link href={`/doctor/patient/${alert.patientId}`} className="text-xs font-bold text-primary hover:underline">
                      Review
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* RECENT NOTES */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-primary" /> Recent Clinical Notes
            </h2>
            {recentNotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clinical notes saved yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentNotes.map((note: any) => (
                  <li key={note.id} className="p-3 border rounded-lg bg-muted/10">
                    <p className="text-xs font-bold text-foreground mb-1">Patient ID: {note.patientId.substring(0, 8)}</p>
                    <p className="text-xs text-muted-foreground italic line-clamp-2">"{note.rawData}"</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DoctorShell>
  );
}