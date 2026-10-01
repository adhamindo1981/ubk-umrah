"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BackButton } from "@/components/BackButton";
import { IslamicPattern } from "@/components/IslamicPattern";
import { UbkLogo } from "@/components/UbkLogo";

export default function SignUpPage() {
  const { t, isArabic } = useLanguage();

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans transition-all selection:bg-amber-400 selection:text-slate-950 overflow-hidden"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Islamic Arabesque Pattern Watermark */}
      <IslamicPattern opacity={0.06} color="#fbbf24" scale={72} />

      <div className="w-full max-w-md rounded-3xl bg-slate-900/90 backdrop-blur-md p-8 sm:p-9 shadow-2xl border border-amber-500/30 text-center space-y-6 relative z-10">
        {/* Top Control Bar with Back Button and Language Switcher */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <BackButton fallbackUrl="/auth/signin" />
          <LanguageSwitcher />
        </div>

        <div className="flex justify-center">
          <Link href="/" className="hover:opacity-95 transition">
            <UbkLogo size="md" variant="dark" animated={true} />
          </Link>
        </div>

        <div className="space-y-2">
          <span className="inline-block text-[10px] font-black text-amber-300 tracking-wider uppercase bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/30">
            {t("invitationBadge")}
          </span>
          <h2 className="text-2xl font-black text-white">
            {t("invitationTitle")}
          </h2>
          <p className="text-xs text-slate-400">
            {t("invitationSubtitle")}
          </p>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          {t("invitationDesc")}
        </p>

        <p className="text-[11px] text-slate-500">
          {t("receivedTempAccount")}
        </p>

        <div className="pt-2">
          <Link
            href="/auth/signin"
            className="w-full block py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-emerald-950/60 transition-all duration-300 transform active:scale-95"
          >
            {t("goToSignIn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
