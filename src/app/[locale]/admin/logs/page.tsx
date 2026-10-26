"use client";

import { useTranslations, useLocale } from "next-intl";
import { AdminShell } from "@/components/medix";
import { Activity, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { usePageTour } from "@/hooks/usePageTour";

type LogUser =
  | { userType: "admin" }
  | { userType: "patient"; userCode: string }
  | { userType: "doctor"; userName: string };

type LogEntry = {
  id: number;
  actionCode: "deploy" | "safetyOverride" | "provision" | "prescribe" | "submitForm";
  user: LogUser;
  detailCode: "uploaded" | "suicidal" | "createdAccount" | "prescribed" | "score";
  detailParams?: { email?: string; patient?: string; score?: number; severity?: string };
  timestamp: Date; // ISO date
  type: "system" | "critical" | "info" | "success";
};

const now = Date.now();
const mockLogs: LogEntry[] = [
  {
    id: 1,
    actionCode: "deploy",
    user: { userType: "admin" },
    detailCode: "uploaded",
    timestamp: new Date(now - 10 * 60 * 1000),
    type: "system",
  },
  {
    id: 2,
    actionCode: "safetyOverride",
    user: { userType: "patient", userCode: "MD-12345" },
    detailCode: "suicidal",
    timestamp: new Date(now - 25 * 60 * 1000),
    type: "critical",
  },
  {
    id: 3,
    actionCode: "provision",
    user: { userType: "admin" },
    detailCode: "createdAccount",
    detailParams: { email: "dr.ivanov@hospital.ru" },
    timestamp: new Date(now - 60 * 60 * 1000),
    type: "info",
  },
  {
    id: 4,
    actionCode: "prescribe",
    user: { userType: "doctor", userName: "Dr. Smith" },
    detailCode: "prescribed",
    detailParams: { patient: "MD-12345" },
    timestamp: new Date(now - 2 * 60 * 60 * 1000),
    type: "success",
  },
  {
    id: 5,
    actionCode: "submitForm",
    user: { userType: "patient", userCode: "MD-12345" },
    detailCode: "score",
    detailParams: { score: 18, severity: "Moderate-Severe" },
    timestamp: new Date(now - 3 * 60 * 60 * 1000),
    type: "info",
  },
];

export default function AdminLogs() {
  const t = useTranslations("AdminLogs");
  const locale = useLocale();

  usePageTour("admin-logs", [
    {
      element: '[data-onboarding-id="admin-logs-header"]',
      titleKey: "adminLogsHeaderTitle",
      descKey: "adminLogsHeaderDesc",
    },
  ]);

  const rtf = new Intl.RelativeTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", { numeric: "auto" });

  const formatRelative = (date: Date) => {
    const diffMs = date.getTime() - Date.now();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHr = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHr / 24);

    if (Math.abs(diffSec) < 60) return rtf.format(diffSec, "second");
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
    if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour");
    return rtf.format(diffDay, "day");
  };

  const getActionLabel = (code: LogEntry["actionCode"]) => {
    switch (code) {
      case "deploy":
        return t("actionDeploy");
      case "safetyOverride":
        return t("actionSafetyOverride");
      case "provision":
        return t("actionProvision");
      case "prescribe":
        return t("actionPrescribe");
      case "submitForm":
        return t("actionSubmitForm");
    }
  };

  const getDetailLabel = (log: LogEntry) => {
    switch (log.detailCode) {
      case "uploaded":
        return t("detailUploaded");
      case "suicidal":
        return t("detailSuicidal");
      case "createdAccount":
        return t("detailCreatedAccount", { email: log.detailParams?.email ?? "" });
      case "prescribed":
        return t("detailPrescribed", { patient: log.detailParams?.patient ?? "" });
      case "score": {
        const severity =
          log.detailParams?.severity === "Moderate-Severe"
            ? t("severityModerateSevere")
            : log.detailParams?.severity ?? "";
        return t("detailScore", { score: log.detailParams?.score ?? 0, severity });
      }
    }
  };

  const getUserLabel = (user: LogUser) => {
    switch (user.userType) {
      case "admin":
        return t("userAdmin");
      case "patient":
        return t("userPatient", { code: user.userCode });
      case "doctor":
        return user.userName;
    }
  };

  return (
    <AdminShell>
      <div className="max-w-[1200px] mx-auto space-y-6">
        <div data-onboarding-id="admin-logs-header">
          <h1 className="text-[22px] font-bold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          <ul className="divide-y">
            {mockLogs.map((log) => (
              <li
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-muted/10 transition-colors"
              >
                {/* Log Icon & Details */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                      log.type === "critical"
                        ? "bg-destructive/10 text-destructive"
                        : log.type === "success"
                        ? "bg-success/10 text-success"
                        : log.type === "system"
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {log.type === "critical" ? (
                      <ShieldAlert className="h-5 w-5" />
                    ) : log.type === "success" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : log.type === "system" ? (
                      <Activity className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{getActionLabel(log.actionCode)}</p>
                    <p className="text-xs text-muted-foreground">{getDetailLabel(log)}</p>
                  </div>
                </div>

                {/* User & Time */}
                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-muted-foreground sm:ml-auto w-full sm:w-auto pl-14 sm:pl-0">
                  <span className="font-medium text-foreground bg-muted/50 px-2 py-1 rounded-md">
                    {getUserLabel(log.user)}
                  </span>
                  <span className="w-20 text-right shrink-0">{formatRelative(log.timestamp)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}