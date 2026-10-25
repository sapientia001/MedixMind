"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense } from "react";
import {
  Home, MessageSquareText, ClipboardList, History, Watch, User,
  LayoutGrid, Users, TriangleAlert, FileText, Bell, Cross, ArrowLeft, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Language Switcher Component ---
export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split("/")[1] || "en";

  const toggleLanguage = () => {
    const newLocale = currentLocale === "en" ? "ru" : "en";
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary-soft transition-colors shadow-sm"
    >
      <Globe className="h-4 w-4" />
      {currentLocale === "en" ? "RU" : "EN"}
    </button>
  );
}

// --- Isolated Navigation Links (to fix usePathname Suspense error) ---
function NavLinks({ items, baseClass, activeClass }: { items: any[], baseClass: string, activeClass: string }) {
  const pathname = usePathname();
  
  return (
    <>
      {items.map(({ to, label, icon: Icon, ...rest }) => {
        const isActive = pathname === to;
        return (
          <Link key={label} href={to} className={cn(baseClass, isActive && activeClass)}>
            <Icon className="h-5 w-5" /> 
            {label}
            {"badge" in rest && (
              <span className="ml-auto grid h-5 w-5 place-items-center rounded-full bg-destructive text-[11px] font-bold text-white">
                {rest.badge}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-bold text-lg", light ? "text-white" : "text-foreground")}>
      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <Cross className="h-5 w-5" strokeWidth={3} />
      </span>
      MedixDeck
    </Link>
  );
}

const patientNav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chat", label: "Check-in", icon: MessageSquareText },
  { to: "/forms", label: "Forms", icon: ClipboardList },
  { to: "/history", label: "History", icon: History },
  { to: "/wearable", label: "Devices", icon: Watch },
  { to: "/doctor", label: "Doctor view", icon: User },
];

export function PatientShell({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b bg-card px-6">
        <Logo />
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {right ?? (
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Avatar initials="S" /> Sarah
            </div>
          )}
        </div>
      </header>
      <div className="flex">
        <nav className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[240px] shrink-0 flex-col gap-1 border-r bg-card p-4 md:flex">
          <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted rounded-xl mb-1" />}>
            <NavLinks 
              items={patientNav} 
              baseClass="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors text-muted-foreground hover:bg-muted" 
              activeClass="bg-primary-soft text-primary font-bold" 
            />
          </Suspense>
        </nav>
        <main className="min-w-0 flex-1 p-4 pb-24 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

const doctorNav = [
  { to: "/doctor", label: "Dashboard", icon: LayoutGrid },
  { to: "/doctor/patient", label: "Patients", icon: Users },
  { to: "/doctor/alerts", label: "Alerts", icon: TriangleAlert, badge: 3 },
  { to: "/doctor/patient", label: "Prescriptions", icon: FileText },
];

export function DoctorShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col bg-[#0c2340] p-5 md:flex">
        <Logo light />
        
        <nav className="mt-10 flex flex-col gap-1.5">
          <Suspense fallback={<div className="h-10 w-full animate-pulse bg-white/10 rounded-xl mb-1" />}>
            <NavLinks 
              items={doctorNav} 
              baseClass="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors text-slate-300 hover:bg-white/5 hover:text-white" 
              activeClass="bg-white/10 text-white font-bold" 
            />
          </Suspense>
        </nav>
        
        <Link href="/" className="mt-auto flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Patient app
        </Link>
      </aside>

      <div className="min-w-0 flex-1 bg-[#f4f7fb]">
        <header className="flex h-[72px] items-center justify-between bg-white px-8 border-b">
          <div className="md:hidden"><Logo /></div>
          <div className="ml-auto flex items-center gap-5">
            <LanguageSwitcher /> 
            <Link href="/doctor/alerts" className="relative text-muted-foreground hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-white" />
            </Link>
            <Avatar initials="DR" />
          </div>
        </header>
        
        <main className="p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary", className)}>
      {initials}
    </span>
  );
}

export function Sparkline({ data, color = "var(--chart-1)", height = 60, min, max, dots = true }:
  { data: number[]; color?: string; height?: number; min?: number; max?: number; dots?: boolean }) {
  const w = 300;
  const lo = min ?? Math.min(...data), hi = max ?? Math.max(...data);
  const pts = data.map((v, i) => [ (i / (data.length - 1)) * w, height - 4 - ((v - lo) / (hi - lo || 1)) * (height - 8) ]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${(x ?? 0).toFixed(1)},${(y ?? 0).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={w} y1={height * f} y2={height * f} stroke="var(--border)" strokeWidth="1" />)}
      <path d={d} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      {dots && pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill={color} />)}
    </svg>
  );
}

export function TrendCard({ title, data, color, axis, min, max }: { title: string; data: number[]; color: string; axis: string[]; min?: number; max?: number }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-xs font-bold text-foreground">{title}</p>
      <div className="mt-3 flex gap-2">
        <div className="flex flex-col justify-between text-[10px] text-muted-foreground">{axis.map((a) => <span key={a}>{a}</span>)}</div>
        <Sparkline data={data} color={color} height={70} min={min} max={max} />
      </div>
      <div className="mt-2 flex justify-between pl-6 text-[10px] text-muted-foreground"><span>Oct 1</span><span>Oct 14</span></div>
    </div>
  );
}

export const hrv = [72, 68, 66, 64, 63, 60, 58, 57, 55, 52, 50, 48, 47, 45];
export const eda = [5, 5.5, 6, 5.8, 6.5, 7, 6.8, 7.5, 8, 9, 10, 12, 11, 14];
export const temp = [36.6, 36.7, 36.6, 36.8, 36.7, 36.6, 36.8, 36.9, 36.7, 36.6, 36.7, 36.8, 36.6, 36.5];

export type Risk = "Critical" | "High" | "Medium" | "Low";
export const patients: { initials: string; name: string; meta: string; risk: Risk; type: string; status: string }[] = [
  { initials: "SJ", name: "Sarah Johnson", meta: "28 y, Female", risk: "Critical", type: "Chat", status: "Needs Review" },
  { initials: "MB", name: "Michael Brown", meta: "34 y, Male", risk: "High", type: "Form", status: "Monitoring" },
  { initials: "ED", name: "Emily Davis", meta: "22 y, Female", risk: "Medium", type: "Chat", status: "Stable" },
  { initials: "JW", name: "James Wilson", meta: "41 y, Male", risk: "Low", type: "Form", status: "Stable" },
  { initials: "OM", name: "Olivia Martinez", meta: "37 y, Female", risk: "Medium", type: "Chat", status: "Monitoring" },
  { initials: "DL", name: "Daniel Lee", meta: "29 y, Male", risk: "Low", type: "Form", status: "Stable" },
];

export const history = [
  { title: "Mental Health Check-in (Chat)", date: "Oct 12, 2025 · 09:24 AM" },
  { title: "Standard Form (PHQ-9)", date: "Oct 8, 2025 · 02:17 PM" },
  { title: "Mental Health Check-in (Chat)", date: "Oct 3, 2025 · 11:02 AM" },
];