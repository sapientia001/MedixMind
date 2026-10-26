"use client";

import { useState, useEffect, useRef } from "react";
import { DoctorShell } from "@/components/medix";
import { Send, User, Stethoscope, ArrowLeft, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

// HARDCODED DEMO IDs
const PATIENT_ID = "69216731-ec0a-4f4e-9cca-e017433b6917";
const DOCTOR_ID = "abae8689-6bf8-4e3f-a505-2556e9f21802";

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export default function DoctorMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?userId=${DOCTOR_ID}&otherId=${PATIENT_ID}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
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
        body: JSON.stringify({ senderId: DOCTOR_ID, receiverId: PATIENT_ID, content: input }),
      });
      setInput("");
      fetchMessages();
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DoctorShell>
      <div className="mx-auto max-w-4xl flex gap-4 h-[calc(100vh-10rem)]">
        
        {/* LEFT SIDEBAR: Patient List for Inbox */}
        <div className="w-1/3 card-surface flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-muted/10">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Inbox
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Active Patient Chat */}
            <div className="p-4 border-b bg-primary/5 cursor-pointer border-l-4 border-l-primary">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  MJ
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">Mike Jame</p>
                  <p className="text-xs text-muted-foreground truncate">MD-12345</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Chat Window */}
        <div className="w-2/3 card-surface flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b p-4 shrink-0 bg-card">
            <Link href="/doctor/patients" className="text-primary hover:bg-primary-soft p-1.5 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="font-bold">Mike Jame</p>
              <p className="text-xs text-muted-foreground">Patient MD-12345</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-muted/5">
            {messages.length === 0 && (
              <p className="text-center text-sm text-muted-foreground mt-10">No messages yet.</p>
            )}
            {messages.map((m) => {
              const isMe = m.senderId === DOCTOR_ID;
              return (
                <div key={m.id} className={cn("flex gap-3", isMe && "flex-row-reverse")}>
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", isMe ? "bg-indigo-100 text-indigo-600" : "bg-primary/20 text-primary")}>
                    {isMe ? <Stethoscope className="h-5 w-5" /> : <User className="h-5 w-5" />}
                  </span>
                  <div className={cn("max-w-[80%]", isMe && "text-right")}>
                    <p className={cn("rounded-xl px-4 py-3 text-left text-sm leading-relaxed inline-block", isMe ? "bg-indigo-600 text-white" : "bg-muted text-foreground border")}>
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
              placeholder="Type a message to the patient..."
              disabled={isSending}
              className="flex-1 rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button type="submit" disabled={isSending} className="grid w-10 place-items-center rounded-lg bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700 transition-colors">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </DoctorShell>
  );
}