"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Search, TriangleAlert, AlertCircle, X, Filter } from "lucide-react";
import { toast } from "sonner";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Avatar, DoctorShell, Risk } from "@/components/medix";
import { cn } from "@/lib/utils";

export type PatientData = {
  id: string;
  initials: string;
  name: string;
  accessCode: string | null;
  meta: string;
  risk: Risk;
  type: string;
  status: string;
  hasContradiction?: boolean;
  hasBipolar?: boolean;
};

type FilterType = "all" | "critical" | "bipolar" | "conflict";

export default function DoctorDashboardClient({ initialPatients }: { initialPatients: PatientData[] }) {
  const [q, setQ] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  
  const t = useTranslations("Doctor");
  
  const filteredList = initialPatients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(q.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === "critical" && p.risk !== "Critical") return false;
    if (activeFilter === "bipolar" && !p.hasBipolar) return false;
    if (activeFilter === "conflict" && !p.hasContradiction) return false;

    return true;
  });

  // TOUR LOGIC
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("medixmind-doctor-tour-seen");
    
    if (!hasSeenTour) {
      let utterance: SpeechSynthesisUtterance | null = null;

      const speak = (text: string, locale: string) => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          if (utterance) window.speechSynthesis.cancel();
          utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = locale === 'ru' ? 'ru-RU' : 'en-US';
          window.speechSynthesis.speak(utterance);
        }
      };

      const currentLocale = window.location.pathname.split("/")[1] || "ru";

      const driverObj = driver({
        showProgress: true,
        nextBtnText: "Далее",
        prevBtnText: "Назад",
        doneBtnText: "Завершить",
        steps: [
          {
            element: '[data-onboarding-id="doctor-title"]',
            popover: { title: "Список пациентов", description: "Это ваша главная панель управления. Здесь вы видите всех назначенных пациентов." },
            onHighlightStarted: () => speak("Список пациентов. Это ваша главная панель управления.", currentLocale)
          },
          {
            element: '[data-onboarding-id="doctor-search"]',
            popover: { title: "Поиск и фильтр", description: "Используйте фильтры, чтобы быстро найти критических пациентов или тех, у кого есть флаги." },
            onHighlightStarted: () => speak("Поиск и фильтр. Используйте фильтры, чтобы быстро найти критических пациентов.", currentLocale)
          }
        ],
        onDestroyed: () => {
          localStorage.setItem("medixmind-doctor-tour-seen", "true");
          if (window.speechSynthesis) window.speechSynthesis.cancel();
        }
      });

      driverObj.drive();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // POLLING FOR REAL-TIME ALERTS
  useEffect(() => {
    let lastAlertId = sessionStorage.getItem("lastShownAlertId");

    const checkAlerts = async () => {
      try {
        const res = await fetch('/api/alerts/check');
        const data = await res.json();
        
        if (data.hasAlert && data.alert.id !== lastAlertId) {
          lastAlertId = data.alert.id;
          sessionStorage.setItem("lastShownAlertId", data.alert.id);
          
          toast.error(
            <div className="flex flex-col gap-1">
              <span className="font-bold">КРИТИЧЕСКОЕ ОПОВЕЩЕНИЕ</span>
              <span className="text-xs">Пациент активировал флаг безопасности.</span>
            </div>,
            { duration: 10000, position: "top-center" }
          );
        }
      } catch (error) {}
    };
    
    checkAlerts();
    const interval = setInterval(checkAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const filters = [
    { id: "all", label: "Все пациенты" },
    { id: "critical", label: "Критические" },
    { id: "bipolar", label: "Биполярный флаг" },
    { id: "conflict", label: "Конфликты данных" },
  ];

  return (
    <DoctorShell>
      <div className="max-w-[1200px] mx-auto w-full">
        
        <div data-onboarding-id="doctor-title">
          <h1 className="text-lg md:text-[22px] font-bold text-foreground mb-5">{t("patientList")}</h1>
        </div>
        
        {/* SEARCH BAR */}
        <div data-onboarding-id="doctor-search" className="mb-4 flex gap-2 md:gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg border bg-white px-3 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search")}
              className="w-full bg-transparent py-2.5 text-sm outline-none"
            />
            {q && (
              <button onClick={() => setQ("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* QUICK FILTER BAR */}
        <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as FilterType)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors border",
                activeFilter === f.id 
                  ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                  : "bg-white text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="border rounded-xl bg-white shadow-sm overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b text-left text-[13px] font-bold text-foreground bg-muted/10">
                <th className="px-4 md:px-6 py-4">{t("patientName")}</th>
                <th className="px-4 md:px-6 py-4">Код доступа</th>
                <th className="px-4 md:px-6 py-4">{t("riskLevel")}</th>
                <th className="px-4 md:px-6 py-4">Флаги</th>
                <th className="px-4 md:px-6 py-4">{t("status")}</th>
                <th className="px-4 md:px-6 py-4">{t("action")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Нет пациентов, соответствующих вашему запросу.
                  </td>
                </tr>
              ) : (
                filteredList.map((p) => (
                  <tr key={p.id} className={cn("border-b last:border-0 transition-colors hover:bg-muted/10", p.risk === "Critical" && "bg-destructive-soft/40")}>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.risk === "Critical" && <TriangleAlert className="h-4 w-4 text-destructive animate-pulse" />}
                        <Avatar initials={p.initials} />
                        <div>
                          <p className="font-semibold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.meta}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 md:px-6 py-4">
                      {p.accessCode ? (
                        <span className="font-mono text-xs font-bold text-primary bg-primary-soft px-2 py-1 rounded-md">
                          {p.accessCode}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>

                    <td className="px-4 md:px-6 py-4">
                      <span className={cn("whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-bold", getRiskBadge(p.risk))}>
                        {p.risk === "Critical" ? t("criticalRisk") : p.risk === "High" ? t("highRisk") : p.risk}
                      </span>
                    </td>
                    
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {p.hasBipolar && (
                          <span className="inline-flex items-center gap-1 rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700 whitespace-nowrap">
                            <AlertCircle className="h-3 w-3" /> Биполярный флаг
                          </span>
                        )}
                        {p.hasContradiction && (
                          <span className="inline-flex items-center gap-1 rounded bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700 whitespace-nowrap">
                            <AlertCircle className="h-3 w-3" /> Конфликт
                          </span>
                        )}
                        {!p.hasBipolar && !p.hasContradiction && (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 md:px-6 py-4">
                      <span className={cn("rounded-md px-2.5 py-1 text-xs whitespace-nowrap", getStatusBadge(p.status))}>
                        {p.status === "Needs Review" ? t("needsReview") : p.status === "Monitoring" ? t("monitoring") : p.status === "Stable" ? t("stable") : p.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <Link href={`/doctor/patient/${p.id}`} className="rounded-lg border border-primary/30 px-3 md:px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary-soft transition-colors whitespace-nowrap">
                        {t("view")}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DoctorShell>
  );
}