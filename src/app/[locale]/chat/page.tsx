"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Bot, Mic, Send, User, Volume2, VolumeX, CheckCircle2, Camera, X } from "lucide-react";
import { toast } from "sonner";
import { PatientShell } from "@/components/medix";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [listening, setListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Camera & Mandatory Photo States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasTakenPhoto, setHasTakenPhoto] = useState(false);
  const [showPhotoPrompt, setShowPhotoPrompt] = useState(true);

  const recognitionRef = useRef<any>(null);
  const spokenMessageIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split("/")[1] || "ru";
  const t = useTranslations("Chat");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // TEXT-TO-SPEECH
  useEffect(() => {
    if (!audioEnabled || isLoading || typeof window === "undefined" || !window.speechSynthesis) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant || spokenMessageIdRef.current === lastAssistant.id) return;

    const text = lastAssistant.content.replace(/\[.*?\]/g, "").trim();
    if (text.length === 0) return;

    spokenMessageIdRef.current = lastAssistant.id;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLocale === "ru" ? "ru-RU" : "en-US";
    window.speechSynthesis.speak(utterance);
  }, [messages, audioEnabled, isLoading, currentLocale]);

  // VOICE INPUT
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  const toggleVoice = () => {
    if (!hasTakenPhoto) {
      toast.error(t("photoRequiredToast"));
      return;
    }
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.lang = currentLocale === "ru" ? "ru-RU" : "en-US";
      recognition.start();
      setListening(true);
    }
  };

  // CAMERA LOGIC
  const openCamera = async () => {
    setShowPhotoPrompt(false);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error(t("cameraError"));
      setIsCameraOpen(false);
      setShowPhotoPrompt(true);
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
    setCapturedImage(null);

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
            patientId: "69216731-ec0a-4f4e-9cca-e017433b6917",
          }),
        });
        setHasTakenPhoto(true);
        closeCamera();
        toast.success(t("photoVerified"));
      } catch (error) {
        toast.error(t("photoUploadFailed"));
      }
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isComplete || !hasTakenPhoto) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, parts: [{ type: "text", text: m.content }] })),
          locale: currentLocale,
        }),
      });

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = (Date.now() + 1).toString();

      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "text") {
                assistantContent += data.text;

                if (assistantContent.includes("[ASSESSMENT_COMPLETE]")) {
                  setIsComplete(true);
                }

                const cleanText = assistantContent.replace(/\[.*?\]/g, "").trim();

                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: cleanText } : m))
                );
              } else if (data.type === "safety_override") {
                if (typeof window !== "undefined") window.speechSynthesis.cancel();
                router.push(`/${currentLocale}/chat/safety`);
                return;
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PatientShell
      right={
        <div className="flex items-center gap-4 text-primary">
          <button onClick={() => setAudioEnabled(!audioEnabled)} className="cursor-pointer">
            {audioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
          </button>
        </div>
      }
    >
      <div className="border rounded-xl bg-card mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col shadow-sm overflow-hidden relative">

        {/* MANDATORY PHOTO OVERLAY (WITH CLOSE BUTTON) */}
        {!hasTakenPhoto && showPhotoPrompt && (
          <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-card p-8 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200 relative">

              <button
                onClick={() => setShowPhotoPrompt(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 bg-muted rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary mb-6 mx-auto">
                <Camera className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">{t("photoRequired")}</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{t("photoDesc")}</p>
              <button
                onClick={openCamera}
                className="w-full rounded-lg bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                {t("openCamera")}
              </button>
            </div>
          </div>
        )}

        {/* IF THEY CLOSED THE PROMPT, SHOW A BANNER TO REOPEN IT */}
        {!hasTakenPhoto && !showPhotoPrompt && (
          <div className="bg-destructive/10 border-b border-destructive/30 p-3 flex items-center justify-between z-30">
            <div className="flex items-center gap-2 text-destructive font-semibold text-xs">
              <Camera className="h-4 w-4" />
              {t("photoRequiredBanner")}
            </div>
            <button
              onClick={openCamera}
              className="rounded-md bg-destructive text-destructive-foreground px-3 py-1 text-[11px] font-bold hover:bg-destructive/90 transition-colors"
            >
              {t("takePhoto")}
            </button>
          </div>
        )}

        {/* HEADER */}
        <div className="flex items-center gap-3 border-b p-4 shrink-0 bg-card z-10">
          <Link href={`/${currentLocale}`} className="text-primary hover:bg-primary-soft p-1.5 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="font-bold">{t("assistant")}</p>
            <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        {/* MESSAGES */}
        <div className={cn("flex-1 overflow-y-auto p-5 space-y-5 bg-muted/5", !hasTakenPhoto && "opacity-50 blur-[2px] pointer-events-none")}>
          {messages.length === 0 && (
            <div className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                <Bot className="h-5 w-5" />
              </span>
              <div className="max-w-md">
                <p className="rounded-xl bg-primary/10 px-4 py-3 text-left text-sm leading-relaxed text-foreground">
                  {t("welcomeMsg")}
                </p>
              </div>
            </div>
          )}

          {messages.map((m) => {
            const displayContent = m.content.replace(/\[.*?\]/g, "").trim();
            if (m.role === "assistant" && displayContent.length === 0 && !isLoading) return null;

            return (
              <div key={m.id} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", m.role === "assistant" ? "bg-primary/20 text-primary" : "bg-primary/20 text-primary/60")}>
                  {m.role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </span>
                <div className={cn("max-w-[80%]", m.role === "user" && "text-right")}>
                  <p className={cn("rounded-xl px-4 py-3 text-left text-sm leading-relaxed inline-block", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                    {displayContent || (m.role === "assistant" && isLoading ? "..." : "")}
                  </p>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className={cn("relative border-t p-4 shrink-0 bg-card", !hasTakenPhoto && "opacity-50 pointer-events-none")}>
          {!isComplete && (
            <button
              type="button"
              onClick={toggleVoice}
              aria-label={t("voiceAria")}
              className={cn(
                "absolute -top-8 left-1/2 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full shadow-lg ring-4 ring-primary/20 transition-colors",
                listening ? "bg-destructive text-white animate-pulse" : "bg-primary text-primary-foreground"
              )}
            >
              <Mic className="h-6 w-6" />
            </button>
          )}

          {isComplete ? (
            <div className="flex justify-center mt-2">
              <Link
                href={`/${currentLocale}`}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm w-full"
              >
                <CheckCircle2 className="h-5 w-5" /> {t("finishReturn")}
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="flex gap-2 mt-4 items-center">
              <button
                type="button"
                onClick={openCamera}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                aria-label={t("takePhoto")}
              >
                <Camera className="h-5 w-5" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? t("listening") : t("placeholder")}
                disabled={isLoading || !hasTakenPhoto}
                className="flex-1 rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button type="submit" disabled={isLoading || !hasTakenPhoto} className="grid w-10 h-10 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary disabled:opacity-50 hover:bg-primary/30 transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}

          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            {isComplete ? t("assessmentComplete") : t("tapToSpeak")}
          </p>
        </div>
      </div>

      {/* CAMERA MODAL */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/80 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-bold">{t("takePhoto")}</h2>
              <button onClick={closeCamera} aria-label={t("closeAria")}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 flex flex-col items-center">
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                {!capturedImage ? (
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={capturedImage} alt={t("capturedPhotoAlt")} className="w-full h-full object-cover" />
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-3 w-full">
                {!capturedImage ? (
                  <button
                    onClick={capturePhoto}
                    className="flex-1 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {t("capturePhoto")}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="flex-1 rounded-lg border border-border bg-card py-3 text-sm font-bold hover:bg-muted transition-colors"
                    >
                      {t("retakePhoto")}
                    </button>
                    <button
                      onClick={submitPhoto}
                      className="flex-1 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      {t("confirmStartChat")}
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