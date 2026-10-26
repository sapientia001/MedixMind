"use client";

import { useState } from "react";
import { Cross, ShieldCheck, Brain, HeartPulse, User, Stethoscope, Server } from "lucide-react";
import { LoginModal } from "@/components/login-modal";

type Role = "patient" | "doctor" | "admin";

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("patient");

  const openLogin = (role: Role) => {
    setSelectedRole(role);
    setIsLoginOpen(true);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col lg:flex-row bg-[#0a192f] font-sans overflow-hidden">
      
      {/* FULL SCREEN BACKGROUND IMAGE - Changed to bg-center for perfect framing */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 lg:opacity-100 lg:left-[30%] lg:w-[70%]"
        style={{ backgroundImage: "url('/doctor-bg.jpg')" }}
      ></div>

      {/* DARK GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a192f] via-[#0a192f]/80 to-transparent z-10"></div>

      {/* MOBILE HEADER */}
      <header className="relative z-30 w-full lg:hidden flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0ea5e9] text-white">
            <Cross className="h-5 w-5" strokeWidth={3} />
          </span>
          <h1 className="text-xl font-bold text-white">MedixMind</h1>
        </div>
        <button 
          onClick={() => openLogin("patient")}
          className="rounded-lg bg-[#0ea5e9] px-5 py-2 text-sm font-bold text-white shadow-lg"
        >
          Login
        </button>
      </header>

      {/* LEFT SIDE - BRANDING */}
      <div className="relative z-20 w-full lg:w-[50%] flex flex-col justify-center px-6 py-12 lg:p-16 xl:p-24 min-h-[80vh] lg:min-h-screen">
        <div className="max-w-lg w-full mx-auto lg:mx-0">
          
          <div className="hidden lg:flex items-center gap-3 mb-12">
            <span className="grid h-14 w-14 place-items-center rounded-xl bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/30 shrink-0">
              <Cross className="h-8 w-8" strokeWidth={3} />
            </span>
            <div>
              <h1 className="text-3xl font-bold text-white leading-tight">MedixMind</h1>
              <p className="text-sm text-slate-300">Secure Clinical Portal</p>
            </div>
          </div>

          <h2 className="text-[42px] sm:text-5xl lg:text-[56px] font-bold text-white leading-[1.1] tracking-tight mb-8">
            MedixMind:<br />
            Detect earlier.<br />
            <span className="text-[#0ea5e9]">Reason better.</span><br />
            Act safer.
          </h2>

          <p className="text-lg sm:text-xl text-white mb-12 flex items-center gap-4 font-medium">
            <span className="h-6 w-1.5 bg-[#0ea5e9] rounded-full shrink-0"></span>
            The AI that knows its limits.
          </p>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-sm font-semibold text-white">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-[#0ea5e9] shrink-0" /> 
              <div className="leading-tight">Safer<br/>Decisions</div>
            </div>
            <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-[#0ea5e9] shrink-0" /> 
              <div className="leading-tight">Smarter<br/>Insights</div>
            </div>
            <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 sm:h-6 sm:w-6 text-[#0ea5e9] shrink-0" /> 
              <div className="leading-tight">Better<br/>Outcomes</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - DEMO PROJECT PANEL */}
      <div className="relative z-30 w-full lg:w-[50%] flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Demo Project</h3>
            <p className="text-sm text-slate-500">Select a role to access the secure portal.</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => openLogin("patient")}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-[#0ea5e9] hover:bg-blue-50 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-[#0ea5e9] group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Patient Portal</p>
                  <p className="text-xs text-slate-500">Log in with an access code</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => openLogin("doctor")}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-[#0ea5e9] hover:bg-blue-50 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Doctor Portal</p>
                  <p className="text-xs text-slate-500">Access clinical dashboard</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => openLogin("admin")}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-[#0ea5e9] hover:bg-blue-50 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Admin Login</p>
                  <p className="text-xs text-slate-500">Manage system & users</p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 flex justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-500" /> 152-FZ Compliant</span>
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