"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mic, MessageCircle, ClipboardList, Keyboard, Heart, Thermometer, Watch, CheckCircle2, MessageSquareText, Sprout, ChevronRight, ShieldAlert, AlertCircle, Camera, FileText } from "lucide-react";
import { toast } from "sonner";
import { Sparkline, hrv, PatientShell } from "@/components/medix";

type RecentRecord = {
  id: string;
  type: string;
  createdAt: Date;
};

export function HistoryList({ records }: { records: RecentRecord[] }) {
  const t = useTranslations("Patient");
  
  const getRecordMeta = (type: string) => {
    switch (type) {
      case "chat":
        return { title: t("historyChat"), icon: <MessageSquareText className="h-4 w-4" /> };
      case "form_phq9":
        return { title: t("historyForm"), icon: <ClipboardList className="h-4 w-4" /> };
      case "photo":
        return { title: "Фото-анализ", icon: <Camera className="h-4 w-4" /> };
      default:
        return { title: "Оценка", icon: <ClipboardList className="h-4 w-4" /> };
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="mt-6 w-full max-w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-foreground">{t("recentHistory")}</h2>
        <Link href="/history" className="text-[11px] font-semibold text-primary hover:underline whitespace-nowrap">{t("viewAll")}</Link>
      </div>
      <ul className="space-y-2 w-full">
        {records.length === 0 ? (
          <li className="p-4 text-center text-sm text-muted-foreground bg-card border rounded-xl shadow-sm">
            У вас пока нет истории оценок.
          </li>
        ) : (
          records.map((h, i) => {
            const meta = getRecordMeta(h.type);
            return (
              <li key={h.id} className="flex items-center gap-3 bg-card border rounded-xl p-3 shadow-sm w-full min-w-0">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                  {meta.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{meta.title}</p>
                  <p className="text-[11px] text-muted-foreground">{formatDate(h.createdAt)}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold text-success-foreground">
                  <CheckCircle2 className="h-3 w-3" /> {t("completed")}
                </span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

export default function ClientDashboard({ 
  doctorName, 
  patientData,
  recentRecords = []
}: { 
  doctorName: string; 
  patientData: { hasCriticalAlert: boolean; hasBipolar: boolean; hasConflict: boolean } | null;
  recentRecords?: RecentRecord[];
}) {
  const t = useTranslations("Patient");

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("medixmind-tour-seen");
    
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
        nextBtnText: t("tourNext"),
        prevBtnText: t("tourBack"),
        doneBtnText: t("tourFinish"),
        steps: [
          {
            element: '[data-onboarding-id="patient-header"]',
            popover: { title: t("tourHeaderTitle"), description: t("tourHeaderDesc") },
            onHighlightStarted: () => speak(`${t("tourHeaderTitle")}. ${t("tourHeaderDesc")}`, currentLocale)
          },
          {
            element: '[data-onboarding-id="patient-chat-card"]',
            popover: { title: t("tourChatTitle"), description: t("tourChatDesc") },
            onHighlightStarted: () => speak(`${t("tourChatTitle")}. ${t("tourChatDesc")}`, currentLocale)
          },
          {
            element: '[data-onboarding-id="patient-form-card"]',
            popover: { title: t("tourFormTitle"), description: t("tourFormDesc") },
            onHighlightStarted: () => speak(`${t("tourFormTitle")}. ${t("tourFormDesc")}`, currentLocale)
          },
          {
            element: '[data-onboarding-id="patient-wearable-card"]',
            popover: { title: t("tourWearableTitle"), description: t("tourWearableDesc") },
            onHighlightStarted: () => speak(`${t("tourWearableTitle")}. ${t("tourWearableDesc")}`, currentLocale)
          }
        ],
        onDestroyed: () => {
          localStorage.setItem("medixmind-tour-seen", "true");
          if (window.speechSynthesis) window.speechSynthesis.cancel();
        }
      });

      driverObj.drive();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCritical = patientData?.hasCriticalAlert || patientData?.hasBipolar;
  const hasWarning = patientData?.hasConflict;

  return (
    <PatientShell doctorName={doctorName}>
      <div className="grid w-full max-w-full gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4 w-full max-w-full min-w-0">
          
          {isCritical && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive bg-destructive/10 p-4 text-destructive shadow-sm">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="text-sm font-bold">ТРЕБУЕТСЯ ВНИМАНИЕ</h4>
                <p className="text-xs mt-1 leading-relaxed">
                  Ваши последние данные активировали клинический флаг. Ваш врач был уведомлен и скоро ознакомится с вашим профилем.
                  {patientData?.hasBipolar && " Пожалуйста, обратите внимание, что перед назначением некоторых лекарств требуется проверка стабилизаторов настроения."}
                </p>
              </div>
            </div>
          )}

          {hasWarning && !isCritical && (
            <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-soft/50 p-4 text-warning-foreground shadow-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Обнаружено противоречие в данных</h4>
                <p className="text-xs mt-1 leading-relaxed">
                  Мы заметили расхождение между вашей текущей проверкой и прошлыми медицинскими записями. Ваш врач прояснит это на следующем приеме.
                </p>
              </div>
            </div>
          )}

          <div className="relative mb-2 w-full pr-14">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("welcome")}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t("subtitle").split(". ").map((line, i) => (
                  <span key={i}>{line}.<br/></span>
                ))}
              </p>
            </div>
            <Sprout className="absolute right-0 top-0 h-12 w-12 text-success opacity-80" />
          </div>
          
          <div className="grid w-full max-w-full gap-4 sm:grid-cols-2">
            
            <div 
              data-onboarding-id="patient-chat-card"
              className="flex flex-col items-center rounded-2xl bg-gradient-primary p-5 text-center text-primary-foreground shadow-card w-full max-w-full"
            >
              <div className="flex gap-2 mb-2"><Mic className="h-7 w-7" /><MessageCircle className="h-7 w-7" /></div>
              <h2 className="text-[15px] font-bold leading-tight">{t("startChat")}</h2>
              <p className="mt-2 text-[11px] opacity-90 px-2">{t("chatDesc")}</p>
              
              <div className="mt-4 flex gap-2 w-full max-w-full">
                <Link href="/chat" className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/20 px-1 sm:px-2 py-2 text-[11px] sm:text-xs font-semibold hover:bg-white/30 transition-colors">
                  <Mic className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{t("voice")}</span>
                </Link>
                <Link href="/chat" className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/20 px-1 sm:px-2 py-2 text-[11px] sm:text-xs font-semibold hover:bg-white/30 transition-colors">
                  <Keyboard className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{t("text")}</span>
                </Link>
              </div>
            </div>

            <div 
              data-onboarding-id="patient-form-card"
              className="card-surface flex flex-col items-center p-5 text-center w-full max-w-full"
            >
              <ClipboardList className="h-8 w-8 text-primary mb-2" />
              <h2 className="text-[15px] font-bold text-foreground">{t("fillForm")}</h2>
              <p className="mt-2 text-[11px] text-muted-foreground px-2">{t("formDesc")}</p>
              <Link href="/forms" className="mt-4 w-full max-w-full rounded-lg border border-primary text-primary px-2 py-2 text-xs font-semibold hover:bg-primary-soft transition-colors">
                {t("getStarted")}
              </Link>
            </div>
          </div>
          
          {/* REAL DATA HISTORY LIST */}
          <HistoryList records={recentRecords} />
        </div>

        <div 
          data-onboarding-id="patient-wearable-card"
          className="card-surface h-fit p-5 w-full max-w-full min-w-0"
        >
          <h2 className="text-sm font-bold text-foreground">{t("wearable")}</h2>
          <Link href="/wearable" className="mt-3 flex items-center gap-3 group w-full max-w-full">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground text-background"><Watch className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold group-hover:text-primary transition-colors truncate">{t("connected")}</p>
              <p className="text-[11px] text-success-foreground font-medium truncate">(Galaxy Watch)</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
          
          <div className="mt-5 space-y-4 text-sm border-b pb-4 w-full">
            <div className="flex items-center gap-3 w-full">
              <Heart className="h-5 w-5 text-destructive shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">{t("heartRate")}</p>
                <p className="font-bold text-foreground truncate">72 {t("bpm")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full">
              <Thermometer className="h-5 w-5 text-destructive shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground truncate">{t("skinTemp")}</p>
                <p className="font-bold text-foreground truncate">36.5{t("celsius")}</p>
              </div>
            </div>
            <div className="w-full">
              <div className="flex justify-between text-[11px] mb-1 w-full">
                <span className="text-muted-foreground">HRV (ms)</span>
                <span className="font-bold text-foreground">48</span>
              </div>
              <div className="w-full overflow-hidden">
                <Sparkline data={hrv.map((v, i) => v + (i % 2 ? 4 : -3))} height={40} color="var(--primary)" />
              </div>
            </div>
          </div>
          <button onClick={() => toast.success("Данные устройства синхронизированы")} className="mt-4 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
            {t("sync")}
          </button>
        </div>
      </div>
    </PatientShell>
  );
}