"use client";
export const instant = false;

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Mic, Send, User, Volume2, VolumeX, Sparkles } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { PatientShell } from "@/components/medix";
import { cn } from "@/lib/utils";

type UIMessagePart = { type: string; text?: string };
type UIMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  parts: UIMessagePart[];
};

export default function Chat() {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const recognitionRef = useRef<any>(null);
  const spokenMessageIdRef = useRef<string | null>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const typedMessages = messages as UIMessage[];

  useEffect(() => {
    const lastAssistant = [...typedMessages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;

    const fullText = lastAssistant.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("")
      .toLowerCase();

    const hasTag = fullText.includes("[safety_override]");
    const riskKeywords = [
      "kill myself", "end my life", "want to die", "not want to be here",
      "suicidal", "suicide", "self-harm", "hurt myself", "no reason to live", "better off dead",
    ];
    const hasKeyword = riskKeywords.some((k) => fullText.includes(k));

    if (hasTag || hasKeyword) {
      if (typeof window !== "undefined") window.speechSynthesis.cancel();
      alert("SAFETY OVERRIDE: The system detected a critical risk. Please contact emergency services or your clinician immediately.");
    }
  }, [typedMessages]);

  useEffect(() => {
    if (!audioEnabled || status === "streaming" || typeof window === "undefined" || !window.speechSynthesis) return;

    const lastAssistant = [...typedMessages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant || spokenMessageIdRef.current === lastAssistant.id) return;

    const text = lastAssistant.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("")
      .replace("[SAFETY_OVERRIDE]", "")
      .trim();

    if (text.length === 0) return;

    spokenMessageIdRef.current = lastAssistant.id;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }, [typedMessages, audioEnabled, status]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

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
    const recognition = recognitionRef.current;
    if (!recognition) return alert("Voice input is not supported in this browser. Use Chrome.");
    if (listening) { recognition.stop(); setListening(false); }
    else { recognition.start(); setListening(true); }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ role: "user", parts: [{ type: "text", text: input }] });
    setInput("");
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
      <div className="border rounded-xl bg-card mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col">
        <div className="flex items-center gap-3 border-b p-4">
          <Link href="/" className="text-primary"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <p className="font-bold">AI Assistant</p>
            <p className="text-xs text-muted-foreground">Your mental health assistant</p>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {typedMessages.length === 0 && (
            <div className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                <Bot className="h-5 w-5" />
              </span>
              <div className="max-w-md">
                <p className="rounded-xl bg-primary/10 px-4 py-3 text-left text-sm leading-relaxed">
                  How have you been sleeping lately? I also noticed your heart rate variability was a bit lower last night.
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Just now</p>
              </div>
            </div>
          )}

          {typedMessages.map((m) => {
            const text = m.parts
              .filter((p) => p.type === "text")
              .map((p) => p.text ?? "")
              .join("")
              .replace("[SAFETY_OVERRIDE]", "")
              .trim();

            if (m.role === "assistant" && text.length === 0) return null;

            return (
              <div key={m.id} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", m.role === "assistant" ? "bg-primary/20 text-primary" : "bg-primary/20 text-primary/60")}>
                  {m.role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </span>
                <div className={cn("max-w-md", m.role === "user" && "text-right")}>
                  <p className={cn("rounded-xl px-4 py-3 text-left text-sm leading-relaxed", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10")}>
                    {text}
                  </p>
                </div>
              </div>
            );
          })}

          {status === "streaming" && (
            <div className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </span>
              <div className="max-w-md">
                <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm italic text-muted-foreground">
                  Typing...
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="relative border-t p-4">
          <button
            type="button"
            onClick={toggleVoice}
            aria-label="Speak"
            className={cn(
              "absolute -top-8 left-1/2 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full shadow-lg ring-4 ring-primary/20 transition-colors",
              listening ? "bg-red-500 text-white animate-pulse" : "bg-primary text-primary-foreground"
            )}
          >
            <Mic className="h-6 w-6" />
          </button>
          
          <form onSubmit={submit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening..." : "Type a message..."}
              disabled={status === "streaming"}
              className="flex-1 rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button type="submit" disabled={status === "streaming"} aria-label="Send" className="grid w-10 place-items-center rounded-lg bg-primary/20 text-primary disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Tap the mic to speak · Or type your message
          </p>
        </div>
      </div>
    </PatientShell>
  );
}