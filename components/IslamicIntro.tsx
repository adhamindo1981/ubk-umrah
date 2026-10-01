"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export function IslamicIntro() {
  const { isArabic } = useLanguage();
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Check if intro has already played in this session to avoid fatigue
    const hasSeenIntro = sessionStorage.getItem("ubk_intro_seen");
    if (hasSeenIntro) {
      setVisible(false);
      return;
    }

    // Auto-dismiss after 2.8 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  function handleClose() {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("ubk_intro_seen", "true");
    }, 600);
  }

  if (!visible) return null;

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white cursor-pointer select-none transition-all duration-700 ${
        closing ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
    >
      {/* Radiant Golden Light Rays in Background */}
      <div className="absolute inset-0 bg-radial from-amber-500/20 via-slate-950/80 to-slate-950 pointer-events-none" />

      {/* Rotating 12-point Islamic Geometric Star Halo */}
      <div className="absolute w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] rounded-full border border-amber-400/25 animate-[spin_30s_linear_infinite] pointer-events-none flex items-center justify-center">
        <div className="w-[85%] h-[85%] border border-emerald-500/25 rotate-45 rounded-2xl" />
        <div className="w-[85%] h-[85%] border border-amber-400/25 -rotate-45 rounded-2xl" />
      </div>

      {/* Pulsing Gold Glow Core */}
      <div className="absolute w-44 h-44 bg-gradient-to-tr from-amber-400/40 via-amber-300/30 to-emerald-500/30 rounded-full blur-2xl animate-pulse pointer-events-none" />

      {/* Main Animated Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 animate-scaleUp">
        {/* Animated Emblem */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-amber-400/30 rounded-full blur-lg animate-ping opacity-60" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-emblem.png"
            alt="UBK Emblem"
            className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-2xl relative z-10 transition-transform duration-700 hover:scale-110"
          />
        </div>

        {/* Title Reveal */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              UBK
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 uppercase tracking-widest">
              UMRAH
            </span>
          </div>

          <p className="text-xs sm:text-sm font-extrabold tracking-widest text-amber-300 uppercase">
            UMAR BIN AL-KHATTAB FOR UMRAH
          </p>

          <p className="text-[11px] text-emerald-400 font-semibold pt-1">
            {isArabic ? "رحلة إيمانية مباركة برعاية متكاملة 🕋" : "Pelayanan Ibadah Umrah Amanah & Terpercaya 🕋"}
          </p>
        </div>

        {/* Skip Button Notice */}
        <div className="mt-8 text-[10px] text-slate-400/80 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800">
          {isArabic ? "انقر في أي مكان للتخطي ↵" : "Klik di mana saja untuk melanjutkan ↵"}
        </div>
      </div>
    </div>
  );
}
