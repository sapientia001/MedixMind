"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { TriangleAlert, X, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { DoctorShell } from "@/components/medix";
import { cn } from "@/lib/utils";

type AlertData = {
  id: string;
  patientId: string;
  patientName: string | null;
  trigger: string;
  severity: string;
  isRead: boolean | null;
  createdAt: Date | null;
};

export default function ClientAlerts({ initialAlerts = [] }: { initialAlerts?: AlertData[] }) {
  const router = useRouter();
  const t = useTranslations("Doctor");
  
  const [alerts, setAlerts] = useState<AlertData[]>(initialAlerts);
  
  const latestUnread = alerts.find(a => !a.isRead);
  const [open, setOpen] = useState(!!latestUnread);
  const [activeAlert, setActiveAlert] = useState<AlertData | null>(latestUnread || null);

  const handleReview = (patientId: string) => {
    setOpen(false);
    router.push(`/doctor/patient/${patientId}`); 
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      const res = await fetch("/api/alerts/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isRead: true } : a));
      setOpen(false);
      toast.success("Оповещение подтверждено. Записано в аудит.");
    } catch (error) {
      toast.error("Не удалось подтвердить оповещение.");
    }
  };

  return (
    <DoctorShell>
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-[22px] font-bold text-foreground mb-5">Центр оповещений</h1>
        
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          {alerts.length === 0 ? (
            <div className="p-16 text-center">
              <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4 opacity-40" />
              <h2 className="text-xl font-bold text-foreground mb-2">Нет оповещений</h2>
              <p className="text-sm text-muted-foreground">На данный момент клинических оповещений нет.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {alerts.map((alert) => (
                <li key={alert.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <span className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                      alert.isRead ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive"
                    )}>
                      {alert.severity === "MANDATORY" ? <ShieldAlert className="h-5 w-5" /> : <TriangleAlert className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0">
                      <p className={cn("text-sm font-bold truncate", alert.isRead ? "text-foreground" : "text-destructive")}>
                        {alert.severity === "MANDATORY" ? "Обязательное оповещение" : "Клиническое оповещение"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{alert.trigger}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground sm:ml-auto">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Clock className="h-3 w-3" /> 
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString('ru-RU') : 'N/A'}
                    </span>
                    <span className={cn(
                      "px-2 py-1 rounded-md font-bold whitespace-nowrap",
                      alert.isRead ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive"
                    )}>
                      {alert.isRead ? "Проверено" : "Требует проверки"}
                    </span>
                    <button 
                      onClick={() => handleReview(alert.patientId)}
                      className="rounded-lg border border-primary/30 px-3 py-1.5 text-primary font-semibold hover:bg-primary-soft transition-colors whitespace-nowrap"
                    >
                      Открыть профиль
                    </button>
                    {!alert.isRead && (
                      <button 
                        onClick={() => handleAcknowledge(alert.id)}
                        className="rounded-lg border border-muted-foreground/30 px-3 py-1.5 text-muted-foreground font-semibold hover:bg-muted transition-colors whitespace-nowrap"
                      >
                        Подтвердить
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* POP-UP MODAL */}
      {open && activeAlert && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 bg-destructive px-4 py-3 text-lg font-bold text-destructive-foreground">
              <TriangleAlert className="h-6 w-6 animate-pulse" />
              КРИТИЧЕСКОЕ ОПОВЕЩЕНИЕ
              <button onClick={() => setOpen(false)} className="ml-auto text-destructive-foreground/80 hover:text-destructive-foreground transition-colors" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6 text-center">
              <p className="text-sm leading-relaxed text-foreground">
                Пациент <strong>{activeAlert.patientName || activeAlert.patientId.substring(0, 8)}</strong> активировал флаг безопасности: <br/>
                <span className="italic text-muted-foreground">"{activeAlert.trigger}"</span>
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button onClick={() => handleReview(activeAlert.patientId)} className="w-full rounded-md bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm">
                  Немедленно проверить
                </button>
                <button onClick={() => handleAcknowledge(activeAlert.id)} className="w-full rounded-md border border-primary/40 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
                  Подтвердить и закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DoctorShell>
  );
}