"use client";

import React from "react";

interface AnimatedHeroLogoProps {
  className?: string;
}

export function AnimatedHeroLogo({ className = "" }: AnimatedHeroLogoProps) {
  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Outer Radiating Golden Sunburst / Aura */}
      <div className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-amber-400/30 via-emerald-500/20 to-amber-300/30 blur-2xl animate-pulse pointer-events-none" />

      {/* Rotating 12-Point Islamic Geometric Star Ring */}
      <div className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full border-2 border-amber-400/40 animate-[spin_20s_linear_infinite] pointer-events-none flex items-center justify-center">
        <div className="w-[88%] h-[88%] border border-amber-300/30 rotate-45 rounded-xl" />
        <div className="w-[88%] h-[88%] border border-emerald-400/30 -rotate-45 rounded-xl" />
        {/* Diamond accents */}
        <span className="absolute -top-1.5 w-3 h-3 bg-amber-400 rotate-45 shadow-sm shadow-amber-400" />
        <span className="absolute -bottom-1.5 w-3 h-3 bg-amber-400 rotate-45 shadow-sm shadow-amber-400" />
        <span className="absolute -left-1.5 w-3 h-3 bg-amber-400 rotate-45 shadow-sm shadow-amber-400" />
        <span className="absolute -right-1.5 w-3 h-3 bg-amber-400 rotate-45 shadow-sm shadow-amber-400" />
      </div>

      {/* Floating Emblem Container with Gentle Bobbing & Light Sweep */}
      <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center transition-transform duration-500 hover:scale-110 cursor-pointer group">
        {/* Inner Glow Behind Emblem */}
        <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md group-hover:bg-amber-400/40 transition duration-500" />

        {/* Authentic High-Res UBK Emblem */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-emblem.png"
          alt="UBK Emblem - Umar Bin Alkhattab for Umrah"
          className="relative z-10 w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(245,158,11,0.35)] transition-all duration-700 group-hover:rotate-3"
        />

        {/* Shimmer Light Reflection Sweep */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_3.5s_infinite]" />
        </div>
      </div>

      {/* Floating Label Underneath Emblem */}
      <div className="relative z-10 mt-3 flex items-center gap-2 px-4 py-1 rounded-full bg-slate-950/80 border border-amber-400/40 backdrop-blur-md shadow-lg">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
          UBK UMRAH
        </span>
        <span className="text-slate-500 text-[10px]">•</span>
        <span className="text-[10px] font-bold text-slate-300">
          عمر بن الخطاب للعمرة
        </span>
      </div>
    </div>
  );
}
