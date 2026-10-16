"use client";

import React from "react";
import Link from "next/link";
import { BackButton } from "@/components/BackButton";
import { UbkLogo } from "@/components/UbkLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageContext";

export function AiStudioHeader() {
  const { isArabic } = useLanguage();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs" dir={isArabic ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BackButton fallbackUrl="/dashboard" />
          <Link href="/" className="hover:opacity-90 transition">
            <UbkLogo size="sm" showSubtitle={false} />
          </Link>
          <span className="text-xs font-black bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 px-3 py-1 rounded-full shadow-2xs">
            {isArabic ? "استوديو الذكاء الاصطناعي ✨" : "AI Marketing Studio ✨"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <Link
            href="/dashboard"
            className="text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
          >
            {isArabic ? "← العودة للوحة التحكم" : "← Kembali ke Dasbor"}
          </Link>
        </div>
      </div>
    </header>
  );
}
