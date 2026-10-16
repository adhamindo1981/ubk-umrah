"use client";

import React from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { IslamicPattern } from "@/components/IslamicPattern";
import { MotionFadeIn } from "@/components/motion/MotionFadeIn";
import { MotionCard3D } from "@/components/motion/MotionCard3D";
import { motion } from "framer-motion";
import { ShieldCheck, Award, FileCheck2, Plane, Hotel, CheckCircle2 } from "lucide-react";

export function OfficialAccreditationSection() {
  const { isArabic } = useLanguage();

  const agencyCode = "EGWASDOB";
  const ppuiLicense = "PPUI No. U- 271 Tahun 2021";

  const trustPillars = [
    {
      icon: <FileCheck2 className="w-6 h-6 text-amber-400" />,
      titleId: "Pasti Izinnya",
      titleAr: "تصريح رسمي معتمد",
      descId: "Terdaftar resmi di Kemenag RI dengan izin PPUI No. U-271 Tahun 2021.",
      descAr: "مسجل رسمياً بوزارة الشؤون الدينية الإندونيسية برخصة PPUI رقم 271 لسنة 2021.",
    },
    {
      icon: <Plane className="w-6 h-6 text-emerald-400" />,
      titleId: "Pasti Jadwal & Terbangnya",
      titleAr: "مواعيد طيران مؤكدة",
      descId: "Tiket penerbangan PP langsung booked dengan maskapai terpercaya.",
      descAr: "حجوزات طيران مؤكدة ذهاباً وإياباً مع كبرى خطوط الطيران العالمية.",
    },
    {
      icon: <Hotel className="w-6 h-6 text-amber-300" />,
      titleId: "Pasti Hotelnya",
      titleAr: "فنادق مؤكدة وقريبة",
      descId: "Akomodasi hotel bintang di Makkah & Madinah berjarak dekat ke Masjid.",
      descAr: "إقامة فندقية مؤكدة ومميزة في مكة والمدينة على مقربة من الحرمين.",
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-300" />,
      titleId: "Pasti Visanya",
      titleAr: "تأشيرات نظامية وموثقة",
      descId: "Proses visa Umrah resmi terintegrasi langsung dengan sistem SISKOPATUH.",
      descAr: "إصدار تأشيرات نظامية متكاملة مباشرة مع النظام الإلكتروني SISKOPATUH.",
    },
  ];

  return (
    <section className="relative py-20 px-4 sm:px-6 bg-slate-950 text-white overflow-hidden border-t border-amber-500/20">
      {/* Islamic Subtle Background Watermark */}
      <IslamicPattern opacity={0.06} color="#fbbf24" scale={88} />

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Section Heading with Framer Motion Fade In */}
        <MotionFadeIn direction="up" className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-black tracking-wider uppercase backdrop-blur-md shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isArabic ? "الاعتماد القانوني والمصداقية الرسمية" : "LEGALITAS RESMI & AKREDITASI TERPERCAYA"}</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {isArabic ? (
              <>
                وكيل رسمي معتمد لـ{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-300">
                  Asma Tour (PT. Sembilan Sembilan Wisata)
                </span>
              </>
            ) : (
              <>
                Agen Resmi Berizin{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-300">
                  Asma Tour (PT. Sembilan Sembilan Wisata)
                </span>
              </>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {isArabic
              ? "نلتزم بأعلى معايير الأمانة والشفافية النظامية لخدمة ضيوف الرحمن بإشراف وزارة الشؤون الدينية الإندونيسية ومظلة الحماية الحكومية الكاملة."
              : "Menjamin keamanan, kepastian, dan kekhusyukan ibadah Anda dengan legalitas resmi terdaftar di Kementerian Agama RI dan perlindungan program 5 Pasti Umrah."}
          </p>
        </MotionFadeIn>

        {/* Master Accreditation & Branch Credentials 3D Card */}
        <MotionFadeIn direction="up" delay={0.15}>
          <MotionCard3D glowColor="rgba(245, 158, 11, 0.2)" intensity={8}>
            <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-amber-500/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              {/* Subtle Ambient Light Corner */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                {/* Left: Asma Tour Logo & Official Badge */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-2xl border border-slate-800 text-center space-y-4">
                  <div className="relative p-2 bg-white/95 rounded-2xl shadow-xl flex items-center justify-center max-w-[220px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/asma-tour-logo.png"
                      alt="Asma Tour - PT. Sembilan Sembilan Wisata"
                      className="w-full h-auto object-contain max-h-36 drop-shadow-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-amber-300 tracking-wider uppercase">
                      PT. SEMBILAN SEMBILAN WISATA
                    </div>
                    <div className="text-[10px] text-slate-400 italic">
                      Umrah & Haji Services
                    </div>
                  </div>
                </div>

                {/* Middle/Right: Official Branch Status & Agency Credentials */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                      {isArabic ? "فرع ولاية بوقور المعتمد" : "KEPALA CABANG WILAYAH BOGOR"}
                    </span>

                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      UMAR BIN AL-KHATTAB FOR UMRAH
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {isArabic
                        ? "وكيل معتمد ومفوض لإدارة وتسيير رحلات العمرة لولاية بوقور وجاوا الغربية تحت مظلة ورخصة شركة PT. Sembilan Sembilan Wisata."
                        : "Penyelenggara resmi perjalanan ibadah Umrah kantor cabang wilayah Bogor dengan izin operasional penuh dan sistem terpadu Kemenag RI."}
                    </p>
                  </div>

                  {/* License & Code Pill Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 space-y-1">
                      <div className="flex items-center gap-2 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                        <span>🏷️</span>
                        <span>{isArabic ? "كود الوكالة المعتمد:" : "Nomor Kode Agen:"}</span>
                      </div>
                      <div className="text-lg font-mono font-black text-white tracking-widest">
                        {agencyCode}
                      </div>
                    </div>

                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/30 space-y-1">
                      <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        <span>📜</span>
                        <span>{isArabic ? "رخصة وزارة الشؤون الدينية:" : "Izin Resmi Operasional PPUI:"}</span>
                      </div>
                      <div className="text-base font-mono font-black text-emerald-300 tracking-wide">
                        {ppuiLicense}
                      </div>
                    </div>
                  </div>

                  {/* Official Accreditations Ribbon Strip */}
                  <div className="pt-2 space-y-2">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <span>🏛️</span>
                      <span>{isArabic ? "الجهات الحكومية والهيئات الدولية المعتمدة:" : "Akreditasi & Afiliasi Lembaga Resmi:"}</span>
                    </div>

                    <div className="p-4 bg-white/95 rounded-2xl shadow-inner flex items-center justify-center overflow-x-auto">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/official-accreditations.png"
                        alt="Kemenag RI, IATA, 5 Pasti Umrah, SISKOPATUH, KAN, Wonderful Indonesia"
                        className="max-h-12 w-auto object-contain min-w-[320px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MotionCard3D>
        </MotionFadeIn>

        {/* 4 Pillars of Guaranteed Trust with Staggered Framer Motion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustPillars.map((pillar, idx) => (
            <MotionFadeIn key={idx} direction="up" delay={0.1 * (idx + 1)}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="h-full bg-slate-900/70 backdrop-blur-xs p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/90 transition-all duration-300 space-y-2.5 shadow-lg group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-110 group-hover:border-amber-400/50 transition-transform duration-300 shadow-inner">
                  {pillar.icon}
                </div>
                <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                  {isArabic ? pillar.titleAr : pillar.titleId}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isArabic ? pillar.descAr : pillar.descId}
                </p>
              </motion.div>
            </MotionFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
