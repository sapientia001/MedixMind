"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";
import PatientProfile from "../patient/page";

export default function Alerts() {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const handleReview = () => {
    setOpen(false);
    router.push("/doctor/patient");
  };

  const handleAcknowledge = () => {
    setOpen(false);
    toast.success("Alert acknowledged. Logged in clinical audit trail.");
  };

  return (
    <>
      {/* Background content (Patient Profile already contains the DoctorShell) */}
      <PatientProfile />

      {/* The Critical Alert Modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-center gap-2 bg-destructive px-4 py-3 text-lg font-bold text-destructive-foreground">
              <TriangleAlert className="h-6 w-6 animate-pulse" />
              CRITICAL ALERT
              <button 
                onClick={() => setOpen(false)} 
                className="ml-auto text-destructive-foreground/80 hover:text-destructive-foreground transition-colors" 
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 p-6 text-center">
              <p className="text-sm leading-relaxed text-foreground">
                Patient <strong className="font-semibold">Sarah Johnson</strong> has triggered a safety flag during her latest assessment and shows abnormal physiological stress markers (Elevated EDA, Dropping HRV).
              </p>
              
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={handleReview} 
                  className="w-full rounded-md bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
                >
                  Review Immediately
                </button>
                <button 
                  onClick={handleAcknowledge} 
                  className="w-full rounded-md border border-primary/40 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                >
                  Acknowledge & Log
                </button>
              </div>
              
              <p className="text-[10px] text-muted-foreground pt-2">
                Alerts are generated based on validated clinical thresholds. The clinician retains full responsibility for patient routing and care.
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}