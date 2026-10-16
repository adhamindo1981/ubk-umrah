"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { ShieldCheck, Users, Hotel, Zap } from "lucide-react";

interface CounterItemProps {
  icon: React.ReactNode;
  endValue: number;
  suffix?: string;
  labelAr: string;
  labelId: string;
  subAr: string;
  subId: string;
}

function CounterItem({
  icon,
  endValue,
  suffix = "",
  labelAr,
  labelId,
  subAr,
  subId,
}: CounterItemProps) {
  const { isArabic } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 1800; // 1.8 ثانية
    const frameRate = 30;
    const totalFrames = Math.round((duration / 1000) * frameRate);
    const increment = endValue / totalFrames;
    let currentFrame = 0;

    const timer = setInterval(() => {
      currentFrame++;
      start += increment;
      if (currentFrame >= totalFrames) {
        setCount(endValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, [isInView, endValue]);

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="relative flex flex-col items-center sm:items-start text-center sm:text-start p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-amber-500/20 backdrop-blur-md hover:border-amber-400/50 hover:bg-slate-900/90 transition-all duration-300 group"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-amber-500/20 transition-transform duration-300">
          {icon}
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline">
          <span>{count.toLocaleString()}</span>
          <span className="text-amber-400 text-xl font-bold ml-0.5">{suffix}</span>
        </div>
      </div>
      <div className="text-xs sm:text-sm font-extrabold text-slate-200">
        {isArabic ? labelAr : labelId}
      </div>
      <div className="text-[11px] text-slate-400 font-medium mt-0.5">
        {isArabic ? subAr : subId}
      </div>
    </motion.div>
  );
}

/**
 * شريط الإحصائيات والأرقام المعتمدة التفاعلي (Framer Stats Counter)
 */
export function FramerStatsCounter() {
  const { isArabic } = useLanguage();

  return (
    <section className="relative -mt-6 sm:-mt-10 mb-10 max-w-7xl mx-auto px-4 sm:px-6 z-20">
      <div className="rounded-3xl p-3 sm:p-4 bg-slate-950/80 border border-amber-500/30 backdrop-blur-xl shadow-2xl shadow-black/80">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <CounterItem
            icon={<ShieldCheck className="w-5 h-5" />}
            endValue={100}
            suffix="%"
            labelAr="ترخيص رسمي معتمد"
            labelId="Legalitas Resmi Kemenag"
            subAr="PPUI No. U-271 لسنة 2021"
            subId="PPUI No. U-271 Tahun 2021"
          />
          <CounterItem
            icon={<Users className="w-5 h-5" />}
            endValue={5000}
            suffix="+"
            labelAr="معتمر تم خدمتهم"
            labelId="Jamaah Terlayani"
            subAr="بإشراف مباشر وموثوق"
            subId="Amanah Sesuai Sunnah"
          />
          <CounterItem
            icon={<Hotel className="w-5 h-5" />}
            endValue={5}
            suffix="★"
            labelAr="فنادق راقية قريبة"
            labelId="Hotel Bintang Dekat"
            subAr="مكة المكرمة والمدينة المنورة"
            subId="Makkah & Madinah"
          />
          <CounterItem
            icon={<Zap className="w-5 h-5" />}
            endValue={300}
            suffix=" km/h"
            labelAr="قطار الحرمين السريع"
            labelId="Kereta Cepat Haramain"
            subAr="تنقل VIP فائق الراحة"
            subId="Transportasi Modern VIP"
          />
        </div>
      </div>
    </section>
  );
}
