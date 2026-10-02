"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";

interface BackButtonProps {
  label?: string;
  fallbackUrl?: string;
  className?: string;
}

export function BackButton({ label, fallbackUrl, className }: BackButtonProps) {
  const router = useRouter();
  const { isArabic } = useLanguage();

  const buttonText = label || (isArabic ? "← العودة" : "← Kembali");

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (fallbackUrl) {
      router.push(fallbackUrl);
    } else {
      router.push("/");
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={
        className ||
        "inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl shadow-xs transition active:scale-95"
      }
      title={isArabic ? "العودة للصفحة السابقة" : "Kembali ke halaman sebelumnya"}
    >
      <span>{buttonText}</span>
    </button>
  );
}
