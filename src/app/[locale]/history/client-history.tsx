"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, CheckCircle2, MessageSquareText, ClipboardList, ChevronRight, Camera } from "lucide-react";
import { PatientShell } from "@/components/medix";

type HistoryRecord = {
  id: string;
  type: string;
  createdAt: Date;
  rawData: string | null;
};

export default function ClientHistory({ records }: { records: HistoryRecord[] }) {
  const t = useTranslations("Patient");
  const tDoctor = useTranslations("Doctor");

  // Helper to format the date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', { 
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  // Helper to get the correct title/icon based on type
  const getRecordMeta = (type: string) => {
    switch (type) {
      case "chat":
        return { title: t("historyChat"), icon: <MessageSquareText className="h-5 w-5" />, color: "bg-primary/20 text-primary" };
      case "form_phq9":
        return { title: t("historyForm"), icon: <ClipboardList className="h-5 w-5" />, color: "bg-orange-100 text-orange-600" };
      case "photo":
        return { title: "Фото-анализ", icon: <Camera className="h-5 w-5" />, color: "bg-purple-100 text-purple-600" };
      case "clinical_plan":
        return { title: "План лечения", icon: <CheckCircle2 className="h-5 w-5" />, color: "bg-green-100 text-green-600" };
      default:
        return { title: "Оценка", icon: <ClipboardList className="h-5 w-5" />, color: "bg-muted text-muted-foreground" };
    }
  };

  return (
    <PatientShell>
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="text-primary hover:bg-primary-soft p-2 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{t("historyTitle") || "История оценок"}</h1>
            <p className="text-sm text-muted-foreground">{t("historySubtitle") || "Просмотрите прошлые проверки и результаты опросов."}</p>
          </div>
        </div>

        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          {records.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Вы еще не проходили никаких оценок.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {records.map((record) => {
                const meta = getRecordMeta(record.type);
                return (
                  <li key={record.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${meta.color}`}>
                        {meta.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium group-hover:text-primary transition-colors">{meta.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(record.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:ml-auto">
                      <span className="hidden sm:flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] text-green-700">
                        <CheckCircle2 className="h-3 w-3" /> {t("completed")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </PatientShell>
  );
}