"use client";

import { useState, useEffect } from "react";
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

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        {isArabic ? "جاري تحميل باقات العمرة المعتمدة..." : "Memuat program paket umrah resmi..."}
      </div>
    );
  }

  if (packages.length === 0) {
    return null;
  }

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-slate-100 via-emerald-950/5 to-slate-100 border-t border-amber-500/20 overflow-hidden">
      {/* Prominent Authentic Arabesque Backdrop */}
      <IslamicPattern opacity={0.08} color="#059669" scale={80} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Islamic Ornament */}
        <div className="text-center mb-16 space-y-3">
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
        </div>

        {/* Dynamic Package Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => {
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

            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl border-2 transition-all duration-500 shadow-md hover:shadow-2xl hover:-translate-y-3 flex flex-col justify-between overflow-hidden relative group ${
                  pkg.isPopular
                    ? "border-amber-500 ring-4 ring-amber-500/20 shadow-amber-500/10"
                    : "border-emerald-800/20 hover:border-amber-500"
                }`}
              >
                {/* High-Visibility Islamic Girih Geometric Watermark inside each Card */}
                <IslamicPattern opacity={0.12} color="#b45309" scale={56} />

                {/* Islamic Mihrab Arched Top Banner */}
                <div className={`relative py-3.5 px-4 text-center overflow-hidden border-b ${
                  pkg.isPopular
                    ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white border-amber-600"
                    : "bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-amber-300 border-emerald-950"
                }`}>
                  {/* Subtle arch svg curve */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none">
                    <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full">
                      <path d="M 0,20 Q 50,0 100,20 Z" fill="#ffffff" />
                    </svg>
                  </div>
                  <div className="relative z-10 flex items-center justify-center gap-2 text-xs font-black tracking-widest uppercase">
                    <span>۞</span>
                    <span>{displayBadge || (pkg.isPopular ? "باقة مختارة" : "برنامج رسمي")}</span>
                    <span>۞</span>
                  </div>
                </div>

                <div className="p-6 sm:p-7 space-y-5 flex-1">
                  {/* Program Duration & Periode */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
                      <span>🗓️</span>
                      <span>{pkg.programDays} {isArabic ? "أيام" : "Hari"}</span>
                    </span>
                    <span className="font-semibold text-slate-500 text-[11px]">
                      {pkg.month} {pkg.year}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                      {displayTitle}
                    </h3>
                  </div>

                  {/* Flight & Airline Tag */}
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-xs">
                    <span className="text-base">✈️</span>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">{isArabic ? "الخطوط الجوية الناقلة:" : "Flight by:"}</span>
                      <strong className="text-slate-800">{pkg.airline}</strong>
                    </div>
                  </div>

                  {/* Down Payment (DP) Highlight */}
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">
                        {isArabic ? "احجز مقعدك بدفعة مقدمة:" : "Cukup Dengan DP:"}
                      </span>
                      <span className="text-sm font-black text-amber-900 font-mono">
                        Rp {pkg.downPayment.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <span className="text-[11px] bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-xl">
                      {isArabic ? "تأكيد المقعد ✓" : "Amankan Seat ✓"}
                    </span>
                  </div>

                  {/* Freebies Badges (الهدايا والضيافة) */}
                  {parsedFreebies.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
                        {isArabic ? "🎁 هدايا ومميزات مجانية:" : "🎁 FREE / BONUS FASILITAS:"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {parsedFreebies.map((item, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1"
                          >
                            <span>✓</span>
                            <span>{item}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accommodation Summary (مكان الإقامة) */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">🕋 {isArabic ? "إقامة مكة المكرمة:" : "Hotel Makkah:"}</div>
                      <div className="font-extrabold text-slate-800">{pkg.makkahHotel}</div>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">🕌 {isArabic ? "إقامة المدينة المنورة:" : "Hotel Madinah:"}</div>
                      <div className="font-extrabold text-slate-800">{pkg.madinahHotel}</div>
                    </div>
                  </div>

                  {/* Room Pricing Grid (أسعار الغرف الثلاثة) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
                      {isArabic ? "🏷️ أسعار البرنامج حسب نوع الغرفة:" : "🏷️ PILIHAN HARGA TIPE KAMAR:"}
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-900 block">QUAD (Ber-4)</span>
                        <span className="text-xs font-black font-mono text-emerald-800 block">
                          Rp {Math.round(pkg.priceQuad / 1000000)} JT
                        </span>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-900 block">TPL (Ber-3)</span>
                        <span className="text-xs font-black font-mono text-emerald-800 block">
                          Rp {Math.round(pkg.priceTriple / 1000000)} JT
                        </span>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                        <span className="text-[10px] font-bold text-emerald-900 block">DBL (Ber-2)</span>
                        <span className="text-xs font-black font-mono text-emerald-800 block">
                          Rp {Math.round(pkg.priceDouble / 1000000)} JT
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Scholar Leader (إذا كان برفقة شيخ) */}
                  {pkg.scholarLeader && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-start gap-2">
                      <span className="text-base shrink-0">👥</span>
                      <div>
                        <strong className="text-slate-800 block">{isArabic ? "برفقة وإشراف:" : "Bersama:"}</strong>
                        <span>{pkg.scholarLeader}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-2 relative z-10">
                  <button
                    onClick={() => handleChoose(displayTitle)}
                    className={`w-full py-3.5 px-4 font-black text-xs rounded-xl shadow-md transition-all text-center relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700 active:scale-[0.98] ${
                      pkg.isPopular
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20"
                    }`}
                  >
                    <span className="relative z-10">
                      {isArabic ? "اختيار هذه الباقة والتسجيل 🚀" : "Pilih Paket Ini & Daftar 🚀"}
                    </span>
                  </button>

                  {/* Protected Package Poster Button */}
                  <button
                    type="button"
                    onClick={() => setActivePosterPkg(pkg)}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-emerald-500/10 hover:from-amber-500/20 hover:to-emerald-500/20 text-amber-950 border border-amber-500/35 hover:border-amber-500/60 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs group/poster"
                  >
                    <span className="text-sm group-hover/poster:scale-125 transition-transform">🖼️</span>
                    <span>{isArabic ? "عرض بوست وبروشور الباقة 🛡️" : "Lihat Poster Brosur Resmi 🛡️"}</span>
                  </button>

                  <button
                    onClick={() => setActiveDetailsPkg(pkg)}
                    className="w-full py-2 text-center text-[11px] font-bold text-slate-600 hover:text-emerald-700 hover:bg-slate-100/90 rounded-xl transition-all"
                  >
                    {isArabic ? "🔍 عرض محتويات الباقة والتفاصيل الكاملة" : "🔍 Lihat Rincian Fasilitas & Syarat Lengkap"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
