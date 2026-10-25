"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Filter, Search, TriangleAlert } from "lucide-react";
import { Avatar, DoctorShell, patients, Risk } from "@/components/medix";
import { cn } from "@/lib/utils";

// Inner component to handle the actual dashboard logic
function DoctorDashboardContent() {
  const [q, setQ] = useState("");
  const list = patients.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const getRiskBadge = (risk: Risk) => {
    switch (risk) {
      case "Critical": return "bg-destructive text-white";
      case "High": return "bg-[#f59e0b] text-white";
      case "Medium": return "bg-[#fef08a] text-[#854d0e]";
      case "Low": return "bg-[#bbf7d0] text-[#166534]";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Needs Review": return "text-destructive font-medium";
      case "Monitoring": return "bg-[#dcfce7] text-[#166534]";
      case "Stable": return "bg-[#dcfce7] text-[#166534]";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <h1 className="text-[22px] font-bold text-foreground mb-5">Patient List</h1>
      
      <div className="mb-5 flex gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border bg-white px-3 shadow-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search patients..."
            className="w-full bg-transparent py-2.5 text-sm outline-none"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border bg-white px-4 text-sm font-medium text-primary shadow-sm hover:bg-muted/30 transition-colors">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[13px] font-bold text-foreground bg-muted/10">
              <th className="px-6 py-4">Patient Name</th>
              <th className="px-6 py-4">Risk Level</th>
              <th className="px-6 py-4">Assessment Type</th>
              <th className="px-6 py-4">Physio Status</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.name} className={cn("border-b last:border-0 transition-colors hover:bg-muted/10", p.risk === "Critical" && "bg-destructive-soft/40")}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {p.risk === "Critical" && <TriangleAlert className="h-4 w-4 text-destructive" />}
                    <Avatar initials={p.initials} />
                    <div>
                      <p className="font-semibold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.meta}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn("rounded-md px-2.5 py-1 text-xs font-bold", getRiskBadge(p.risk))}>
                    {p.risk}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">{p.type}</td>
                <td className="px-6 py-4">
                  <span className={cn("inline-block h-2.5 w-2.5 rounded-full", p.risk === "Critical" ? "bg-destructive" : "bg-[#22c55e]")} />
                </td>
                <td className="px-6 py-4">
                  <span className={cn("rounded-md px-2.5 py-1 text-xs", getStatusBadge(p.status))}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link href="/doctor/patient" className="rounded-lg border border-primary/30 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary-soft transition-colors">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main export wrapping the content in Suspense
export default function DoctorDashboard() {
  return (
    <DoctorShell>
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>}>
        <DoctorDashboardContent />
      </Suspense>
    </DoctorShell>
  );
}