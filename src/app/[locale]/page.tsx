"use client";

import Link from "next/link";
import { Mic, MessageCircle, ClipboardList, Keyboard, Heart, Thermometer, Watch, CheckCircle2, MessageSquareText, Sprout, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Sparkline, hrv, history, PatientShell } from "@/components/medix";

export function HistoryList() {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-foreground">Recent History</h2>
        <Link href="/history" className="text-[11px] font-semibold text-primary hover:underline">View All</Link>
      </div>
      <ul className="space-y-2">
        {history.map((h, i) => (
          <li key={i} className="flex items-center gap-3 bg-card border rounded-xl p-3 shadow-sm">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-primary">
              <MessageSquareText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{h.title}</p>
              <p className="text-[11px] text-muted-foreground">{h.date}</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success-foreground">
              <CheckCircle2 className="h-3 w-3" /> Completed
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Index() {
  return (
    <PatientShell>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="relative mb-2">
            <h1 className="text-2xl font-bold text-foreground">Welcome, Sarah</h1>
            <p className="text-sm text-muted-foreground mt-1">Your mental health matters.<br/>We're here for you.</p>
            <Sprout className="absolute right-4 top-0 h-14 w-14 text-success opacity-80" />
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Chat Card */}
            <div className="flex flex-col items-center rounded-2xl bg-gradient-primary p-5 text-center text-primary-foreground shadow-card">
              <div className="flex gap-2 mb-2"><Mic className="h-7 w-7" /><MessageCircle className="h-7 w-7" /></div>
              <h2 className="text-[15px] font-bold leading-tight">Start Conversational<br/>Check-in</h2>
              <p className="mt-2 text-[11px] opacity-90 px-2">Talk to our AI assistant using your voice or text.</p>
              <div className="mt-4 flex gap-2 w-full">
                <Link href="/chat" className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/20 px-2 py-2 text-xs font-semibold hover:bg-white/30 transition-colors"><Mic className="h-3.5 w-3.5" />Voice</Link>
                <Link href="/chat" className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/20 px-2 py-2 text-xs font-semibold hover:bg-white/30 transition-colors"><Keyboard className="h-3.5 w-3.5" />Text</Link>
              </div>
            </div>

            {/* Form Card */}
            <div className="card-surface flex flex-col items-center p-5 text-center">
              <ClipboardList className="h-8 w-8 text-primary mb-2" />
              <h2 className="text-[15px] font-bold text-foreground">Fill Standard Form</h2>
              <p className="mt-2 text-[11px] text-muted-foreground px-2">Complete validated mental health questionnaires (e.g. PHQ-9, GAD-7).</p>
              <Link href="/forms" className="mt-4 w-full rounded-lg border border-primary text-primary px-4 py-2 text-xs font-semibold hover:bg-primary-soft transition-colors">Get Started</Link>
            </div>
          </div>
          
          <HistoryList />
        </div>

        {/* Wearable Device Sidebar */}
        <div className="card-surface h-fit p-5">
          <h2 className="text-sm font-bold text-foreground">Wearable Device</h2>
          <Link href="/wearable" className="mt-3 flex items-center gap-3 group">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-foreground text-background"><Watch className="h-5 w-5" /></span>
            <div>
              <p className="text-sm font-semibold group-hover:text-primary transition-colors">Connected</p>
              <p className="text-[11px] text-success-foreground font-medium">(Galaxy Watch)</p>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
          
          <div className="mt-5 space-y-4 text-sm border-b pb-4">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-destructive" />
              <div><p className="text-[11px] text-muted-foreground">Heart Rate</p><p className="font-bold text-foreground">72 bpm</p></div>
            </div>
            <div className="flex items-center gap-3">
              <Thermometer className="h-5 w-5 text-destructive" />
              <div><p className="text-[11px] text-muted-foreground">Skin Temperature</p><p className="font-bold text-foreground">36.5°C</p></div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-1"><span className="text-muted-foreground">HRV (ms)</span><span className="font-bold text-foreground">48</span></div>
              <Sparkline data={hrv.map((v, i) => v + (i % 2 ? 4 : -3))} height={40} color="var(--primary)" />
            </div>
          </div>
          <button onClick={() => toast.success("Wearable data synced")} className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
            Sync Now
          </button>
        </div>
      </div>
    </PatientShell>
  );
}