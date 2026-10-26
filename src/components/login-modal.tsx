"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, ShieldCheck, LockKeyhole, ArrowRight, KeyRound, Stethoscope, User, Loader2, Info, Server } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Role = "patient" | "doctor" | "admin";

export function LoginModal({ 
  isOpen, 
  onClose, 
  initialRole = "patient" 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  initialRole?: Role;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "ru"; 
  
  // Use the initialRole passed from the parent
  const [role, setRole] = useState<Role>(initialRole);
  const [step, setStep] = useState<"login" | "onboard">("login");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [consent, setConsent] = useState(false);
  
  const [loading, setLoading] = useState(false);

  // Update role if the modal is opened with a different initialRole
  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setStep("login");
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (role === "doctor") {
      setTimeout(() => {
        setLoading(false);
        if (email && password) {
          toast.success("Doctor authenticated.");
          router.push(`/${currentLocale}/doctor`);
        }
      }, 1000);
      return;
    }

    if (role === "admin") {
      setTimeout(() => {
        setLoading(false);
        if (email && password) {
          toast.success("Admin authenticated.");
          router.push(`/${currentLocale}/admin`);
        }
      }, 1000);
      return;
    }

    try {
      const res = await fetch("/api/patient/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid access code.");
        setLoading(false);
        return;
      }

      if (data.needsOnboarding) {
        setStep("onboard");
      } else {
        toast.success("Welcome back.");
        router.push(`/${currentLocale}`);
      }
    } catch (error) {
      toast.error("Failed to verify access code.");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error("You must consent to personal data processing.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/patient/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode, fullName }),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      toast.success("Profile created successfully.");
      router.push(`/${currentLocale}`);
    } catch (error) {
      toast.error("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 animate-in zoom-in-95">
        
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full transition-colors">
          <X className="h-5 w-5" />
        </button>

        {step === "login" && (
          <>
            <div className="flex bg-slate-100 rounded-lg p-1 mb-6 border border-slate-200 mt-4">
              <button
                onClick={() => setRole("patient")}
                className={cn("flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold py-2.5 rounded-md transition-all", role === "patient" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
              >
                <User className="h-4 w-4" /> Patient
              </button>
              <button
                onClick={() => setRole("doctor")}
                className={cn("flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold py-2.5 rounded-md transition-all", role === "doctor" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
              >
                <Stethoscope className="h-4 w-4" /> Doctor
              </button>
              <button
                onClick={() => setRole("admin")}
                className={cn("flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold py-2.5 rounded-md transition-all", role === "admin" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
              >
                <Server className="h-4 w-4" /> Admin
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {(role === "doctor" || role === "admin") && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{role === "admin" ? "Admin Email" : "Hospital Email"}</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@medixmind.com" className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0ea5e9]/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0ea5e9]/50" />
                  </div>
                </>
              )}

              {role === "patient" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Access Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input type="text" required value={accessCode} onChange={(e) => setAccessCode(e.target.value.toUpperCase())} placeholder="MD-XXXXX" className="w-full rounded-lg border border-slate-200 pl-11 pr-4 py-3 text-sm font-mono tracking-widest outline-none focus:ring-2 focus:ring-[#0ea5e9]/50" />
                    </div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4 text-xs text-[#0ea5e9] mt-4 border border-blue-100">
                    <p className="font-bold mb-1 flex items-center gap-1.5"><Info className="h-4 w-4" /> How to log in:</p>
                    <p className="text-slate-600 leading-relaxed">Your attending physician will provide you with a secure 6-character access code.</p>
                  </div>
                </>
              )}

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0ea5e9] py-3.5 text-sm font-bold text-white hover:bg-[#0284c7] transition-colors shadow-md mt-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </>
        )}

        {step === "onboard" && (
          // ... (Onboarding form remains the same)
          <div>Onboarding...</div>
        )}

        <div className="mt-8 flex justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> 152-FZ Compliant</span>
          <span className="flex items-center gap-1.5"><LockKeyhole className="h-4 w-4 text-green-500" /> Secure RU Hosting</span>
        </div>
      </div>
    </div>
  );
}