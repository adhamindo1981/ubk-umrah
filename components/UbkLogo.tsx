import React from "react";

interface UbkLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
  showSubtitle?: boolean;
  layout?: "horizontal" | "full";
  animated?: boolean;
  className?: string;
}

export function UbkLogo({
  size = "md",
  variant = "light",
  showSubtitle = true,
  layout = "horizontal",
  animated = true,
  className = "",
}: UbkLogoProps) {
  const isDark = variant === "dark";

  // Full vertical badge layout
  if (layout === "full") {
    const badgeHeights = {
      sm: "h-16",
      md: "h-24",
      lg: "h-36",
      xl: "h-48",
    };

    return (
      <div className={`inline-flex flex-col items-center select-none group ${className}`}>
        <div className="relative">
          {animated && (
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 rounded-full blur-md animate-pulse opacity-70 group-hover:opacity-100 transition duration-700 pointer-events-none" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={isDark ? "/images/logo-dark.png" : "/images/logo.png"}
            alt="UBK - UMAR BIN AL-KHATTAB FOR UMRAH"
            className={`relative ${badgeHeights[size]} w-auto object-contain drop-shadow-md transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-xl`}
          />
        </div>
      </div>
    );
  }

  // Horizontal sleek studio layout for headers & navbars
  const emblemSizes = {
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-3xl sm:text-4xl",
    xl: "text-5xl",
  };

  const subtitleSizes = {
    sm: "text-[8.5px]",
    md: "text-[10px]",
    lg: "text-xs",
    xl: "text-sm",
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Authentic High-Res Emblem Icon with Animated Golden Aura */}
      <div className={`relative ${emblemSizes[size]} shrink-0 flex items-center justify-center`}>
        {animated && (
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-400/30 via-emerald-500/20 to-amber-300/30 rounded-full blur-sm animate-pulse opacity-80 group-hover:opacity-100 group-hover:scale-110 transition duration-500 pointer-events-none" />
        )}
        
        {/* Animated subtle rotating geometric aura ring */}
        {animated && (
          <div className="absolute inset-0 rounded-full border border-amber-400/20 animate-[spin_20s_linear_infinite] pointer-events-none" />
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-emblem.png"
          alt="UBK Emblem"
          className="relative w-full h-full object-contain drop-shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-1"
        />
      </div>

      {/* Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-black tracking-tight ${titleSizes[size]} transition duration-300 group-hover:text-amber-500 ${
              isDark ? "text-white" : "text-emerald-950"
            }`}
          >
            UBK
          </span>
          <span className="font-extrabold tracking-widest uppercase text-amber-500 text-xs sm:text-sm drop-shadow-xs">
            UMRAH
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`font-bold tracking-wider uppercase truncate mt-1 hidden sm:block ${subtitleSizes[size]} ${
              isDark ? "text-amber-400/90" : "text-emerald-800/90"
            }`}
          >
            UMAR BIN AL-KHATTAB FOR UMRAH
          </span>
        )}
      </div>
    </div>
  );
}
