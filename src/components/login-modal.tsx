"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { X, ShieldCheck, LockKeyhole, ArrowRight, KeyRound, Stethoscope, User, Server, Loader2, Info } from "lucide-react";
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
  
  const t = useTranslations("Login");
  
  const [role, setRole] = useState<Role>(initialRole);
  const [step, setStep] = useState<"login" | "onboard">("login");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [consent, setConsent] = useState(false);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setStep("login");
      setEmail("");
      setPassword("");
      setAccessCode("");
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // DOCTOR LOGIN (Trimmed to ignore accidental spaces)
    if (role === "doctor") {
      setTimeout(() => {
        setLoading(false);
        // Use .trim() to prevent errors from trailing spaces
        if (email.trim() === "doctor@medixmind.com" && password.trim() === "password123") {
          toast.success("Doctor authenticated.");
          router.push(`/${currentLocale}/doctor`);
          onClose();
        } else {
          toast.error(currentLocale === 'ru' ? "Неверные данные. Используйте демо-доступ." : "Invalid credentials. Please use the demo access.");
        }
      }, 1000);
      return;
    }

    // ADMIN LOGIN
    if (role === "admin") {
      setTimeout(() => {
        setLoading(false);
        if (email && password) {
          toast.success("Admin authenticated.");
          router.push(`/${currentLocale}/admin`);
          onClose();
        }
      }, 1000);
      return;
    }

    // PATIENT LOGIN
    try {
      const res = await fetch("/api/patient/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || (currentLocale === 'ru' ? "Неверный код доступа." : "Invalid access code."));
        setLoading(false);
        return;
      }

      if (data.needsOnboarding) {
        setStep("onboard");
      } else {
        toast.success(currentLocale === 'ru' ? "С возвращением." : "Welcome back.");
        router.push(`/${currentLocale}`);
        onClose();
      }
    } catch (error) {
      toast.error(currentLocale === 'ru' ? "Ошибка проверки кода." : "Failed to verify access code.");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error(currentLocale === 'ru' ? "Необходимо согласие на обработку данных." : "You must consent to personal data processing.");
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

      toast.success(currentLocale === 'ru' ? "Профиль успешно создан." : "Profile created successfully.");
      router.push(`/${currentLocale}`);
      onClose();
    } catch (error) {
      toast.error(currentLocale === 'ru' ? "Ошибка сохранения профиля." : "Failed to save profile.");
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
                onClick={() => { setRole("patient"); setEmail(""); setPassword(""); }}
                className={cn("flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold py-2.5 rounded-md transition-all", role === "patient" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
              >
                <User className="h-4 w-4" /> {t("patientTab")}
              </button>
              <button
                onClick={() => { setRole("doctor"); setAccessCode(""); }}
                className={cn("flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold py-2.5 rounded-md transition-all", role === "doctor" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
              >
                <Stethoscope className="h-4 w-4" /> {t("doctorTab")}
              </button>
              <button
                onClick={() => { setRole("admin"); setAccessCode(""); }}
                className={cn("flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold py-2.5 rounded-md transition-all", role === "admin" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
              >
                <Server className="h-4 w-4" /> {t("adminTab")}
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {(role === "doctor" || role === "admin") && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{t("email")}</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@medixmind.com" className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0ea5e9]/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{t("password")}</label>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0ea5e9]/50" />
                  </div>
                </>
              )}

              {role === "patient" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{t("accessCode")}</label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input type="text" required value={accessCode} onChange={(e) => setAccessCode(e.target.value.toUpperCase())} placeholder="MD-XXXXX" className="w-full rounded-lg border border-slate-200 pl-11 pr-4 py-3 text-sm font-mono tracking-widest outline-none focus:ring-2 focus:ring-[#0ea5e9]/50" />
                    </div>
                  </div>
                </>
              )}

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0ea5e9] py-3.5 text-sm font-bold text-white hover:bg-[#0284c7] transition-colors shadow-md mt-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : role === "doctor" ? t("signInDoctor") : role === "admin" ? t("signInAdmin") : t("signInPatient")}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            {/* DYNAMIC DEMO CREDENTIALS BOX */}
            <div className="mt-6 rounded-lg bg-blue-50 p-4 text-xs text-[#0ea5e9] border border-blue-100">
              <p className="font-bold mb-2 flex items-center gap-1.5"><Info className="h-4 w-4" /> {t("demoCreds")}</p>
              <ul className="space-y-1 text-slate-600">
                {role === "patient" && <li>{t("credPatient")}</li>}
                {role === "doctor" && <li>{t("credDoctor")}</li>}
                {role === "admin" && <li>{t("credAdmin")}</li>}
              </ul>
            </div>
          </>
        )}

        {step === "onboard" && (
          <form onSubmit={handleOnboard} className="space-y-4 mt-4">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">{t("demoTitle")}</h2>
              <p className="text-xs text-slate-500">{t("demoSubtitle")}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{currentLocale === 'ru' ? "Полное имя" : "Full Name"}</label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={currentLocale === 'ru' ? "Иван Иванов" : "e.g., Sarah Johnson"} className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0ea5e9]/50" />
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 mt-4">
              <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-[#0ea5e9]" />
              <label htmlFor="consent" className="text-[11px] leading-relaxed text-slate-600">
                {t("consent")}
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0ea5e9] py-3.5 text-sm font-bold text-white hover:bg-[#0284c7] transition-colors shadow-sm mt-4">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("completeReg")}
            </button>
          </form>
        )}

        <div className="mt-6 flex justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> {t("152fz")}</span>
          <span className="flex items-center gap-1.5"><LockKeyhole className="h-4 w-4 text-green-500" /> {t("secureHosting")}</span>
        </div>
      </div>
    </div>
  );
}