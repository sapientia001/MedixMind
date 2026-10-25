"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { TrendCard, eda, hrv, temp, DoctorShell } from "@/components/medix";
import { cn } from "@/lib/utils";

const tabs = ["Overview", "Physiological Data", "Medications", "History"];

export default function PatientProfile() {
  const [tab, setTab] = useState("Overview");

  return (
    <DoctorShell>
      <div className="mx-auto max-w-5xl space-y-4">
        <Link href="/doctor" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Patients
        </Link>
        
        <div className="card-surface p-6">
          <div className="flex flex-wrap items-center gap-4 border-b pb-5">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-xl font-bold text-primary">SJ</span>
            <div>
              <p className="text-xl font-bold text-foreground">Sarah Johnson</p>
              <p className="text-xs text-muted-foreground mt-0.5">28 y, Female · ID: MD-00124</p>
            </div>
            <span className="ml-auto flex items-center gap-2 rounded-lg bg-destructive-soft px-3 py-1.5 text-sm font-bold text-destructive">
              <TriangleAlert className="h-4 w-4" /> High Risk
            </span>
          </div>

          <div className="mt-4 flex gap-2 border-b overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "whitespace-nowrap px-4 py-2.5 text-xs font-medium transition-colors border-b-2",
                  tab === t ? "border-primary font-bold text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Overview" && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">Clinical Scores</h3>
                <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                  <div className="rounded-xl bg-destructive-soft p-4 text-destructive border border-destructive/20">
                    <p className="text-xs font-bold">PHQ-9</p>
                    <p className="text-3xl font-extrabold mt-1">18</p>
                    <p className="text-xs font-medium mt-1">(Moderate-Severe)</p>
                  </div>
                  <div className="rounded-xl border p-4 bg-muted/10">
                    <p className="text-xs font-bold text-foreground">AI-Extracted Symptoms</p>
                    <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground space-y-1">
                      <li>Insomnia</li>
                      <li>Low mood</li>
                      <li>Anxiety</li>
                      <li>Reduced concentration</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">
                  Physiological Trends <span className="font-normal text-muted-foreground">(Last 14 Days)</span>
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <TrendCard title="HRV (ms)" data={hrv} color="var(--chart-1)" axis={["80", "60", "40", "20"]} min={20} max={80} />
                  <TrendCard title="EDA (µS)" data={eda} color="var(--chart-2)" axis={["15", "10", "5", "0"]} min={0} max={15} />
                  <TrendCard title="Skin Temp (°C)" data={temp} color="var(--chart-3)" axis={["37.5", "37.0", "36.5", "36.0"]} min={36} max={37.5} />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
                <div className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-3 text-xs font-bold text-destructive-foreground shadow-sm">
                  <TriangleAlert className="h-4 w-4" /> MANDATORY: Psychiatric Referral Recommended
                </div>
                <div className="flex items-center justify-center rounded-lg bg-warning-soft px-4 py-3 text-xs font-bold text-warning-foreground border border-warning/20">
                  Desirable: CBT Therapy
                </div>
              </div>
            </div>
          )}

          {tab === "Medications" && (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground">Medication</h3>
              <div className="grid gap-4 rounded-xl border p-4 text-xs md:grid-cols-[160px_1fr_1fr] bg-card shadow-sm">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-bold text-foreground">Aviandr</p>
                  <p className="text-muted-foreground mt-0.5">(antidepressant)</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">Russian State Register Indications:</p>
                  <ul className="mt-2 list-inside list-disc text-muted-foreground space-y-1">
                    <li>Major depressive disorder</li>
                    <li>Generalized anxiety disorder</li>
                    <li>Panic disorder</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-foreground">Contraindications:</p>
                  <ul className="mt-2 list-inside list-disc text-muted-foreground space-y-1">
                    <li>Hypersensitivity</li>
                    <li>Severe liver impairment</li>
                    <li>Pregnancy (in 3rd trimester)</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => toast.success("Prescription confirmed for Sarah Johnson")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                <ShieldCheck className="h-4 w-4" /> Confirm & Prescribe
              </button>
              <p className="text-center text-[10px] text-muted-foreground pt-1">
                Note: The AI does not prescribe autonomously. All prescriptions require doctor confirmation.
              </p>
            </div>
          )}
          
          {tab === "Physiological Data" && <div className="mt-6 text-sm text-muted-foreground">Detailed metrics coming soon.</div>}
          {tab === "History" && <div className="mt-6 text-sm text-muted-foreground">Patient history coming soon.</div>}
        </div>
      </div>
    </DoctorShell>
  );
}