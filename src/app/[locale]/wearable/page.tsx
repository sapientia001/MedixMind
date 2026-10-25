"use client";

import { useState } from "react";
import { CheckCircle2, TriangleAlert, Watch } from "lucide-react";
import { toast } from "sonner";
import { PatientShell, TrendCard, eda, hrv, temp } from "@/components/medix";
import { cn } from "@/lib/utils";

const tabs = ["Overview", "EDA", "HRV", "Temperature"] as const;
const edaSpike = [5, 6, 5.5, 7, 6, 7.5, 6.5, 8, 7, 18, 9, 8, 10, 9];

export default function Wearable() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("EDA");
  const [sync, setSync] = useState("10:24 AM");

  const handleSync = () => {
    setSync(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    toast.success("Wearable data synced successfully");
  };

  return (
    <PatientShell>
      <div className="border rounded-xl bg-card mx-auto max-w-5xl p-5 shadow-sm">
        <h1 className="text-lg font-bold">Wearable Data</h1>
        
        {/* Device Status Bar */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm border-b pb-4">
          <Watch className="h-6 w-6 text-primary" />
          <span className="font-semibold">Galaxy Watch</span>
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
            <CheckCircle2 className="h-3 w-3" /> Connected
          </span>
          <span className="ml-auto text-xs text-muted-foreground">Last sync: {sync}</span>
          <button 
            onClick={handleSync}
            className="rounded-md border border-primary/40 px-3 py-1 text-xs text-primary hover:bg-primary/5 transition-colors"
          >
            Sync Now
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-1 border-b overflow-x-auto">
          {tabs.map((t) => (
            <button 
              key={t} 
              onClick={() => setTab(t)} 
              className={cn(
                "whitespace-nowrap px-4 py-2 text-xs transition-colors", 
                tab === t ? "border-b-2 border-primary font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Graphs */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(tab === "Overview" || tab === "EDA") && (
            <TrendCard 
              title="EDA (Electrodermal Activity)" 
              data={edaSpike} 
              color="#f97316" // Orange
              axis={["20", "15", "10", "5", "0"]} 
              min={0} 
              max={20} 
            />
          )}
          
          {(tab === "Overview" || tab === "HRV" || tab === "EDA") && (
            <TrendCard 
              title="HRV (ms)" 
              data={hrv} 
              color="hsl(var(--primary))" 
              axis={["80", "60", "40", "20"]} 
              min={20} 
              max={80} 
            />
          )}
          
          {(tab === "Overview" || tab === "Temperature") && (
            <TrendCard 
              title="Skin Temp (°C)" 
              data={temp} 
              color="#eab308" // Yellow
              axis={["37.5", "37.0", "36.5", "36.0"]} 
              min={36} 
              max={37.5} 
            />
          )}
          
          {tab === "Temperature" && (
            <TrendCard 
              title="EDA (µS)" 
              data={eda} 
              color="#f97316" 
              axis={["15", "10", "5", "0"]} 
              min={0} 
              max={15} 
            />
          )}
        </div>

        {/* Clinical Alert Note */}
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive shadow-sm">
          <TriangleAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Physiological Alert Detected</p>
            <p className="text-xs mt-1 opacity-90">
              Elevated Skin Conductance Level (SCL) detected in the early morning. This correlates with your self-reported insomnia and triggers a safety flag for your clinician to review.
            </p>
          </div>
        </div>
        
      </div>
    </PatientShell>
  );
}