"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Locale } from "./translations";

interface LanguageContextType {
  lang: Locale;
  toggleLang: () => void;
  setLanguage: (newLang: Locale) => void;
  t: (key: keyof typeof translations.id, params?: Record<string, string | number>) => string;
  isArabic: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Locale>("id");

  useEffect(() => {
    // Check saved preference in localStorage or cookie
    const saved = localStorage.getItem("ubk_lang") as Locale | null;
    if (saved === "ar" || saved === "id") {
      setLang(saved);
      applyDirection(saved);
    } else {
      applyDirection("id");
    }
  }, []);

  function applyDirection(locale: Locale) {
    if (typeof document !== "undefined") {
      const dir = locale === "ar" ? "rtl" : "ltr";
      document.documentElement.dir = dir;
      document.documentElement.lang = locale;
      if (document.body) {
        document.body.dir = dir;
      }
    }
  }

  function setLanguage(newLang: Locale) {
    setLang(newLang);
    localStorage.setItem("ubk_lang", newLang);
    document.cookie = `ubk_lang=${newLang}; path=/; max-age=31536000`;
    applyDirection(newLang);
  }

  function toggleLang() {
    const next = lang === "id" ? "ar" : "id";
    setLanguage(next);
  }

  function t(key: keyof typeof translations.id, params?: Record<string, string | number>): string {
    const dict = translations[lang] || translations.id;
    let text = (dict as any)[key] || (translations.id as any)[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramVal));
      });
    }

    return text;
  }

  return (
    <LanguageContext.Provider
      value={{
        lang,
        toggleLang,
        setLanguage,
        t,
        isArabic: lang === "ar",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
