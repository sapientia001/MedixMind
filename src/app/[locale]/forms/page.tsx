"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronDown, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PatientShell } from "@/components/medix";
import { cn } from "@/lib/utils";

const questions = [
  "Feeling down, depressed, or hopeless?",
  "Little interest or pleasure in doing things?",
  "Trouble falling or staying asleep, or sleeping too much?",
  "Feeling tired or having little energy?",
  "Poor appetite or overeating?",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
  "Trouble concentrating on things, such as reading the newspaper or watching television?",
  "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?"
];

const options = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

export default function Form() {
  const [open, setOpen] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleNext = () => {
    if (step < 8) {
      setStep(step + 1);
      setOpen(step); 
    } else {
      toast.success("Form submitted successfully. Your clinician will review this.");
      router.push("/"); 
    }
  };

  return (
    <PatientShell 
      right={
        <Link href="/" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          <LogOut className="h-4 w-4" /> Save & Exit
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3 text-sm font-bold">
          <span className="text-muted-foreground">{step} of 8</span>
          <div className="h-2.5 flex-1 rounded-full bg-primary-soft overflow-hidden">
            <div 
              className="h-full rounded-full bg-primary transition-all duration-300" 
              style={{ width: `${(step / 8) * 100}%` }} 
            />
          </div>
        </div>

        <div className="card-surface p-6">
          <h1 className="text-lg font-bold text-foreground">PHQ-9 Depression Scale</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Over the last 2 weeks, how often have you been bothered by:
          </p>
          
          <div className="mt-5 space-y-3">
            {questions.map((q, i) => (
              <div key={i} className={cn("rounded-xl border transition-colors", open === i ? "border-primary/50 bg-primary-soft/30" : "bg-card")}>
                <button 
                  onClick={() => setOpen(open === i ? -1 : i)} 
                  className="flex w-full items-center justify-between p-4 text-left text-sm font-medium hover:bg-muted/30 transition-colors rounded-xl"
                >
                  <span className="text-foreground">{i + 1}. {q}</span>
                  <ChevronDown className={cn("h-4 w-4 text-primary transition-transform", open === i && "rotate-180")} />
                </button>
                
                {open === i && (
                  <div className="space-y-3 px-4 pb-5 pt-1">
                    {options.map((o, j) => (
                      <label key={o} className="flex cursor-pointer items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                        <input 
                          type="radio" 
                          name={`q${i}`} 
                          checked={answers[i] === j} 
                          onChange={() => setAnswers({ ...answers, [i]: j })} 
                          className="h-4 w-4 accent-primary" 
                        />
                        {o}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between pb-8">
          <button 
            onClick={() => {
              setStep(Math.max(1, step - 1));
              setOpen(step - 2);
            }} 
            disabled={step === 1}
            className="flex items-center gap-2 rounded-lg border border-primary/40 bg-card px-6 py-2.5 text-sm font-semibold text-primary hover:bg-primary-soft disabled:opacity-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>
          
          <button 
            onClick={handleNext} 
            className="flex items-center gap-2 rounded-lg bg-primary px-8 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            {step === 8 ? "Submit Form" : "Next"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </PatientShell>
  );
}