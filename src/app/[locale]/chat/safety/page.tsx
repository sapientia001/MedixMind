"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { PhoneCall, Heart, ArrowLeft } from "lucide-react";
import { PatientShell } from "@/components/medix";

export default function SafetyScreen() {
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "ru";

  return (
    <PatientShell>
      <div className="mx-auto max-w-2xl mt-10">
        <div className="card-surface p-8 md:p-12 text-center border-t-4 border-destructive shadow-lg">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-destructive/10 text-destructive mb-6">
            <Heart className="h-10 w-10 animate-pulse" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {currentLocale === 'ru' ? "Ваша безопасность важнее всего" : "Your safety is the most important thing"}
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            {currentLocale === 'ru' 
              ? "Мы слышим, что вам очень тяжело. Пожалуйста, не оставайтесь с этим наедине. Немедленно свяжитесь с вашим врачом или позвоните в экстренные службы. Ваша жизнь имеет значение."
              : "We hear that you are in a lot of pain. Please do not go through this alone. Reach out to your doctor immediately or call emergency services. Your life matters."}
          </p>

          <div className="space-y-4 max-w-sm mx-auto">
            <a 
              href="tel:112" 
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive py-4 text-lg font-bold text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
            >
              <PhoneCall className="h-5 w-5" />
              {currentLocale === 'ru' ? "Позвонить 112" : "Call 112 (Emergency)"}
            </a>
            
            <Link 
              href="/" 
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-primary/20 bg-white py-4 text-lg font-bold text-primary hover:bg-primary-soft transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              {currentLocale === 'ru' ? "Вернуться на главную" : "Return to Dashboard"}
            </Link>
          </div>

          <p className="mt-8 text-xs text-muted-foreground">
            {currentLocale === 'ru' 
              ? "Ваш врач уже получил уведомление о том, что вам нужна помощь." 
              : "Your doctor has already been notified that you need support."}
          </p>
        </div>
      </div>
    </PatientShell>
  );
}