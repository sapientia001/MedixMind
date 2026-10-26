"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, ShieldCheck, TriangleAlert, Camera, Brain, Lock, Play, Square, MessageSquare, X, Info, AlertCircle, TrendingUp, Minus, Loader2, BookOpen, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";
import { TrendCard, eda, hrv, temp, DoctorShell } from "@/components/medix";
import { cn } from "@/lib/utils";

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
  const t = useTranslations("Doctor");
  
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
    { id: 'bipolar', label: 'Bipolarity assessment incomplete', resolved: patient.bipolarFlag === false }, 
    { id: 'meds', label: 'Current medications not documented', resolved: false },
    { id: 'substance', label: 'Substance use history incomplete', resolved: false },
    { id: 'pregnancy', label: 'Pregnancy status unknown (if applicable)', resolved: false },
  ]);

  const toggleInfoItem = (id: string) => {
    setMissingInfo(prev => prev.map(item => 
      item.id === id ? { ...item, resolved: !item.resolved } : item
    ));
    toast.success("Clinical data documented.");
  };

  const unresolvedCount = missingInfo.filter(i => !i.resolved).length;

  const tabs = [
    { id: "Overview", label: t("overview") },
    { id: "Physiological Data", label: t("physioData") },
    { id: "Patient Photo", label: "Patient Photo" },
    { id: "Medications", label: t("medications") },
    { id: "History", label: t("history") },
  ];

  const whatChanged = [
    { label: "Sleep Duration", value: "↓ 35%", status: "worse" },
    { label: "Anxiety Levels", value: "↑ 42%", status: "worse" },
    { label: "Medication Adherence", value: "↓ 10%", status: "worse" },
    { label: "Social Engagement", value: "→ Stable", status: "neutral" },
  ];

  const getSeverityText = (score: number | null) => {
    if (score === null) return "(Not assessed)";
    if (score >= 20) return "(Severe)";
    if (score >= 15) return "(Moderate-Severe)";
    if (score >= 10) return "(Moderate)";
    if (score >= 5) return "(Mild)";
    return "(Minimal)";
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
            <div className={cn(
              "max-w-[80%] rounded-xl px-4 py-2 text-sm leading-relaxed",
              isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border"
            )}>
              {text}
            </div>
          </div>
        );
      })
    : null;

  const handlePlayAudio = () => {
    if (!patient.lastChat || typeof window === "undefined" || !window.speechSynthesis) return;
    if (isPlayingAudio) { window.speechSynthesis.cancel(); setIsPlayingAudio(false); return; }

    const textToRead = patient.lastChat
      .replace(/\[.*?\]/g, "")
      .replace(/user:/g, "Patient said:")
      .replace(/assistant:/g, "AI said:");

    const utterance = new SpeechSynthesisUtterance(textToRead);
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
        body: JSON.stringify({ photoData: patient.photoData, locale: "en" }),
      });
      const data = await res.json();
      setAiObservation(data.observation);
    } catch (error) {
      toast.error("Failed to analyze photo");
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
        body: JSON.stringify({
          patientId: patient.id,
          notes: doctorNotes
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Clinical interpretation saved successfully.");
      setDoctorNotes("");
    } catch (error) {
      toast.error("Failed to save interpretation.");
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
          doctorId: "abae8689-6bf8-4e3f-a505-2556e9f21802", // Demo Doctor ID
          medication: "Aviandr"
        }),
      });

      if (!res.ok) throw new Error("Failed");
      
      toast.success("Prescription confirmed and saved.");
    } catch (error) {
      toast.error("Failed to save prescription.");
    } finally {
      setIsPrescribing(false);
    }
  };

  const handleSavePlan = async () => {
    if (!diagnosis || !treatmentPlan) {
      toast.error("Please fill out both diagnosis and plan.");
      return;
    }
    setIsSavingPlan(true);
    try {
      const res = await fetch("/api/doctor/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          diagnosis,
          plan: treatmentPlan,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Clinical plan saved to medical record.");
    } catch (error) {
      toast.error("Failed to save plan.");
    } finally {
      setIsSavingPlan(false);
    }
  };

  return (
    <DoctorShell>
      <div className="mx-auto max-w-5xl space-y-4 px-4 md:px-0">
        <Link href="/doctor/patients" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t("back")}
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
            <span className={cn(
              "ml-auto flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold",
              patient.hasMandatoryAlert ? "bg-destructive-soft text-destructive" : "bg-success-soft text-success-foreground"
            )}>
              <TriangleAlert className="h-4 w-4" /> {patient.risk === "Critical" ? t("criticalRisk") : patient.risk}
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
                    <h4 className="text-sm font-bold">INFORMATION CONFLICT DETECTED</h4>
                    <p className="text-xs mt-1 leading-relaxed">
                      The patient reported <strong>"no psychiatric history"</strong> in their recent chat, but their medical records show a history of: <strong>{patient.pastHistory}</strong>. Please clarify this discrepancy.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-[250px_1fr] items-start">
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">{t("clinicalScores")}</h3>
                  <div className="rounded-xl bg-destructive-soft p-5 text-destructive border border-destructive/20">
                    <p className="text-xs font-bold">PHQ-9</p>
                    <p className="text-4xl font-extrabold mt-1">
                      {patient.phq9Score !== null ? patient.phq9Score : '--'}
                    </p>
                    <p className="text-xs font-medium mt-1">
                      {getSeverityText(patient.phq9Score)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> What Changed Since Last Visit
                  </h3>
                  <div className="rounded-xl border bg-card shadow-sm divide-y">
                    {whatChanged.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-3.5 text-sm">
                        <span className="text-muted-foreground font-medium">{item.label}</span>
                        <span className={cn(
                          "font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 text-xs",
                          item.status === "worse" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                        )}>
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
                    Missing Information ({unresolvedCount} items need review)
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
                      <span className={cn(
                        "text-xs transition-colors",
                        item.resolved ? "text-muted-foreground line-through" : "text-warning-foreground font-semibold group-hover:text-warning-foreground/80"
                      )}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border p-5 bg-muted/10 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" /> {t("lastChat")}
                  </p>
                  <p className="text-sm text-muted-foreground italic line-clamp-2">
                    {patient.lastChat 
                      ? patient.lastChat.replace(/\[.*?\]/g, "").replace(/user:/g, "P:").replace(/assistant:/g, "AI:") 
                      : t("noChat")}
                  </p>
                </div>
                {patient.lastChat && (
                  <button onClick={() => setIsTranscriptOpen(true)} className="mt-4 self-start rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                    Read Full Transcript
                  </button>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">
                  {t("physioTrends")} <span className="font-normal text-muted-foreground">(Last 14 Days)</span>
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <TrendCard title="HRV (ms)" data={hrv} color="var(--chart-1)" axis={["80", "60", "40", "20"]} min={20} max={80} />
                  <TrendCard title="EDA (µS)" data={eda} color="var(--chart-2)" axis={["15", "10", "5", "0"]} min={0} max={15} />
                  <TrendCard title="Skin Temp (°C)" data={temp} color="var(--chart-3)" axis={["37.5", "37.0", "36.5", "36.0"]} min={36} max={37.5} />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
                {patient.hasMandatoryAlert ? (
                  <div className="flex flex-col rounded-lg bg-destructive px-4 py-3 text-xs font-bold text-destructive-foreground shadow-sm">
                    <div className="flex items-center gap-2">
                      <TriangleAlert className="h-4 w-4" /> {t("mandatory")}
                    </div>
                    <button onClick={() => setShowWhy(!showWhy)} className="mt-2 self-start flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-[10px] hover:bg-white/30 transition-colors">
                      <Info className="h-3 w-3" /> Why this recommendation?
                    </button>
                    {showWhy && (
                      <div className="mt-2 text-[10px] font-normal leading-relaxed bg-black/20 p-2 rounded">
                        <strong>AI Reasoning:</strong> The patient scored {patient.phq9Score ?? 'N/A'} on the PHQ-9 and triggered a mandatory safety alert. Clinical guidelines require a psychiatric evaluation before initiating pharmacotherapy.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-xs font-bold text-muted-foreground shadow-sm">
                    {t("noAlerts")}
                  </div>
                )}
                <div className="flex items-center justify-center rounded-lg bg-warning-soft px-4 py-3 text-xs font-bold text-warning-foreground border border-warning/20">
                  {t("desirable")}
                </div>
              </div>

              {/* DOCTOR'S CLINICAL PLAN */}
              <div className="rounded-xl border p-5 bg-card shadow-sm mt-6">
                <h3 className="text-sm font-bold text-foreground mb-4">Doctor's Clinical Plan</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Formal Diagnosis (ICD-10)</label>
                    <input 
                      type="text" 
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g., F32.1 Major Depressive Disorder, moderate"
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Treatment Plan (Free Text)</label>
                    <textarea 
                      value={treatmentPlan}
                      onChange={(e) => setTreatmentPlan(e.target.value)}
                      placeholder="Enter details on therapy, medication, and follow-up..."
                      className="w-full min-h-[100px] rounded-lg border p-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>
                  <button 
                    onClick={handleSavePlan}
                    disabled={isSavingPlan}
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSavingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} 
                    {isSavingPlan ? "Saving..." : "Save Clinical Plan"}
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
                      <Camera className="h-4 w-4 text-primary" /> Captured Photo
                    </h3>
                    <div className="rounded-xl border overflow-hidden shadow-sm bg-black">
                      <img src={patient.photoData} alt="Patient" className="w-full h-auto object-cover max-h-[500px]" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex-1 rounded-xl border bg-card p-5 shadow-sm mb-4">
                      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <Brain className="h-4 w-4 text-primary" /> AI Affective Observation
                      </h3>
                      {!aiObservation && !isAnalyzing && (
                        <div className="text-center py-6">
                          <button onClick={runAIAnalysis} className="rounded-lg bg-primary/10 text-primary px-4 py-2 text-sm font-semibold hover:bg-primary/20 transition-colors">
                            Analyze Photo with AI
                          </button>
                        </div>
                      )}
                      {isAnalyzing && (
                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground animate-pulse">
                          <Brain className="h-6 w-6 mb-2 text-primary" />
                          <p className="text-sm">Analyzing facial cues...</p>
                        </div>
                      )}
                      {aiObservation && (
                        <div className="space-y-3">
                          <p className="text-sm text-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-muted">
                            {aiObservation}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-warning-foreground bg-warning-soft p-2 rounded-md">
                            <TriangleAlert className="h-3 w-3 shrink-0" />
                            <span>Non-diagnostic AI cue. Interpret with clinical judgment.</span>
                          </div>
                          <div>
                            <button onClick={() => setShowWhy(!showWhy)} className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-muted/80 transition-colors">
                              <Info className="h-3 w-3" /> How did the AI determine this?
                            </button>
                            {showWhy && (
                              <p className="mt-2 text-[10px] text-muted-foreground bg-muted/30 p-2 rounded">
                                The AI analyzed facial landmarks using computer vision to detect micro-expressions, muscle tension, and eye openness.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                      <h3 className="text-sm font-bold text-foreground mb-3">Your Clinical Interpretation</h3>
                      <textarea 
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder="Enter your clinical notes..."
                        className="w-full min-h-[100px] rounded-lg border p-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none bg-muted/5"
                      />
                      <button onClick={saveInterpretation} disabled={isSavingNote || !doctorNotes} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                        {isSavingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Interpretation"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-12 border rounded-xl bg-muted/10 w-full">
                  <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">No photos submitted by this patient yet.</p>
                </div>
              )}
            </div>
          )}

          {/* MEDICATIONS TAB */}
          {tab === "Medications" && (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground">{t("medication")}</h3>
              <div className="grid gap-4 rounded-xl border p-4 text-xs md:grid-cols-[160px_1fr_1fr] bg-card shadow-sm">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-bold text-foreground">Aviandr</p>
                  <p className="text-muted-foreground mt-0.5">(antidepressant)</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">{t("indications")}</p>
                  <ul className="mt-2 list-inside list-disc text-muted-foreground space-y-1">
                    <li>Major depressive disorder</li>
                    <li>Generalized anxiety disorder</li>
                    <li>Panic disorder</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-foreground">{t("contraindications")}</p>
                  <ul className="mt-2 list-inside list-disc text-muted-foreground space-y-1">
                    <li>Hypersensitivity</li>
                    <li>Severe liver impairment</li>
                    <li>Pregnancy (in 3rd trimester)</li>
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
                  <p className="flex-1">{t("guidelinesSource")} (e.g., ICD-10 F32.1, F41.1) <ExternalLink className="inline h-3 w-3 ml-1" /></p>
                </a>
                <a 
                  href="https://grls.rosminzdrav.ru/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:underline"
                >
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="flex-1">{t("aviandrSource")} (Registration ID: ЛП-№(003245)-(РГ-RU)) <ExternalLink className="inline h-3 w-3 ml-1" /></p>
                </a>
              </div>

              {unresolvedCount > 0 && !patient.bipolarFlag && (
                <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 text-xs font-bold text-warning-foreground mt-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> 
                  Warning: {unresolvedCount} missing clinical data points. Please resolve before prescribing.
                </div>
              )}

              {patient.bipolarFlag ? (
                <div className="flex flex-col gap-2 p-4 border border-destructive/30 bg-destructive/10 rounded-xl mt-6">
                  <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                    <TriangleAlert className="h-5 w-5" />
                    PRESCRIBING BLOCKED: BIPOLARITY FLAG DETECTED
                  </div>
                  <p className="text-xs text-destructive/80">
                    The AI detected symptoms of mania during the assessment. Do not prescribe Aviandr until a bipolar spectrum assessment is completed by a specialist.
                  </p>
                  <button onClick={() => setShowWhy(!showWhy)} className="mt-1 self-start flex items-center gap-1 rounded bg-destructive/20 px-2 py-1 text-[10px] font-semibold text-destructive hover:bg-destructive/30 transition-colors">
                    <Info className="h-3 w-3" /> Why is prescribing blocked?
                  </button>
                  {showWhy && (
                    <p className="text-[10px] text-destructive/80 bg-white/50 p-2 rounded mt-1">
                      The AI detected keywords indicative of mania/hypomania in the patient's chat transcript. Antidepressant monotherapy can trigger severe manic episodes in bipolar patients.
                    </p>
                  )}
                  <button disabled className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-muted text-muted-foreground py-3 text-sm font-bold cursor-not-allowed border border-muted-foreground/20">
                    <Lock className="h-4 w-4" /> Prescription Locked
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-[2fr_1fr] mt-6 mb-2">
                    {patient.hasMandatoryAlert ? (
                      <div className="flex flex-col rounded-lg bg-destructive px-4 py-3 text-xs font-bold text-destructive-foreground shadow-sm">
                        <div className="flex items-center gap-2">
                          <TriangleAlert className="h-4 w-4" /> MANDATORY: Psychiatric Referral Required Before Prescribing
                        </div>
                        <button onClick={() => setShowWhy(!showWhy)} className="mt-2 self-start flex items-center gap-1 rounded bg-white/20 px-2 py-1 text-[10px] hover:bg-white/30 transition-colors">
                          <Info className="h-3 w-3" /> Why is prescribing locked?
                        </button>
                        {showWhy && (
                          <div className="mt-2 text-[10px] font-normal leading-relaxed bg-black/20 p-2 rounded">
                            <strong>AI Reasoning:</strong> Patient triggered a MANDATORY safety alert. According to clinical guidelines, psychiatric evaluation is required to determine the safest treatment pathway before prescribing antidepressants.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-success-soft px-4 py-3 text-xs font-bold text-success-foreground border border-success/20 shadow-sm">
                        <ShieldCheck className="h-4 w-4" /> No mandatory alerts. Prescribing is allowed.
                      </div>
                    )}
                    <div className="flex items-center justify-center rounded-lg bg-warning-soft px-4 py-3 text-xs font-bold text-warning-foreground border border-warning/20">
                      Desirable: CBT Therapy
                    </div>
                  </div>

                  <button
                    onClick={handlePrescribe}
                    disabled={patient.hasMandatoryAlert || unresolvedCount > 0 || isPrescribing}
                    className={cn(
                      "mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold transition-colors shadow-sm",
                      (patient.hasMandatoryAlert || unresolvedCount > 0)
                        ? "bg-muted text-muted-foreground cursor-not-allowed border border-muted-foreground/20"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    {(patient.hasMandatoryAlert || unresolvedCount > 0) ? (
                      <><Lock className="h-4 w-4" /> Resolve Missing Info to Prescribe</>
                    ) : isPrescribing ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                    ) : (
                      <><ShieldCheck className="h-4 w-4" /> {t("confirm")}</>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-muted-foreground pt-1">
                    {t("disclaimer")}
                  </p>
                </>
              )}
            </div>
          )}
          
          {tab === "Physiological Data" && <div className="mt-6 text-sm text-muted-foreground">Detailed metrics coming soon.</div>}
          
          {tab === "History" && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-foreground mb-4">Full Assessment History</h3>
              <ul className="space-y-3">
                {patient.historyRecords.length === 0 ? (
                  <li className="text-sm text-muted-foreground">No history records found.</li>
                ) : (
                  patient.historyRecords.map((record) => (
                    <li key={record.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/5">
                      <div className="flex items-center gap-3">
                        <span className={`h-2 w-2 rounded-full ${
                          record.type === 'chat' ? 'bg-blue-500' : 
                          record.type === 'form_phq9' ? 'bg-orange-500' : 
                          record.type === 'photo' ? 'bg-purple-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="text-sm font-semibold text-foreground capitalize">
                            {record.type.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {record.createdAt ? new Date(record.createdAt).toLocaleString('ru-RU') : 'Unknown date'}
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
                  <MessageSquare className="h-5 w-5 text-primary" /> Clinical Transcript
                </h2>
                <p className="text-xs text-muted-foreground">Patient: {patient.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePlayAudio}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    isPlayingAudio ? "bg-destructive text-white" : "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  {isPlayingAudio ? <><Square className="h-3 w-3" /> Stop Audio</> : <><Play className="h-3 w-3" /> Listen to Transcript</>}
                </button>
                <button onClick={() => setIsTranscriptOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
              {formattedTranscript}
            </div>
          </div>
        </div>
      )}
    </DoctorShell>
  );
}