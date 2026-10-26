"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, ChevronDown, LogOut, Loader2, Camera, X } from "lucide-react";
import { toast } from "sonner";
import { PatientShell } from "@/components/medix";
import { cn } from "@/lib/utils";

export default function Form() {
  const [open, setOpen] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Camera & Mandatory Photo States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasTakenPhoto, setHasTakenPhoto] = useState(false);
  const [showPhotoPrompt, setShowPhotoPrompt] = useState(true); // New state for the prompt
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "ru";
  
  const t = useTranslations("Forms");
  
  const questions = [t("q1"), t("q2"), t("q3"), t("q4"), t("q5"), t("q6"), t("q7"), t("q8")];
  const options = [t("opt0"), t("opt1"), t("opt2"), t("opt3")];

  const totalScore = Object.values(answers).reduce((sum, current) => sum + current, 0);

  // CAMERA LOGIC
  const openCamera = async () => {
    setShowPhotoPrompt(false); // Hide the prompt card when camera opens
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error("Could not access camera.");
      setIsCameraOpen(false);
      setShowPhotoPrompt(true);
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    setCapturedImage(null);
    
    // If they close the camera without taking a photo, show the prompt again
    if (!hasTakenPhoto) {
      setShowPhotoPrompt(true);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCapturedImage(canvas.toDataURL("image/jpeg", 0.8));
      }
    }
  };

  const submitPhoto = async () => {
    if (capturedImage) {
      try {
        await fetch("/api/upload-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            photoData: capturedImage,
            patientId: '69216731-ec0a-4f4e-9cca-e017433b6917'
          }),
        });
        setHasTakenPhoto(true);
        closeCamera();
        toast.success("Photo verified. You can now fill the form.");
      } catch (error) {
        toast.error("Failed to upload photo.");
      }
    }
  };

  const handleNext = async () => {
    if (step < 8) {
      setStep(step + 1);
      setOpen(step); 
    } else {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/save-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId: '69216731-ec0a-4f4e-9cca-e017433b6917',
            score: totalScore,
            answers: answers
          }),
        });

        if (!res.ok) throw new Error("Failed to save");

        toast.success(`Form submitted successfully. Score: ${totalScore}`);
        router.push(`/${currentLocale}`); 
      } catch (error) {
        toast.error("Failed to submit form. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <PatientShell 
      right={
        hasTakenPhoto ? (
          <Link href={`/${currentLocale}`} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <LogOut className="h-4 w-4" /> {t("saveExit")}
          </Link>
        ) : null
      }
    >
      <div className="mx-auto max-w-3xl space-y-6 relative min-h-[calc(100vh-10rem)]">
        
        {/* MANDATORY PHOTO OVERLAY (WITH CLOSE BUTTON) */}
        {!hasTakenPhoto && showPhotoPrompt && (
          <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-card p-8 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200 relative">
              
              {/* CLOSE BUTTON */}
              <button 
                onClick={() => setShowPhotoPrompt(false)} 
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 bg-muted rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary mb-6 mx-auto">
                <Camera className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {currentLocale === 'ru' ? "Требуется фотография" : "Photo Required"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {currentLocale === 'ru' 
                  ? "Перед заполнением анкеты вы должны сделать текущую фотографию себя. Это поможет вашему врачу оценить ваше состояние."
                  : "Before filling out the form, you must take a current photo of yourself. This helps your doctor assess your condition."}
              </p>
              <button onClick={openCamera} className="w-full rounded-lg bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                {currentLocale === 'ru' ? "Открыть камеру" : "Open Camera"}
              </button>
            </div>
          </div>
        )}

        {/* IF THEY CLOSED THE PROMPT, SHOW A BANNER TO REOPEN IT */}
        {!hasTakenPhoto && !showPhotoPrompt && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
              <Camera className="h-5 w-5" />
              {currentLocale === 'ru' ? "Фото обязательно для отправки" : "Photo required to submit"}
            </div>
            <button onClick={openCamera} className="rounded-md bg-destructive text-destructive-foreground px-4 py-1.5 text-xs font-bold hover:bg-destructive/90 transition-colors">
              {currentLocale === 'ru' ? "Сделать фото" : "Take Photo"}
            </button>
          </div>
        )}

        {/* FORM CONTENT */}
        <div className={cn(!hasTakenPhoto && "opacity-50 pointer-events-none select-none blur-[2px] transition-all")}>
          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="text-muted-foreground">{step} / 8</span>
            <div className="h-2.5 flex-1 rounded-full bg-primary-soft overflow-hidden">
              <div 
                className="h-full rounded-full bg-primary transition-all duration-300" 
                style={{ width: `${(step / 8) * 100}%` }} 
              />
            </div>
          </div>

          <div className="card-surface p-6 mt-4">
            <h1 className="text-lg font-bold text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
            
            <div className="mt-5 space-y-3">
              {questions.map((q, i) => (
                <div key={i} className={cn("rounded-xl border transition-colors", open === i ? "border-primary/50 bg-primary-soft/30" : "bg-card")}>
                  <button 
                    onClick={() => setOpen(open === i ? -1 : i)} 
                    className="flex w-full items-center justify-between p-4 text-left text-sm font-medium hover:bg-muted/30 transition-colors rounded-xl"
                  >
                    <span className="text-foreground">{i + 1}. {q}</span>
                    <ChevronDown className={cn("h-4 w-4 text-primary transition-transform", open === i && "rotate-180")} />
                  </button>
                  
                  {open === i && (
                    <div className="space-y-3 px-4 pb-5 pt-1">
                      {options.map((o, j) => (
                        <label key={o} className="flex cursor-pointer items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                          <input 
                            type="radio" 
                            name={`q${i}`} 
                            checked={answers[i] === j} 
                            onChange={() => setAnswers({ ...answers, [i]: j })} 
                            className="h-4 w-4 accent-primary" 
                          />
                          {o}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pb-8 mt-6">
            <button 
              onClick={() => {
                setStep(Math.max(1, step - 1));
                setOpen(step - 2);
              }} 
              disabled={step === 1 || isSubmitting}
              className="flex items-center gap-2 rounded-lg border border-primary/40 bg-card px-6 py-2.5 text-sm font-semibold text-primary hover:bg-primary-soft disabled:opacity-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> {t("previous")}
            </button>
            
            <button 
              onClick={handleNext} 
              disabled={isSubmitting || !hasTakenPhoto}
              className="flex items-center gap-2 rounded-lg bg-primary px-8 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              ) : step === 8 ? (
                t("submit")
              ) : (
                t("next")
              )}
              {!isSubmitting && step < 8 && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* CAMERA MODAL */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/80 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-bold">
                {currentLocale === 'ru' ? "Сделать фото" : "Take a Photo"}
              </h2>
              <button onClick={closeCamera}><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-4 flex flex-col items-center">
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                {!capturedImage ? (
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                )}
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="flex gap-3 w-full">
                {!capturedImage ? (
                  <button 
                    onClick={capturePhoto}
                    className="flex-1 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {currentLocale === 'ru' ? "Сделать снимок" : "Capture Photo"}
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setCapturedImage(null)}
                      className="flex-1 rounded-lg border border-border bg-card py-3 text-sm font-bold hover:bg-muted transition-colors"
                    >
                      {currentLocale === 'ru' ? "Переснять" : "Retake"}
                    </button>
                    <button 
                      onClick={submitPhoto}
                      className="flex-1 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      {currentLocale === 'ru' ? "Подтвердить и начать" : "Confirm & Start Form"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PatientShell>
  );
}