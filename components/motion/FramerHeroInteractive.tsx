"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { AnimatedHeroLogo } from "@/components/AnimatedHeroLogo";
import { Sparkles, Calendar, ShieldCheck, ChevronDown } from "lucide-react";

interface FramerHeroInteractiveProps {
  onExplorePackages?: () => void;
}

/**
 * محتوى الهيرو التفاعلي بحركات Framer Motion السينمائية
 */
export function FramerHeroInteractive({ onExplorePackages }: FramerHeroInteractiveProps) {
  const { t, isArabic } = useLanguage();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto relative z-10 space-y-6 pt-2 select-none"
    >
      {/* Prominent Animated UBK Emblem */}
      <motion.div variants={itemVariants} className="flex justify-center">
        <AnimatedHeroLogo className="mb-1" />
      </motion.div>

      {/* Floating Announcement Tag */}
      <motion.div variants={itemVariants} className="flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-400/40 text-amber-300 text-xs font-black backdrop-blur-md shadow-lg shadow-black/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {isArabic
              ? "موسم العمرة 1446 - 1447هـ | التسجيل مفتوح الآن"
              : "Pendaftaran Musim Umrah 1446-1447 H Telah Dibuka"}
          </span>
        </div>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        variants={itemVariants}
        className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.2] tracking-tight drop-shadow-2xl"
      >
        {t("heroTitle")}{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-300 drop-shadow-lg">
          UBK Umrah
        </span>
      </motion.h1>

      {/* Subtitle with Glassmorphic Backdrop */}
      <motion.p
        variants={itemVariants}
        className="text-base sm:text-xl text-slate-200 leading-relaxed max-w-2xl mx-auto font-normal drop-shadow-md bg-slate-950/50 p-4 rounded-2xl backdrop-blur-sm border border-white/10"
      >
        {t("heroSubtitle")}
      </motion.p>

      {/* Feature Badges Strip */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-bold text-slate-300 pt-1"
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isArabic ? "بإشراف وزارة الشؤون الدينية" : "Izin Resmi Kemenag"}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-xs">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>{isArabic ? "مواعيد طيران وحجوزات مؤكدة" : "Pasti Terbang & Jadwal"}</span>
        </div>
      </motion.div>

      {/* Action CTAs with Framer Micro-Interactions */}
      <motion.div
        variants={itemVariants}
        className="pt-3 flex flex-col sm:flex-row justify-center items-center gap-4"
      >
        <motion.a
          href="#form-booking"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 px-8 py-4 rounded-2xl font-black text-sm shadow-2xl shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center gap-2">
            <span>{t("ctaRegister")}</span>
            <span className="text-base">🕋</span>
          </span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </motion.a>

        <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
          <Link
            href="/mitra"
            className="w-full sm:w-auto bg-slate-900/90 hover:bg-slate-900 border-2 border-amber-400/50 hover:border-amber-400 text-amber-300 hover:text-amber-200 px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t("ctaPartner")}</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.div
        variants={itemVariants}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="pt-6 hidden sm:flex justify-center"
      >
        <a
          href="#packages"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("packages") || document.getElementById("form-booking");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <span>{isArabic ? "استكشف الباقات والخدمات" : "Lihat Program & Paket"}</span>
          <ChevronDown className="w-4 h-4 text-amber-400" />
        </a>
      </motion.div>
    </motion.div>
  );
}
