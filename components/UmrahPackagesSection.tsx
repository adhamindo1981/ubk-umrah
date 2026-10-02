"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/LanguageContext";
import { UmrahPackageData } from "@/components/AdminPackagesManagementModal";
import { IslamicPattern } from "@/components/IslamicPattern";
import { ProtectedPosterModal } from "@/components/ProtectedPosterModal";

interface UmrahPackagesSectionProps {
  onSelectPackage?: (packageTitle: string) => void;
}

export function UmrahPackagesSection({ onSelectPackage }: UmrahPackagesSectionProps) {
  const { t, isArabic } = useLanguage();
  const [packages, setPackages] = useState<UmrahPackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDetailsPkg, setActiveDetailsPkg] = useState<UmrahPackageData | null>(null);
  const [activePosterPkg, setActivePosterPkg] = useState<UmrahPackageData | null>(null);

  // Gallery Showcase interactive state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"showcase" | "grid">("showcase");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    async function loadPackages() {
      try {
        const res = await fetch("/api/packages");
        const data = await res.json();
        if (res.ok && data.packages) {
          setPackages(data.packages);
        }
      } catch (err) {
        console.error("Failed to load packages:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPackages();
  }, []);

  function handleChoose(title: string) {
    if (onSelectPackage) {
      onSelectPackage(title);
    }
    const formElement = document.getElementById("form-booking");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleSwitchPackage(newIndex: number) {
    if (newIndex === currentIndex || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(newIndex);
    setTimeout(() => setIsAnimating(false), 400);
  }

  function handleNext() {
    if (packages.length <= 1) return;
    const nextIdx = (currentIndex + 1) % packages.length;
    handleSwitchPackage(nextIdx);
  }

  function handlePrev() {
    if (packages.length <= 1) return;
    const prevIdx = (currentIndex - 1 + packages.length) % packages.length;
    handleSwitchPackage(prevIdx);
  }

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="inline-block animate-spin text-2xl">🕋</div>
        <p className="text-slate-500 font-bold text-xs tracking-wider">
          {isArabic ? "جاري تحميل باقات العمرة المعتمدة..." : "Memuat program paket umrah resmi..."}
        </p>
      </div>
    );
  }

  if (packages.length === 0) {
    return null;
  }

  // Active package in Showcase mode
  const currentPkg = packages[currentIndex] || packages[0];

  // Helper to determine landmark backdrop based on package title/index
  function getPackageHeroImage(pkg: UmrahPackageData, index: number): string {
    if (pkg.posterUrl && pkg.posterUrl.trim() !== "") {
      return pkg.posterUrl;
    }
    const titleLower = (pkg.title + " " + (pkg.titleAr || "")).toLowerCase();
    if (titleLower.includes("vip") || titleLower.includes("فاخر") || index % 2 === 0) {
      return "/images/landmarks/makkah-clock.jpg";
    }
    return "/images/landmarks/madinah-nabawi.jpg";
  }

  // Helper to render package card contents
  function renderCard(pkg: UmrahPackageData, isShowcase: boolean = false) {
    let parsedFreebies: string[] = [];
    let parsedInclusions: string[] = [];
    let parsedCustomFields: Array<{ label: string; value: string }> = [];

    try {
      parsedFreebies = JSON.parse(pkg.freebies || "[]");
    } catch {}
    try {
      parsedInclusions = JSON.parse(pkg.inclusions || "[]");
    } catch {}
    try {
      parsedCustomFields = JSON.parse(pkg.customFields || "[]");
    } catch {}

    const displayTitle = isArabic && pkg.titleAr ? pkg.titleAr : pkg.title;
    const displayBadge = isArabic ? (pkg.badgeAr || pkg.badge) : pkg.badge;
    const heroImage = getPackageHeroImage(pkg, packages.indexOf(pkg));

    return (
      <div
        key={pkg.id}
        className={`bg-white rounded-3xl border-2 transition-all duration-500 shadow-xl overflow-hidden relative flex flex-col justify-between group ${
          pkg.isPopular
            ? "border-amber-500/80 ring-4 ring-amber-500/20 shadow-amber-500/10"
            : "border-emerald-800/30 hover:border-amber-500/70"
        } ${isShowcase ? "w-full" : "h-full"}`}
      >
        {/* Islamic Girih Geometric Watermark */}
        <IslamicPattern opacity={0.06} color="#059669" scale={64} />

        {/* --- Top Visual Hero Header (Photo Gallery Style) --- */}
        <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden bg-slate-900">
          {/* Backdrop Photo with Zoom Hover */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          {/* Gradient Overlay for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/40" />

          {/* Mihrab Arch Top Subtle Pattern */}
          <div className="absolute top-0 inset-x-0 h-10 opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
              <path d="M 0,0 L 0,10 Q 50,22 100,10 L 100,0 Z" fill="#ffffff" />
            </svg>
          </div>

          {/* Top Badges Bar */}
          <div className="absolute top-3.5 inset-x-4 flex items-center justify-between z-10">
            {/* Package Badge (VIP / Popular / Official) */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase backdrop-blur-md shadow-md ${
                pkg.isPopular
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border border-amber-300"
                  : "bg-emerald-950/80 text-emerald-300 border border-emerald-400/40"
              }`}
            >
              <span>{pkg.isPopular ? "⭐" : "🕋"}</span>
              <span>{displayBadge || (pkg.isPopular ? (isArabic ? "باقة VIP مختارة" : "Paket Pilihan") : (isArabic ? "برنامج رسمي" : "Program Resmi"))}</span>
            </span>

            {/* Quick Poster Preview Button on Photo */}
            <button
              type="button"
              onClick={() => setActivePosterPkg(pkg)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/80 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-[11px] font-black border border-amber-400/40 transition-all backdrop-blur-md shadow-sm"
              title={isArabic ? "عرض البروشور" : "Lihat Brosur"}
            >
              <span>🖼️</span>
              <span>{isArabic ? "البروشور" : "Brosur"}</span>
            </button>
          </div>

          {/* Hero Bottom Meta: Title, Duration, Date */}
          <div className="absolute bottom-3.5 inset-x-4 sm:inset-x-6 z-10 text-white space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-extrabold bg-emerald-600/90 text-white px-2.5 py-0.5 rounded-lg border border-emerald-400/30 backdrop-blur-md inline-flex items-center gap-1">
                <span>🗓️</span>
                <span>{pkg.programDays} {isArabic ? "أيام" : "Hari"}</span>
              </span>
              <span className="font-bold bg-black/50 text-slate-200 px-2.5 py-0.5 rounded-lg border border-white/10 backdrop-blur-md">
                {pkg.month} {pkg.year}
              </span>
              <span className="font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-lg border border-amber-400/30 backdrop-blur-md inline-flex items-center gap-1">
                <span>✈️</span>
                <span>{pkg.airline}</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md leading-tight">
              {displayTitle}
            </h3>
          </div>
        </div>

        {/* --- Card Body Layout --- */}
        <div className={`p-5 sm:p-7 space-y-5 flex-1 ${isShowcase ? "md:grid md:grid-cols-12 md:gap-6 md:space-y-0" : ""}`}>
          {/* Left Column in Showcase (Hotels, Airline, Freebies) */}
          <div className={`space-y-4 ${isShowcase ? "md:col-span-7" : ""}`}>
            {/* Accommodation (Hotels Makkah & Madinah) */}
            <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="text-lg shrink-0">🕋</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                      {isArabic ? "فندق مكة المكرمة" : "Hotel Makkah"}
                    </span>
                    <span className="text-[10px] text-amber-500 font-black">★★★★★</span>
                  </div>
                  <div className="font-black text-slate-900 text-xs sm:text-sm truncate">
                    {pkg.makkahHotel}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200/80 pt-2 flex items-start gap-2.5">
                <span className="text-lg shrink-0">🕌</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                      {isArabic ? "فندق المدينة المنورة" : "Hotel Madinah"}
                    </span>
                    <span className="text-[10px] text-amber-500 font-black">★★★★★</span>
                  </div>
                  <div className="font-black text-slate-900 text-xs sm:text-sm truncate">
                    {pkg.madinahHotel}
                  </div>
                </div>
              </div>
            </div>

            {/* Freebies Badges (الهدايا والضيافة) */}
            {parsedFreebies.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase block">
                  {isArabic ? "🎁 هدايا ومميزات إضافية مجانية:" : "🎁 Fasilitas Gratis & Bonus:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {parsedFreebies.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-bold bg-amber-500/10 text-amber-950 border border-amber-500/30 px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1 shadow-xs"
                    >
                      <span className="text-amber-600">✓</span>
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Scholar / Guide */}
            {pkg.scholarLeader && (
              <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                <span className="text-base shrink-0">👥</span>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    {isArabic ? "برفقة وإشراف فضيلة الشيخ:" : "Bersama Pembimbing Ibadah:"}
                  </span>
                  <span className="font-black text-slate-900 truncate block">{pkg.scholarLeader}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column in Showcase (Pricing, DP & Actions) */}
          <div className={`space-y-4 flex flex-col justify-between ${isShowcase ? "md:col-span-5 md:border-s md:border-slate-200 md:ps-6" : ""}`}>
            {/* Down Payment (DP) Highlight */}
            <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/15 border-2 border-amber-500/40 p-3 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-black text-amber-900 uppercase block tracking-wider">
                  {isArabic ? "احجز مقعدك بدفعة مقدمة:" : "Cukup Dengan DP Awal:"}
                </span>
                <span className="text-base sm:text-lg font-black text-amber-950 font-mono">
                  Rp {pkg.downPayment.toLocaleString("id-ID")}
                </span>
              </div>
              <span className="text-[11px] bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-xl shadow-xs">
                {isArabic ? "تأكيد المقعد ✓" : "Amankan Seat ✓"}
              </span>
            </div>

            {/* Room Pricing Grid (أسعار الغرف الثلاثة) */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-500 tracking-wider uppercase block">
                {isArabic ? "🏷️ أسعار البرنامج حسب نوع الغرفة:" : "🏷️ PILIHAN HARGA KAMAR:"}
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-emerald-50/80 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-900 block">QUAD (Ber-4)</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-emerald-800 block">
                    Rp {Math.round(pkg.priceQuad / 1000000)} JT
                  </span>
                </div>
                <div className="p-2 bg-emerald-50/80 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-900 block">TPL (Ber-3)</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-emerald-800 block">
                    Rp {Math.round(pkg.priceTriple / 1000000)} JT
                  </span>
                </div>
                <div className="p-2 bg-emerald-50/80 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-900 block">DBL (Ber-2)</span>
                  <span className="text-xs sm:text-sm font-black font-mono text-emerald-800 block">
                    Rp {Math.round(pkg.priceDouble / 1000000)} JT
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleChoose(displayTitle)}
                className={`w-full py-3 px-4 font-black text-xs rounded-xl shadow-md transition-all text-center relative overflow-hidden active:scale-[0.98] ${
                  pkg.isPopular
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20"
                }`}
              >
                <span>{isArabic ? "اختيار هذه الباقة والتسجيل 🚀" : "Pilih Paket Ini & Daftar 🚀"}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActivePosterPkg(pkg)}
                  className="py-2.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-950 border border-amber-500/35 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>🖼️</span>
                  <span>{isArabic ? "البروشور الرسمي" : "Brosur Resmi"}</span>
                </button>

                <button
                  onClick={() => setActiveDetailsPkg(pkg)}
                  className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                >
                  <span>📋</span>
                  <span>{isArabic ? "كامل التفاصيل" : "Detail Lengkap"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-slate-100 via-emerald-950/5 to-slate-100 border-t border-amber-500/20 overflow-hidden">
      {/* Prominent Authentic Arabesque Backdrop */}
      <IslamicPattern opacity={0.08} color="#059669" scale={80} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header with Islamic Ornament */}
        <div className="text-center mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/10 border border-emerald-600/30 text-emerald-900 text-xs font-black tracking-wider uppercase shadow-xs">
            <span>✨</span>
            <span>{isArabic ? "برامج وعروض رسمية معتمدة" : "PROGRAM RESMI TERLISENSI"}</span>
            <span>✨</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {t("packagesTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            {t("packagesSubtitle")}
          </p>

          {/* Decorative Islamic Floral Divider */}
          <div className="flex items-center justify-center gap-3 pt-1 text-amber-500 text-sm">
            <span className="w-16 h-px bg-gradient-to-r from-transparent to-amber-500" />
            <span>۞ 🕋 ۞</span>
            <span className="w-16 h-px bg-gradient-to-l from-transparent to-amber-500" />
          </div>

          {/* Mode Switcher & Counter Controls */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            {/* View Mode Toggle: Interactive Showcase vs All Grid */}
            <div className="inline-flex items-center bg-white p-1 rounded-2xl border border-slate-300 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode("showcase")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  viewMode === "showcase"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>🎞️</span>
                <span>{isArabic ? "معرض تفاعلي" : "Showcase Interaktif"}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  viewMode === "grid"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>⊞</span>
                <span>{isArabic ? "عرض الكل / مقارنة" : "Tampilkan Semua"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: INTERACTIVE SHOWCASE GALLERY CAROUSEL (DEFAULT) */}
        {/* ------------------------------------------------------------- */}
        {viewMode === "showcase" && (
          <div className="space-y-6">
            {/* Interactive Package Selector Pills (Quick Tabs) */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto px-2">
              {packages.map((pkg, idx) => {
                const isActive = idx === currentIndex;
                const title = isArabic && pkg.titleAr ? pkg.titleAr : pkg.title;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handleSwitchPackage(idx)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border ${
                      isActive
                        ? "bg-slate-900 text-amber-300 border-amber-400 shadow-lg scale-105 ring-2 ring-amber-400/30"
                        : "bg-white text-slate-700 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50"
                    }`}
                  >
                    <span>{isActive ? "👉" : "🕋"}</span>
                    <span className="truncate max-w-[220px] sm:max-w-none">{title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? "bg-amber-400/20 text-amber-300" : "bg-slate-100 text-slate-500"
                    }`}>
                      {pkg.programDays} {isArabic ? "أيام" : "H"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Showcase Stage with Floating Left/Right Arrows */}
            <div className="relative max-w-4xl mx-auto">
              {/* Previous Button */}
              {packages.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="hidden md:flex absolute -start-6 lg:-start-14 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/95 hover:bg-emerald-600 text-slate-800 hover:text-white border-2 border-emerald-600/40 hover:border-emerald-600 shadow-xl items-center justify-center transition-all hover:scale-110 active:scale-95 backdrop-blur-md"
                  aria-label={isArabic ? "الباقة السابقة" : "Paket Sebelumnya"}
                >
                  <span className="text-xl font-black">{isArabic ? "→" : "←"}</span>
                </button>
              )}

              {/* Next Button */}
              {packages.length > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="hidden md:flex absolute -end-6 lg:-end-14 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/95 hover:bg-emerald-600 text-slate-800 hover:text-white border-2 border-emerald-600/40 hover:border-emerald-600 shadow-xl items-center justify-center transition-all hover:scale-110 active:scale-95 backdrop-blur-md"
                  aria-label={isArabic ? "الباقة التالية" : "Paket Selanjutnya"}
                >
                  <span className="text-xl font-black">{isArabic ? "←" : "→"}</span>
                </button>
              )}

              {/* Active Card with Smooth Transition */}
              <div className={`transition-all duration-300 ${isAnimating ? "opacity-40 scale-[0.98]" : "opacity-100 scale-100"}`}>
                {renderCard(currentPkg, true)}
              </div>

              {/* Mobile Carousel Controls (Under the card) */}
              {packages.length > 1 && (
                <div className="flex md:hidden items-center justify-between pt-4 px-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-800 shadow-sm flex items-center gap-1"
                  >
                    <span>{isArabic ? "→" : "←"}</span>
                    <span>{isArabic ? "السابق" : "Sebelumnya"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {packages.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSwitchPackage(i)}
                        className={`h-2.5 rounded-full transition-all ${
                          i === currentIndex ? "w-7 bg-emerald-600" : "w-2.5 bg-slate-300"
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-800 shadow-sm flex items-center gap-1"
                  >
                    <span>{isArabic ? "التالي" : "Berikutnya"}</span>
                    <span>{isArabic ? "←" : "→"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Dots & Counter Indicator */}
            {packages.length > 1 && (
              <div className="hidden md:flex flex-col items-center justify-center gap-2 pt-2">
                <div className="flex items-center gap-2">
                  {packages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSwitchPackage(i)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        i === currentIndex ? "w-8 bg-emerald-600 shadow-xs" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-slate-500 font-mono">
                  {currentIndex + 1} / {packages.length}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: BALANCED GRID VIEW (ALL PACKAGES SIDE-BY-SIDE) */}
        {/* ------------------------------------------------------------- */}
        {viewMode === "grid" && (
          <div
            className={`grid gap-8 items-stretch ${
              packages.length === 1
                ? "max-w-xl mx-auto grid-cols-1"
                : packages.length === 2
                ? "max-w-5xl mx-auto grid-cols-1 md:grid-cols-2"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {packages.map((pkg) => renderCard(pkg, false))}
          </div>
        )}
      </div>

      {/* Package Full Details Lightbox Modal */}
      {activeDetailsPkg && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md animate-fadeIn"
          onClick={() => setActiveDetailsPkg(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[88dvh] overflow-y-auto p-5 sm:p-8 space-y-6 text-start shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            dir={isArabic ? "rtl" : "ltr"}
          >
            {/* Modal Islamic Pattern */}
            <IslamicPattern opacity={0.035} color="#059669" scale={54} />
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                  {isArabic ? (activeDetailsPkg.badgeAr || activeDetailsPkg.badge) : activeDetailsPkg.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  {isArabic && activeDetailsPkg.titleAr ? activeDetailsPkg.titleAr : activeDetailsPkg.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveDetailsPkg(null)}
                className="text-slate-400 hover:text-slate-700 font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Inclusions List (Paket Sudah Termasuk) */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span>📋</span>
                <span>{isArabic ? "بيان محتويات وتجهيزات الباقة (شامل بالسعر):" : "Paket Sudah Termasuk (Fasilitas Lengkap):"}</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {(() => {
                  try {
                    const incs = JSON.parse(activeDetailsPkg.inclusions || "[]");
                    return incs.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ));
                  } catch {
                    return <li>-</li>;
                  }
                })()}
              </ul>
            </div>

            {/* Notes & Terms */}
            {activeDetailsPkg.notes && (
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <span className="font-extrabold block">📌 {isArabic ? "ملاحظات وسياسة الأسعار:" : "Catatan & Ketentuan Kurs:"}</span>
                <p className="leading-relaxed text-[11px]">{activeDetailsPkg.notes}</p>
              </div>
            )}

            {/* Custom Extra Fields */}
            {(() => {
              try {
                const cfields = JSON.parse(activeDetailsPkg.customFields || "[]");
                if (cfields.length > 0) {
                  return (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-900 block">ℹ️ {isArabic ? "معلومات إضافية وتراخيص:" : "Informasi Tambahan & Legalitas:"}</span>
                      <div className="grid grid-cols-2 gap-2">
                        {cfields.map((f: any, idx: number) => (
                          <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                            <span className="text-slate-400 text-[10px] block">{f.label}</span>
                            <span className="font-bold text-slate-800">{f.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              } catch {}
              return null;
            })()}

            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const title = isArabic && activeDetailsPkg.titleAr ? activeDetailsPkg.titleAr : activeDetailsPkg.title;
                  setActiveDetailsPkg(null);
                  handleChoose(title);
                }}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition"
              >
                {isArabic ? "متابعة الحجز لهذه الباقة 🚀" : "Lanjutkan Booking Paket Ini 🚀"}
              </button>
              <button
                onClick={() => setActiveDetailsPkg(null)}
                className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                {isArabic ? "إغلاق" : "Tutup"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Protected Umrah Package Poster Lightbox */}
      {activePosterPkg && (
        <ProtectedPosterModal
          pkg={activePosterPkg}
          onClose={() => setActivePosterPkg(null)}
          onBookNow={(title) => handleChoose(title)}
        />
      )}
    </section>
  );
}
