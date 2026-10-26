"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Cross, ShieldCheck, Brain, HeartPulse, User, Stethoscope, Server } from "lucide-react";
import { LoginModal } from "@/components/login-modal";
import { LanguageSwitcher } from "@/components/medix";

type Role = "patient" | "doctor" | "admin";

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("patient");
  const t = useTranslations("Login");

  const openLogin = (role: Role) => {
    setSelectedRole(role);
    setIsLoginOpen(true);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col lg:flex-row bg-[#0a192f] font-sans overflow-hidden">
      
      {/* FULL SCREEN BACKGROUND IMAGE */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 lg:opacity-100 lg:left-[30%] lg:w-[70%]"
        style={{ backgroundImage: "url('/doctor-bg.jpg')" }}
      ></div>

      {/* DARK GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a192f] via-[#0a192f]/80 to-transparent z-10"></div>

      {/* MOBILE HEADER (Removed Language Switcher from here to avoid overlap) */}
      <header className="relative z-30 w-full lg:hidden flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0ea5e9] text-white">
            <Cross className="h-5 w-5" strokeWidth={3} />
          </span>
          <h1 className="text-xl font-bold text-white">{t("title")}</h1>
        </div>
        <button 
          onClick={() => openLogin("patient")}
          className="rounded-lg bg-[#0ea5e9] px-5 py-2 text-sm font-bold text-white shadow-lg"
        >
          {t("signInPatient")}
        </button>
      </header>

      {/* LEFT SIDE - BRANDING (Now takes 55% width on desktop to give Russian text room) */}
      <div className="relative z-20 w-full lg:w-[55%] flex flex-col justify-center px-6 py-8 lg:p-12 xl:p-20 min-h-[auto] lg:min-h-screen max-w-full min-w-0">
        <div className="max-w-lg w-full mx-auto lg:mx-0">
          
          {/* DESKTOP LOGO & LANGUAGE SWITCHER */}
          <div className="hidden lg:flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-xl bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/30 shrink-0">
                <Cross className="h-8 w-8" strokeWidth={3} />
              </span>
              <div>
                <h1 className="text-3xl font-bold text-white leading-tight">{t("title")}</h1>
                <p className="text-sm text-slate-300">{t("subtitle")}</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>

          {/* MOBILE LANGUAGE SWITCHER (Placed above the slogan for clean mobile view) */}
          <div className="flex lg:hidden mb-6">
            <LanguageSwitcher />
          </div>

          {/* Slogan (Adjusted sizes specifically to fit Russian text beautifully) */}
          <h2 className="text-[28px] sm:text-4xl lg:text-[42px] xl:text-[48px] font-bold text-white leading-[1.2] tracking-tight mb-6 break-words">
            {t("slogan1")}<br />
            {t("slogan2")}<br />
            <span className="text-[#0ea5e9]">{t("slogan3")}</span><br />
            {t("slogan4")}
          </h2>

          <p className="text-base sm:text-lg text-white mb-10 flex items-start gap-3 font-medium break-words">
            <span className="mt-1.5 h-5 w-1.5 bg-[#0ea5e9] rounded-full shrink-0"></span>
            {t("tagline")}
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-white">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#0ea5e9] shrink-0" /> 
              <div className="leading-tight whitespace-pre-line">{t("feat1")}</div>
            </div>
            <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-[#0ea5e9] shrink-0" /> 
              <div className="leading-tight whitespace-pre-line">{t("feat2")}</div>
            </div>
            <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-[#0ea5e9] shrink-0" /> 
              <div className="leading-tight whitespace-pre-line">{t("feat3")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - DEMO PROJECT PANEL (Takes 45% width on desktop) */}
      <div className="relative z-30 w-full lg:w-[45%] flex items-center justify-center p-4 sm:p-8 pb-12 lg:pb-0 min-w-0">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20">
          
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{t("demoTitle")}</h3>
            <p className="text-sm text-slate-500">{t("demoSubtitle")}</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => openLogin("patient")}
              className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border border-slate-200 hover:border-[#0ea5e9] hover:bg-blue-50 transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-100 text-[#0ea5e9] group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{t("patientTab")} Portal</p>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate">{t("credPatient")}</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => openLogin("doctor")}
              className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border border-slate-200 hover:border-[#0ea5e9] hover:bg-blue-50 transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{t("doctorTab")} Portal</p>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate">{t("credDoctor")}</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => openLogin("admin")}
              className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl border border-slate-200 hover:border-[#0ea5e9] hover:bg-blue-50 transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Server className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{t("adminTab")} Login</p>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate">{t("credAdmin")}</p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 flex justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> {t("152fz")}</span>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        initialRole={selectedRole} 
      />

    </div>
  );
}