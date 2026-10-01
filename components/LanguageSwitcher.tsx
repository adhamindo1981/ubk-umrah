"use client";

import { useLanguage } from "@/lib/LanguageContext";

export function LanguageSwitcher() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-xl transition shadow-xs select-none"
      title={lang === "id" ? "Ganti ke Bahasa Arab / التبديل للعربية" : "Ganti ke Bahasa Indonesia / التبديل للإندونيسية"}
    >
      <span>{lang === "id" ? "🇮🇩 ID" : "🇸🇦 AR"}</span>
      <span className="text-[10px] text-slate-400">⇄ {lang === "id" ? "العربية" : "Indonesia"}</span>
    </button>
  );
}
