"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";

interface BackButtonProps {
  label?: string;
  fallbackUrl?: string;
}

export function BackButton({ label, fallbackUrl }: BackButtonProps) {
  const router = useRouter();
  const { t, isArabic } = useLanguage();

  const buttonText = label || (isArabic ? "→ رجوع" : "← Kembali");

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else if (fallbackUrl) {
      router.push(fallbackUrl);
    } else {
      router.push("/");
    }
  }

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition"
    >
      <span>{buttonText}</span>
    </button>
  );
}
