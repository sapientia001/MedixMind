"use client";

import { useState } from "react";
import { DoctorShell } from "@/components/medix";
import { UserPlus, Key, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AddPatientPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  // Hardcoded Demo Doctor ID from your seed script
  const DEMO_DOCTOR_ID = "abae8689-6bf8-4e3f-a505-2556e9f21802";

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedCode(null);

    try {
      const res = await fetch("/api/doctor/create-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: DEMO_DOCTOR_ID }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create patient");

      setGeneratedCode(data.accessCode);
      toast.success("Patient access code generated successfully.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast.success("Access code copied to clipboard!");
    }
  };

  return (
    <DoctorShell>
      <div className="max-w-[800px] mx-auto space-y-6">
        
        <div>
          <h1 className="text-[22px] font-bold text-foreground">Add New Patient</h1>
          <p className="text-sm text-muted-foreground">Generate a secure access code to link a new patient to your dashboard.</p>
        </div>

        <div className="card-surface p-8 text-center space-y-6">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary mb-2">
            <UserPlus className="h-10 w-10" />
          </div>
          
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-2">Patient Registration</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Patients do not create their own accounts. Click the button below to generate a unique 6-character Access Code. Give this code to your patient so they can securely log in and link their data to you.
            </p>

            {!generatedCode ? (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70"
              >
                {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Key className="h-4 w-4" /> Generate Access Code</>}
              </button>
            ) : (
              <div className="rounded-xl border border-success/30 bg-success-soft p-6 animate-in zoom-in-95">
                <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-sm font-bold text-success-foreground mb-1">Patient Created Successfully</p>
                <p className="text-xs text-success-foreground/80 mb-4">Provide this code to your patient:</p>
                
                <div className="flex items-center justify-between bg-white border border-success/30 rounded-lg p-3">
                  <span className="font-mono text-2xl font-bold tracking-widest text-foreground">
                    {generatedCode}
                  </span>
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 rounded-md bg-success/10 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/20 transition-colors"
                  >
                    <Copy className="h-3 w-3" /> Copy
                  </button>
                </div>

                <button
                  onClick={() => setGeneratedCode(null)}
                  className="mt-6 text-xs font-semibold text-primary hover:underline"
                >
                  Generate another code
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </DoctorShell>
  );
}