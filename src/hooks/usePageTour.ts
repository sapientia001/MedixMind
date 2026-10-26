"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useTranslations, useLocale } from "next-intl";

export type TourStep = {
  element: string;
  titleKey: string;
  descKey: string;
};

export function usePageTour(
  tourKey: string,
  steps: TourStep[],
  options?: { speak?: boolean }
) {
  const t = useTranslations("Tours");
  const locale = useLocale();
  const shouldSpeak = options?.speak ?? false;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storageKey = `medixmind-tour-${tourKey}`;
    if (localStorage.getItem(storageKey)) return;

    // Only run if all target elements exist (avoid broken tours)
    const allPresent = steps.every((s) => document.querySelector(s.element));
    if (!allPresent) {
      // Elements not mounted yet — wait a tick and retry once
      const timeout = setTimeout(() => {
        if (steps.every((s) => document.querySelector(s.element))) {
          start();
        }
      }, 500);
      return () => clearTimeout(timeout);
    }

    start();

    function start() {
      let utterance: SpeechSynthesisUtterance | null = null;

      const speak = (text: string) => {
        if (!shouldSpeak || typeof window === "undefined" || !window.speechSynthesis) return;
        if (utterance) window.speechSynthesis.cancel();
        utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = locale === "ru" ? "ru-RU" : "en-US";
        window.speechSynthesis.speak(utterance);
      };

      const driverObj = driver({
        showProgress: true,
        nextBtnText: t("next"),
        prevBtnText: t("back"),
        doneBtnText: t("finish"),
        steps: steps.map((s) => ({
          element: s.element,
          popover: {
            title: t(s.titleKey),
            description: t(s.descKey),
          },
          onHighlightStarted: () => speak(`${t(s.titleKey)}. ${t(s.descKey)}`),
        })),
        onDestroyed: () => {
          localStorage.setItem(storageKey, "true");
          if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
        },
      });

      driverObj.drive();
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}