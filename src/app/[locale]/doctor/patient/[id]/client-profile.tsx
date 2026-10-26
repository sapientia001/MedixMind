"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, ShieldCheck, TriangleAlert, Camera, Brain, Lock, Play, Square, MessageSquare, X, Info, AlertCircle, TrendingUp, Minus, Loader2, BookOpen, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";
import { TrendCard, eda, hrv, temp, DoctorShell } from "@/components/medix";
import { cn } from "@/lib/utils";
import { usePageTour } from "@/hooks/usePageTour";

export type ProfileData = {
  id: string;
  name: string;
  meta: string;
  risk: string;
  hasMandatoryAlert: boolean;
  bipolarFlag: boolean;
  lastChat: string | null;
  photoData: string | null;
  contradictionFound: boolean;
  pastHistory: string | null;
  phq9Score: number | null;
  historyRecords: { id: string; type: string; createdAt: Date | null; rawData: string | null }[];
};

export default function ClientProfile({ patient }: { patient: ProfileData }) {
  const [tab, setTab] = useState("Overview");
  const tDoc = useTranslations("Doctor");
  const t = useTranslations("PatientProfile");
  const locale = useLocale();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "ru";

  const [aiObservation, setAiObservation] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const [isPrescribing, setIsPrescribing] = useState(false);

  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const [showWhy, setShowWhy] = useState(false);

  // Clinical Plan State
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const [missingInfo, setMissingInfo] = useState([
    { id: "bipolar", labelKey: "missingInfoBipolar", resolved: patient.bipolarFlag === false },
    { id: "meds", labelKey: "missingInfoMeds", resolved: false },
    { id: "substance", labelKey: "missingInfoSubstance", resolved: false },
    { id: "pregnancy", labelKey: "missingInfoPregnancy", resolved: false },
  ]);

  usePageTour("doctor-profile", [
    {
      element: '[data-onboarding-id="doctor-profile-header"]',
      titleKey: "doctorProfileHeaderTitle",
      descKey: "doctorProfileHeaderDesc",
    },
  ]);

  const toggleInfoItem = (id: string) => {
    setMissingInfo((prev) =>
      prev.map((item) => (item.id === id ? { ...item, resolved: !item.resolved } : item))
    );
    toast.success(t("clinicalDataDocumented"));
  };

  const unresolvedCount = missingInfo.filter((i) => !i.resolved).length;

  const tabs = [
    { id: "Overview", label: tDoc("overview") },
    { id: "Physiological Data", label: tDoc("physioData") },
    { id: "Patient Photo", label: t("tabPatientPhoto") },
    { id: "Medications", label: tDoc("medications") },
    { id: "History", label: tDoc("history") },
  ];

  const whatChanged = [
    { labelKey: "changeSleep", value: "↓ 35%", status: "worse" },
    { labelKey: "changeAnxiety", value: "↑ 42%", status: "worse" },
    { labelKey: "changeAdherence", value: "↓ 10%", status: "worse" },
    { labelKey: "changeSocial", value: `→ ${t("changeStable")}`, status: "neutral" },
  ];

  const getSeverityText = (score: number | null) => {
    if (score === null) return t("severityNotAssessed");
    if (score >= 20) return t("severitySevere");
    if (score >= 15) return t("severityModerateSevere");
    if (score >= 10) return t("severityModerate");
    if (score >= 5) return t("severityMild");
    return t("severityMinimal");
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "Critical":
        return tDoc("criticalRisk");
      case "High":
        return tDoc("highRisk");
      case "Medium":
        return tDoc("mediumRisk");
      case "Low":
        return tDoc("lowRisk");
      default:
        return risk;
    }
  };

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case "chat":
        return t("recordTypeChat");
      case "form_phq9":
        return t("recordTypeForm");
      case "photo":
        return t("recordTypePhoto");
      default:
        return t("recordTypeOther");
    }
  };

  const formattedTranscript = patient.lastChat
    ? patient.lastChat.split("\n").map((line, index) => {
        const isUser = line.startsWith("user:");
        const isAssistant = line.startsWith("assistant:");

        if (!isUser && !isAssistant) return null;

        const text = line.replace(/^(user|assistant):\s*/i, "").replace(/\[.*?\]/g, "").trim();
        if (!text) return null;

        return (
          <div key={index} className={cn("flex mb-4", isUser ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[80%] rounded-xl px-4 py-2 text-sm leading-relaxed",
                isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border"
              )}
            >
              {text}
            </div>
          </div>
        );
      })
    : null;

  const handlePlayAudio = () => {
    if (!patient.lastChat || typeof window === "undefined" || !window.speechSynthesis) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToRead = patient.lastChat
      .replace(/\[.*?\]/g, "")
      .replace(/user:/g, `${t("ttsPatientSaid")} `)
      .replace(/assistant:/g, `${t("ttsAiSaid")} `);

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = locale === "ru" ? "ru-RU" : "en-US";
    utterance.onend = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const runAIAnalysis = async () => {
    if (!patient.photoData) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoData: patient.photoData, locale }),
      });
      const data = await res.json();
      setAiObservation(data.observation);
    } catch (error) {
      toast.error(t("analyzeFailedToast"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveInterpretation = async () => {
    setIsSavingNote(true);
    try {
      const res = await fetch("/api/save-interpretation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, notes: doctorNotes }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(t("interpretationSavedToast"));
      setDoctorNotes("");
    } catch (error) {
      toast.error(t("interpretationFailedToast"));
    } finally {
      setIsSavingNote(false);
    }
  };

  const handlePrescribe = async () => {
    setIsPrescribing(true);
    try {
      const res = await fetch("/api/prescribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          doctorId: "abae8689-6bf8-4e3f-a505-2556e9f21802",
          medication: "Aviandr",
        }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success(t("prescriptionSavedToast"));
    } catch (error) {
      toast.error(t("prescriptionFailedToast"));
    } finally {
      setIsPrescribing(false);
    }
  };

  const handleSavePlan = async () => {
    if (!diagnosis || !treatmentPlan) {
      toast.error(t("planIncompleteToast"));
      return;
    }
    setIsSavingPlan(true);
    try {
      const res = await fetch("/api/doctor/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, diagnosis, plan: treatmentPlan }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(t("planSavedToast"));
    } catch (error) {
      toast.error(t("planFailedToast"));
    } finally {
      setIsSavingPlan(false);
    }
  };

  return (
    <DoctorShell>
      <div className="mx-auto max-w-5xl space-y-4 px-4 md:px-0">
        <Link
          href={`/${currentLocale}/doctor/patients`}
          data-onboarding-id="doctor-profile-header"
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {tDoc("back")}
        </Link>

        <div className="card-surface p-6">
          <div className="flex flex-wrap items-center gap-4 border-b pb-5">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-xl font-bold text-primary">
              {patient.name.substring(0, 2).toUpperCase()}
            </span>
            <div>
              <p className="text-xl font-bold text-foreground">{patient.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{patient.meta}</p>
            </div>
            <span
              className={cn(
                "ml-auto flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold",
                patient.hasMandatoryAlert ? "bg-destructive-soft text-destructive" : "bg-success-soft text-success-foreground"
              )}
            >
              <TriangleAlert className="h-4 w-4" /> {getRiskLabel(patient.risk)}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-b pb-px">
            {tabs.map((tItem) => (
              <button
                key={tItem.id}
                onClick={() => setTab(tItem.id)}
                className={cn(
                  "whitespace-nowrap px-4 py-2.5 text-xs font-medium transition-colors border-b-2 mb-[-1px]",
                  tab === tItem.id ? "border-primary font-bold text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tItem.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {tab === "Overview" && (
            <div className="mt-6 space-y-6">

              {patient.contradictionFound && (
                <div className="flex items-start gap-3 rounded-xl border border-destructive bg-destructive/10 p-4 text-destructive shadow-sm">
                  <TriangleAlert className="h-5 w-5 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h4 className="text-sm font-bold">{t("conflictTitle")}</h4>
                    <p className="text-xs mt-1 leading-relaxed">
                      {t("conflictDescBefore")}
                      <strong>{t("conflictDescNoHistory")}</strong>
                      {t("conflictDescMiddle")}
                      <strong>{patient.pastHistory}</strong>
                      {t("conflictDescAfter")}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-[250px_1fr] items-start">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">{tDoc("clinicalScores")}</h3>
                  <div className="rounded-xl bg-destructive-soft p-5 text-destructive border border-destructive/20">
                    <p className="text-xs font-bold">PHQ-9</p>
                    <p className="text-4xl font-extrabold mt-1">
                      {patient.phq9Score !== null ? patient.phq9Score : "--"}
                    </p>
                    <p className="text-xs font-medium mt-1">{getSeverityText(patient.phq9Score)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> {t("whatChangedTitle")}
                  </h3>
                  <div className="rounded-xl border bg-card shadow-sm divide-y">
                    {whatChanged.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-3.5 text-sm">
                        <span className="text-muted-foreground font-medium">{t(item.labelKey)}</span>
                        <span
                          className={cn(
                            "font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 text-xs",
                            item.status === "worse" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.status === "worse" ? <TrendingUp className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-warning/30 bg-warning-soft/30 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-warning-foreground" />
                  <h3 className="text-sm font-bold text-warning-foreground">
                    {t("missingInfoTitle", { count: unresolvedCount })}
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {missingInfo.map((item) => (
                    <label key={item.id} className="flex items-center gap-3 cursor-pointer group bg-white/50 p-2.5 rounded-lg border border-warning/20">
                      <input
                        type="checkbox"
                        checked={item.resolved}
                        onChange={() => toggleInfoItem(item.id)}
                        className="h-4 w-4 rounded border-warning-foreground/30 text-warning-foreground accent-warning-foreground cursor-pointer"
                      />
                      <span
                        className={cn(
                          "text-xs transition-colors",
                          item.resolved ? "text-muted-foreground line-through" : "text-warning-foreground font-semibold group-hover:text-warning-foreground/80"
                        )}
                      >
                        {t(item.labelKey)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border p-5 bg-muted/10 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" /> {tDoc("lastChat")}
                  </p>
                  <p className="text-sm text-muted-foreground italic line-clamp-2">
                    {patient.lastChat
                      ? patient.lastChat.replace(/\[.*?\]/g, "").replace(/user:/g, "P:").replace(/assistant:/g, "AI:")
                      : tDoc("noChat")}
                  </p>
                </div>
                {patient.lastChat && (
                  <button
                    onClick={() => setIsTranscriptOpen(true)}
                    className="mt-4 self-start rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    {tDoc("readFullTranscript")}
                  </button>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">
                  {tDoc("physioTrends")} <span className="font-normal text-muted-foreground">{t("last14Days")}</span>
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <TrendCard title={t("trendHrv")} data={hrv} color="var(--chart-1)" axis={["80", "60", "40", "20"]} min={20} max={80} />
                  <TrendCard title={t("trendEda")} data={eda} color="var(--chart-2)" axis={["15", "10", "5", "0"]} min={0} max={15} />
                  <TrendCard title={t("trendSkinTemp")} data={temp} color="var(--chart-3)" axis={["37.5", "37.0", "36.5", "36.0"]} min={36} max={37.5} />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
                {patient.hasMandatoryAlert ? (
                  <div className="flex flex-col rounded-lg bg-destructive px-4 py-3 text-xs font-bold text-destructive-foreground shadow-sm">
                    <div className="flex items-center gap-2">
                      <TriangleAlert className="h-4 w-4" /> {tDoc("mandatory")}
                    </div>
                    <button
                      onClick={() => setShowWhy(!showWhy)}
                      className="mt-2 self-start flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-[10px] hover:bg-white/30 transition-colors"
                    >
                      <Info className="h-3 w-3" /> {t("whyRecommendation")}
                    </button>
                    {showWhy && (
                      <div className="mt-2 text-[10px] font-normal leading-relaxed bg-black/20 p-2 rounded">
                        {t("aiReasoningAlert", { score: patient.phq9Score ?? "N/A" })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-xs font-bold text-muted-foreground shadow-sm">
                    {tDoc("noAlerts")}
                  </div>
                )}
                <div className="flex items-center justify-center rounded-lg bg-warning-soft px-4 py-3 text-xs font-bold text-warning-foreground border border-warning/20">
                  {tDoc("desirable")}
                </div>
              </div>

              {/* DOCTOR'S CLINICAL PLAN */}
              <div className="rounded-xl border p-5 bg-card shadow-sm mt-6">
                <h3 className="text-sm font-bold text-foreground mb-4">{tDoc("clinicalPlan")}</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">{tDoc("diagnosis")}</label>
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder={t("diagnosisPlaceholder")}
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">{t("treatmentPlanLabel")}</label>
                    <textarea
                      value={treatmentPlan}
                      onChange={(e) => setTreatmentPlan(e.target.value)}
                      placeholder={t("treatmentPlanPlaceholder")}
                      className="w-full min-h-[100px] rounded-lg border p-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSavePlan}
                    disabled={isSavingPlan}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSavingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    {isSavingPlan ? t("saving") : tDoc("savePlan")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PATIENT PHOTO TAB */}
          {tab === "Patient Photo" && (
            <div className="mt-6">
              {patient.photoData ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      <Camera className="h-4 w-4 text-primary" /> {tDoc("capturedPhoto")}
                    </h3>
                    <div className="rounded-xl border overflow-hidden shadow-sm bg-black">
                      <img src={patient.photoData} alt={patient.name} className="w-full h-auto object-cover max-h-[500px]" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex-1 rounded-xl border bg-card p-5 shadow-sm mb-4">
                      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" /> {tDoc("aiObservation")}
                      </h3>
                      {!aiObservation && !isAnalyzing && (
                        <div className="text-center py-6">
                          <button
                            onClick={runAIAnalysis}
                            className="rounded-lg bg-primary/10 text-primary px-4 py-2 text-sm font-semibold hover:bg-primary/20 transition-colors"
                          >
                            {tDoc("analyzePhoto")}
                          </button>
                        </div>
                      )}
                      {isAnalyzing && (
                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground animate-pulse">
                          <Brain className="h-6 w-6 mb-2 text-primary" />
                          <p className="text-sm">{t("analyzingCues")}</p>
                        </div>
                      )}
                      {aiObservation && (
                        <div className="space-y-3">
                          <p className="text-sm text-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-muted">
                            {aiObservation}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-warning-foreground bg-warning-soft p-2 rounded-md">
                            <TriangleAlert className="h-3 w-3 shrink-0" />
                            <span>{t("aiNonDiagnostic")}</span>
                          </div>
                          <div>
                            <button
                              onClick={() => setShowWhy(!showWhy)}
                              className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-muted/80 transition-colors"
                            >
                              <Info className="h-3 w-3" /> {t("howDidAiDetermine")}
                            </button>
                            {showWhy && (
                              <p className="mt-2 text-[10px] text-muted-foreground bg-muted/30 p-2 rounded">
                                {t("howDidAiDesc")}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                      <h3 className="text-sm font-bold text-foreground mb-3">{tDoc("clinicalInterpretation")}</h3>
                      <textarea
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder={t("notesPlaceholder")}
                        className="w-full min-h-[100px] rounded-lg border p-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none bg-muted/5"
                      />
                      <button
                        onClick={saveInterpretation}
                        disabled={isSavingNote || !doctorNotes}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {isSavingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : tDoc("saveInterpretation")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-12 border rounded-xl bg-muted/10 w-full">
                  <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">{t("noPhotos")}</p>
                </div>
              )}
            </div>
          )}

          {/* MEDICATIONS TAB */}
          {tab === "Medications" && (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground">{tDoc("medication")}</h3>
              <div className="grid gap-4 rounded-xl border p-4 text-xs md:grid-cols-[160px_1fr_1fr] bg-card shadow-sm">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-bold text-foreground">Aviandr</p>
                  <p className="text-muted-foreground mt-0.5">{t("medicationClass")}</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">{tDoc("indications")}</p>
                  <ul className="mt-2 list-inside list-disc text-muted-foreground space-y-1">
                    <li>{t("indication1")}</li>
                    <li>{t("indication2")}</li>
                    <li>{t("indication3")}</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-foreground">{tDoc("contraindications")}</p>
                  <ul className="mt-2 list-inside list-disc text-muted-foreground space-y-1">
                    <li>{t("contra1")}</li>
                    <li>{t("contra2")}</li>
                    <li>{t("contra3")}</li>
                  </ul>
                </div>
              </div>

              {/* REGULATORY CITATIONS WITH LINKS */}
              <div className="flex flex-col gap-3 p-4 border border-blue-200 bg-blue-50 rounded-xl text-blue-900 mt-2 text-xs">
                <a
                  href="https://cr.minzdrav.gov.ru/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:underline"
                >
                  <BookOpen className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="flex-1">
                    {tDoc("guidelinesSource")} (e.g., ICD-10 F32.1, F41.1) <ExternalLink className="inline h-3 w-3 ml-1" />
                  </p>
                </a>
                <a
                  href="https://grls.rosminzdrav.ru/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:underline"
                >
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="flex-1">
                    {tDoc("aviandrSource")} (Registration ID: ЛП-№(003245)-(РГ-RU)) <ExternalLink className="inline h-3 w-3 ml-1" />
                  </p>
                </a>
              </div>

              {unresolvedCount > 0 && !patient.bipolarFlag && (
                <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-xs font-bold text-warning-foreground mt-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {t("missingWarning", { count: unresolvedCount })}
                </div>
              )}

              {patient.bipolarFlag ? (
                <div className="flex flex-col gap-2 p-4 border border-destructive/30 bg-destructive/10 rounded-xl mt-6">
                  <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                    <TriangleAlert className="h-5 w-5" />
                    {tDoc("prescribingBlocked")}
                  </div>
                  <p className="text-xs text-destructive/80">{t("prescribeBlockedDesc")}</p>
                  <button
                    onClick={() => setShowWhy(!showWhy)}
                    className="mt-1 self-start flex items-center gap-1 rounded bg-destructive/20 px-2 py-1 text-[10px] font-semibold text-destructive hover:bg-destructive/30 transition-colors"
                  >
                    <Info className="h-3 w-3" /> {t("whyBlockedBtn")}
                  </button>
                  {showWhy && (
                    <p className="text-[10px] text-destructive/80 bg-white/50 p-2 rounded mt-1">
                      {t("whyBlockedDesc")}
                    </p>
                  )}
                  <button
                    disabled
                    className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-muted text-muted-foreground py-3 text-sm font-bold cursor-not-allowed border border-muted-foreground/20"
                  >
                    <Lock className="h-4 w-4" /> {tDoc("prescriptionLocked")}
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-[2fr_1fr] mt-6 mb-2">
                    {patient.hasMandatoryAlert ? (
                      <div className="flex flex-col rounded-lg bg-destructive px-4 py-3 text-xs font-bold text-destructive-foreground shadow-sm">
                        <div className="flex items-center gap-2">
                          <TriangleAlert className="h-4 w-4" /> {t("mandatoryReferral")}
                        </div>
                        <button
                          onClick={() => setShowWhy(!showWhy)}
                          className="mt-2 self-start flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-[10px] hover:bg-white/30 transition-colors"
                        >
                          <Info className="h-3 w-3" /> {t("whyLockedBtn")}
                        </button>
                        {showWhy && (
                          <div className="mt-2 text-[10px] font-normal leading-relaxed bg-black/20 p-2 rounded">
                            {t("whyLockedDesc")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-success-soft px-4 py-3 text-xs font-bold text-success-foreground border border-success/20 shadow-sm">
                        <ShieldCheck className="h-4 w-4" /> {t("noAlertsPrescribingAllowed")}
                      </div>
                    )}
                    <div className="flex items-center justify-center rounded-lg bg-warning-soft px-4 py-3 text-xs font-bold text-warning-foreground border border-warning/20">
                      {tDoc("desirable")}
                    </div>
                  </div>

                  <button
                    onClick={handlePrescribe}
                    disabled={patient.hasMandatoryAlert || unresolvedCount > 0 || isPrescribing}
                    className={cn(
                      "mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-colors shadow-sm",
                      patient.hasMandatoryAlert || unresolvedCount > 0
                        ? "bg-muted text-muted-foreground cursor-not-allowed border border-muted-foreground/20"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {patient.hasMandatoryAlert || unresolvedCount > 0 ? (
                      <>
                        <Lock className="h-4 w-4" /> {t("resolveMissingBtn")}
                      </>
                    ) : isPrescribing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> {t("saving")}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" /> {tDoc("confirm")}
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-muted-foreground pt-1">{tDoc("disclaimer")}</p>
                </>
              )}
            </div>
          )}

          {tab === "Physiological Data" && (
            <div className="mt-6 text-sm text-muted-foreground">{t("tabPhysioPlaceholder")}</div>
          )}

          {tab === "History" && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-foreground mb-4">{tDoc("fullAssessmentHistory")}</h3>
              <ul className="space-y-3">
                {patient.historyRecords.length === 0 ? (
                  <li className="text-sm text-muted-foreground">{tDoc("noHistory")}</li>
                ) : (
                  patient.historyRecords.map((record) => (
                    <li key={record.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            record.type === "chat"
                              ? "bg-blue-500"
                              : record.type === "form_phq9"
                              ? "bg-orange-500"
                              : record.type === "photo"
                              ? "bg-purple-500"
                              : "bg-green-500"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {getRecordTypeLabel(record.type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {record.createdAt
                              ? new Date(record.createdAt).toLocaleString(locale === "ru" ? "ru-RU" : "en-GB")
                              : t("unknownDate")}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                        ID: {record.id.substring(0, 6)}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* TRANSCRIPT MODAL */}
      {isTranscriptOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b p-4 bg-muted/10">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> {t("transcriptTitle")}
                </h2>
                <p className="text-xs text-muted-foreground">{t("transcriptPatient", { name: patient.name })}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayAudio}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    isPlayingAudio ? "bg-destructive text-white" : "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  {isPlayingAudio ? (
                    <>
                      <Square className="h-3 w-3" /> {t("stopAudioBtn")}
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" /> {t("listenBtn")}
                    </>
                  )}
                </button>
                <button onClick={() => setIsTranscriptOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-muted/5">{formattedTranscript}</div>
          </div>
        </div>
      )}
    </DoctorShell>
  );
}