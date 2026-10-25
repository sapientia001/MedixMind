"use client";

import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();

  // Get the current language from the URL (e.g., '/en/doctor' -> 'en')
  const currentLocale = pathname.split("/")[1] || "en";

  const toggleLanguage = () => {
    const newLocale = currentLocale === "en" ? "ru" : "en";
    // Replace the language part of the URL and keep the rest
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary-soft transition-colors shadow-sm"
    >
      <Globe className="h-4 w-4" />
      {currentLocale === "en" ? "RU" : "EN"}
    </button>
  );
}