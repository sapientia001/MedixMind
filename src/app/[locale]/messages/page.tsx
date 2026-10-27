"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Send, User, Stethoscope } from "lucide-react";
import { useTranslations } from "next-intl";
import { PatientShell } from "@/components/medix";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// HARDCODED DEMO IDs
const PATIENT_ID = "69216731-ec0a-4f4e-9cca-e017433b6917";
const DOCTOR_ID = "abae8689-6bf8-4e3f-a505-2556e9f21802";

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export default function PatientMessages() {
  const t = useTranslations("Messages");
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "ru";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?userId=${PATIENT_ID}&otherId=${DOCTOR_ID}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds for demo
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: PATIENT_ID, receiverId: DOCTOR_ID, content: input }),
      });
      setInput("");
      fetchMessages();
    } catch (error) {
      toast.error(t("sendFailed"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <PatientShell>
      <div className="border rounded-xl bg-card mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 border-b p-4 shrink-0 bg-card z-10">
          <Link href={`/${currentLocale}`} className="text-primary hover:bg-primary-soft p-1.5 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="font-bold">{t("title")}</p>
            <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-muted/5">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-10">{t("empty")}</p>
          )}
          {messages.map((m) => {
            const isMe = m.senderId === PATIENT_ID;
            return (
              <div key={m.id} className={cn("flex gap-3", isMe && "flex-row-reverse")}>
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", isMe ? "bg-primary/20 text-primary/60" : "bg-primary/20 text-primary")}>
                  {isMe ? <User className="h-5 w-5" /> : <Stethoscope className="h-5 w-5" />}
                </span>
                <div className={cn("max-w-[80%]", isMe && "text-right")}>
                  <p className={cn("rounded-xl px-4 py-3 text-left text-sm leading-relaxed inline-block", isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border")}>
                    {m.content}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <form onSubmit={sendMessage} className="border-t p-4 shrink-0 bg-card flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            disabled={isSending}
            className="flex-1 rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button type="submit" disabled={isSending} className="grid w-10 place-items-center rounded-lg bg-primary/20 text-primary disabled:opacity-50 hover:bg-primary/30 transition-colors">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </PatientShell>
  );
}