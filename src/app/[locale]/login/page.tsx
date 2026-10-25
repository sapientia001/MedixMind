"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cross, ShieldCheck, LockKeyhole, ArrowRight, KeyRound, Stethoscope, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Role = "patient" | "doctor";

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("doctor");
  
  // Doctor state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Patient state
  const [accessCode, setAccessCode] = useState("");
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API authentication
    setTimeout(() => {
      setLoading(false);
      
      if (role === "doctor") {
        if (email && password) {
          toast.success("Doctor authenticated.");
          router.push("/doctor");
        }
      } else {
        if (accessCode.length > 3) {
          toast.success("Access code verified. Linking to Doctor.");
          router.push("/"); // Routes to Patient Dashboard
        } else {
          toast.error("Invalid access code.");
        }
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center">
        <span className="grid h-14 w-14 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg mb-4">
          <Cross className="h-8 w-8" strokeWidth={3} />
        </span>
        <h1 className="text-2xl font-bold text-foreground">MedixDeck</h1>
        <p className="text-sm text-muted-foreground mt-1">Secure Clinical Portal</p>
      </div>

      <div className="w-full max-w-md card-surface p-8">
        
        {/* Role Selection Tabs */}
        <div className="flex bg-muted rounded-lg p-1 mb-6">
          <button
            onClick={() => setRole("doctor")}
            className={cn("flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-md transition-all", role === "doctor" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <Stethoscope className="h-4 w-4" /> Doctor
          </button>
          <button
            onClick={() => setRole("patient")}
            className={cn("flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-md transition-all", role === "patient" ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <User className="h-4 w-4" /> Patient
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* DOCTOR LOGIN FORM */}
          {role === "doctor" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Hospital Email</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dr.smith@hospital.ru"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Password</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50" 
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-center pt-1">
                Doctor accounts are provisioned by the hospital administrator.
              </p>
            </>
          )}

          {/* PATIENT LOGIN FORM */}
          {role === "patient" && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Access Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    required 
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    placeholder="MD-XXXXX"
                    className="w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm font-mono tracking-widest outline-none focus:ring-2 focus:ring-primary/50" 
                  />
                </div>
              </div>
              <div className="rounded-lg bg-primary-soft p-3 text-xs text-primary-foreground mt-2 border border-primary/20">
                <p className="font-semibold text-primary mb-1">How to log in:</p>
                <p className="text-muted-foreground leading-tight">
                  Your attending physician will provide you with a secure 6-character access code. This links your data directly to their medical dashboard.
                </p>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm mt-4 disabled:opacity-70"
          >
            {loading ? "Authenticating..." : role === "doctor" ? "Doctor Sign In" : "Verify Access Code"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* Security Badges */}
        <div className="mt-8 flex justify-center gap-4 text-[10px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-success" /> 152-FZ Compliant</span>
          <span className="flex items-center gap-1"><LockKeyhole className="h-3.5 w-3.5 text-success" /> Secure RU Hosting</span>
        </div>
      </div>
    </div>
  );
}