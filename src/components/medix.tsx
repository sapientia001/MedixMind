"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Home, MessageSquareText, ClipboardList, History, Watch, User,
  LayoutGrid, Users, TriangleAlert, Bell, Cross, ArrowLeft, Calendar, LogOut, Stethoscope, Menu, X,
  Server, Database, UserPlus, MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

const RussianFlag = () => (
  <svg viewBox="0 0 640 480" className="h-4 w-6 rounded-sm object-cover shadow-sm border border-gray-300">
    <path fill="#fff" d="M0 0h640v160H0z"/>
    <path fill="#0039a6" d="M0 160h640v160H0z"/>
    <path fill="#d52b1e" d="M0 320h640v160H0z"/>
  </svg>
);

const BritishFlag = () => (
  <svg viewBox="0 0 640 480" className="h-4 w-6 rounded-sm object-cover shadow-sm border border-gray-300">
    <path fill="#012169" d="M0 0h640v480H0z"/>
    <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
    <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
    <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
    <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
  </svg>
);

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split("/")[1] || "ru";

  const switchLanguage = (newLocale: string) => {
    if (newLocale === currentLocale) return;
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1.5 rounded-lg border bg-white p-1 shadow-sm">
      {currentLocale === "ru" ? <RussianFlag /> : <BritishFlag />}
      
      <div className="flex items-center bg-muted rounded-md p-0.5 ml-1">
        <button
          onClick={() => switchLanguage("ru")}
          className={cn(
            "px-2 py-1 text-[10px] sm:text-xs font-bold rounded-sm transition-all",
            currentLocale === "ru" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          RU
        </button>
        <button
          onClick={() => switchLanguage("en")}
          className={cn(
            "px-2 py-1 text-[10px] sm:text-xs font-bold rounded-sm transition-all",
            currentLocale === "en" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          EN
        </button>
      </div>
    </div>
  );
}

function NavLinks({ items, onClick }: { items: any[], onClick?: () => void }) {
  const pathname = usePathname();
  const tNav = useTranslations("Nav");
  const tAdmin = useTranslations("Admin");
  const currentLocale = pathname.split("/")[1] || "ru";
  
  return (
    <>
      {items.map(({ to, labelKey, adminKey, icon: Icon, ...rest }) => {
        const finalTo = to === "/" ? `/${currentLocale}` : to;
        const isActive = pathname === finalTo;
        const displayLabel = adminKey ? tAdmin(adminKey) : labelKey ? tNav(labelKey) : "";
        
        return (
          <Link key={finalTo + displayLabel} href={finalTo} onClick={onClick} className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
            isActive ? "bg-primary-soft text-primary font-bold" : "text-muted-foreground hover:bg-muted"
          )}>
            <Icon className="h-5 w-5" /> 
            {displayLabel}
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

export function Logo({ 
  light, 
  href, 
  hideTextMobile 
}: { 
  light?: boolean; 
  href?: string; 
  hideTextMobile?: boolean 
}) {
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "ru";
  
  // Default to the current locale root if no href is provided
  const finalHref = href || `/${currentLocale}`;

  return (
    <Link href={finalHref} className={cn("flex items-center gap-2 font-bold text-lg", light ? "text-white" : "text-foreground")}>
      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm shrink-0">
        <Cross className="h-5 w-5" strokeWidth={3} />
      </span>
      <span className={hideTextMobile ? "hidden sm:inline" : ""}>MedixMind</span>
    </Link>
  );
}

const patientNav = [
  { to: "/", labelKey: "home", icon: Home },
  { to: "/chat", labelKey: "checkin", icon: MessageSquareText },
  { to: "/messages", labelKey: "messages", icon: MessageSquare },
  { to: "/forms", labelKey: "forms", icon: ClipboardList },
  { to: "/history", labelKey: "history", icon: History },
  { to: "/wearable", labelKey: "devices", icon: Watch },
];

export function PatientShell({ 
  children, 
  right, 
  doctorName 
}: { 
  children: ReactNode; 
  right?: ReactNode; 
  doctorName?: string 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "ru";
  const t = useTranslations("Nav");

  const handleLogout = () => {
    router.push(`/${currentLocale}/login`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 flex h-[72px] items-center justify-between border-b bg-card px-4 md:px-6">
        
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-1 -ml-1 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div data-onboarding-id="patient-header">
            <Logo href={`/${currentLocale}`} hideTextMobile />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {right ? (
            right
          ) : (
            <>
              <LanguageSwitcher />
              <div className="hidden md:flex items-center gap-3 border-l pl-4">
                {doctorName && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <span>{t("dr")} {doctorName}</span>
                  </div>
                )}
                <button onClick={handleLogout} className="flex items-center gap-1 text-xs font-semibold text-destructive hover:underline">
                  <LogOut className="h-4 w-4" /> {t("logout")}
                </button>
              </div>
            </>
          )}
        </div>
      </header>
      
      <div className="flex flex-1 relative pt-[72px]">
        <nav className="fixed top-[72px] bottom-0 left-0 hidden w-[240px] shrink-0 flex-col gap-1 border-r bg-card p-4 md:flex">
          <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted rounded-xl mb-1" />}>
            <NavLinks items={patientNav} />
          </Suspense>
        </nav>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-[72px] z-40 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <nav className="w-[250px] h-full bg-card p-4 flex flex-col gap-1 shadow-xl" onClick={e => e.stopPropagation()}>
              <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted rounded-xl mb-1" />}>
                <NavLinks items={patientNav} onClick={() => setIsMobileMenuOpen(false)} />
              </Suspense>
              <div className="mt-auto pt-4 border-t">
                 <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10">
                    <LogOut className="h-5 w-5" /> {t("logout")}
                 </button>
              </div>
            </nav>
          </div>
        )}

        <main className="w-full max-w-7xl mx-auto p-4 md:p-8 md:pl-[272px]">
          {children}
        </main>
      </div>
    </div>
  );
}

const doctorNav = [
  { to: "/doctor", labelKey: "dashboard", icon: LayoutGrid },
  { to: "/doctor/patients", labelKey: "patients", icon: Users },
  { to: "/doctor/messages", labelKey: "messages", icon: MessageSquare },
  { to: "/doctor/add-patient", labelKey: "addPatient", icon: UserPlus },
  { to: "/doctor/appointments", labelKey: "appointments", icon: Calendar },
  { to: "/doctor/alerts", labelKey: "alerts", icon: TriangleAlert, badge: 3 },
];

export function DoctorShell({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "ru";
  const t = useTranslations("Nav");

  const handleLogout = () => {
    router.push(`/${currentLocale}/login`);
  };

  return (
    <div className="flex min-h-screen bg-background w-full">
      <aside className="fixed top-0 bottom-0 left-0 hidden h-screen w-[260px] shrink-0 flex-col bg-[#0c2340] p-5 md:flex z-40">
        <Logo light href={`/${currentLocale}/doctor`} />
        <nav className="mt-10 flex flex-col gap-1.5">
          <Suspense fallback={<div className="h-10 w-full animate-pulse bg-white/10 rounded-xl mb-1" />}>
            <NavLinks items={doctorNav} />
          </Suspense>
        </nav>
        <button onClick={handleLogout} className="mt-auto flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors">
          <LogOut className="h-4 w-4" /> {t("logout")}
        </button>
      </aside>

      <div className="min-w-0 flex-1 bg-[#f4f7fb] flex flex-col md:pl-[260px]">
        <header className="fixed top-0 right-0 left-0 md:left-[260px] z-40 flex h-[72px] items-center justify-between bg-white px-4 md:px-8 border-b">
          
          <div className="flex items-center gap-3">
             <button 
                className="md:hidden p-1 -ml-1 text-foreground"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="md:hidden">
                <Logo href={`/${currentLocale}/doctor`} hideTextMobile />
              </div>
          </div>
          
          <div className="ml-auto flex items-center gap-3 md:gap-5">
            <LanguageSwitcher /> 
            <Link href={`/${currentLocale}/doctor/alerts`} className="relative text-muted-foreground hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-white" />
            </Link>
            <Avatar initials="DR" />
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-[72px] z-30 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <nav className="w-[260px] h-full bg-[#0c2340] p-5 flex flex-col gap-1 shadow-xl" onClick={e => e.stopPropagation()}>
              <Suspense fallback={<div className="h-10 w-full animate-pulse bg-white/10 rounded-xl mb-1" />}>
                <NavLinks items={doctorNav} onClick={() => setIsMobileMenuOpen(false)} />
              </Suspense>
              <button onClick={handleLogout} className="mt-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                <LogOut className="h-5 w-5" /> {t("logout")}
              </button>
            </nav>
          </div>
        )}
        
        <main className="w-full max-w-7xl mx-auto flex-1 p-4 md:p-8 pt-[88px] md:pt-[104px]">
          {children}
        </main>
      </div>
    </div>
  );
}

// --- ADMIN SHELL ---
const adminNav = [
  { to: "/admin", adminKey: "title", icon: Server },
  { to: "/admin/users", adminKey: "userManagement", icon: Users },
  { to: "/admin/logs", adminKey: "auditLogs", icon: Database },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "ru";
  const tAdmin = useTranslations("Admin");

  const handleLogout = () => {
    router.push(`/${currentLocale}/login`);
  };

  return (
    <div className="flex min-h-screen bg-background w-full">
      <aside className="fixed top-0 bottom-0 left-0 hidden h-screen w-[260px] shrink-0 flex-col bg-[#111827] p-5 md:flex z-40">
        <div className="flex items-center gap-2 font-bold text-lg text-white mb-10">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-indigo-500 text-white shadow-sm">
            <Server className="h-5 w-5" />
          </span>
          MedixAdmin
        </div>
        
        <nav className="flex flex-col gap-1.5">
          <Suspense fallback={<div className="h-10 w-full animate-pulse bg-white/10 rounded-xl mb-1" />}>
            <NavLinks items={adminNav} />
          </Suspense>
        </nav>
        
        <button onClick={handleLogout} className="mt-auto flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-white transition-colors">
          <LogOut className="h-4 w-4" /> Exit Admin
        </button>
      </aside>

      <div className="min-w-0 flex-1 bg-[#f4f7fb] flex flex-col md:pl-[260px]">
        <header className="flex h-[72px] items-center justify-between bg-white px-4 md:px-8 border-b">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-1 -ml-1 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h1 className="text-lg font-bold text-foreground hidden md:block">{tAdmin("title")}</h1>
            <span className="md:hidden font-bold text-slate-900 flex items-center gap-2">
               <Server className="h-5 w-5 text-indigo-500" /> MedixAdmin
            </span>
          </div>
          
          <div className="ml-auto flex items-center gap-5">
            <LanguageSwitcher /> 
            <Avatar initials="AD" />
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-[72px] z-30 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <nav className="w-[260px] h-full bg-[#111827] p-5 flex flex-col gap-1 shadow-xl" onClick={e => e.stopPropagation()}>
              <Suspense fallback={<div className="h-10 w-full animate-pulse bg-white/10 rounded-xl mb-1" />}>
                <NavLinks items={adminNav} onClick={() => setIsMobileMenuOpen(false)} />
              </Suspense>
              <button onClick={handleLogout} className="mt-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                <LogOut className="h-5 w-5" /> Exit Admin
              </button>
            </nav>
          </div>
        )}
        
        <main className="w-full max-w-7xl mx-auto flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span className={cn("grid h-8 w-8 md:h-9 md:w-9 shrink-0 place-items-center rounded-full bg-primary-soft text-[10px] md:text-xs font-bold text-primary", className)}>
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