"use client";

import React, { useState, useEffect, useRef } from "react";
import { UmrahPackageData } from "@/components/AdminPackagesManagementModal";
import { useLanguage } from "@/lib/LanguageContext";
import { UbkLogo } from "@/components/UbkLogo";

export interface GenericPosterData {
  title: string;
  imageUrl: string;
  licenseKey?: string;
  badge?: string;
  description?: string;
}

interface ProtectedPosterModalProps {
  pkg?: UmrahPackageData | null;
  poster?: GenericPosterData | null;
  onClose: () => void;
  onBookNow?: (packageTitle: string) => void;
}

export function ProtectedPosterModal({ pkg, poster, onClose, onBookNow }: ProtectedPosterModalProps) {
  const { isArabic } = useLanguage();
  const [isShielded, setIsShielded] = useState(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Security and DRM listeners
  useEffect(() => {
    if (!pkg && !poster) return;

    // Trigger security shield and warning
    function triggerSecurityAlert(reason: string) {
      setIsShielded(true);
      setSecurityWarning(reason);

      // Attempt to clear or overwrite clipboard buffer
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("UBK Umrah - Protected Official Content. Screenshot prohibited.").catch(() => {});
      }

      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      warningTimerRef.current = setTimeout(() => {
        setIsShielded(false);
        setSecurityWarning(null);
      }, 3500);
    }

    // 1. Anti-Screenshot keyboard shortcuts (PrintScreen, Windows Snipping Tool, Mac Screen Capture, DevTools, Print)
    function handleKeyDown(e: KeyboardEvent) {
      // PrintScreen key
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        e.stopPropagation();
        triggerSecurityAlert(
          isArabic
            ? "⚠️ تنبيه أمني: التقاط الشاشة محظور لحماية حقوق ملكية البوست الرسمي."
            : "⚠️ Peringatan: Tangkapan layar dilarang untuk melindungi hak cipta brosur resmi."
        );
        return false;
      }

      // Ctrl + Shift + S (Snipping Tool) or Meta + Shift + S
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "s" || e.key === "S" || e.code === "KeyS")) {
        e.preventDefault();
        e.stopPropagation();
        triggerSecurityAlert(
          isArabic
            ? "⚠️ تنبيه: تم حجب المنشور، أدوات القص وتصوير الشاشة محظورة."
            : "⚠️ Peringatan: Konten disembunyikan, alat pemotong layar dinonaktifkan."
        );
        return false;
      }

      // Mac screenshot: Cmd + Shift + 3, Cmd + Shift + 4, Cmd + Shift + 5
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) {
        e.preventDefault();
        e.stopPropagation();
        triggerSecurityAlert(
          isArabic
            ? "⚠️ تنبيه: تصوير الشاشة محظور لحماية ملكية المنشور."
            : "⚠️ Tangkapan layar dinonaktifkan demi perlindungan hak cipta."
        );
        return false;
      }

      // Ctrl+P (Print to PDF)
      if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        e.stopPropagation();
        triggerSecurityAlert(
          isArabic
            ? "⚠️ تنبيه: طباعة المنشور غير مصرح بها."
            : "⚠️ Pencetakan dokumen tidak diizinkan."
        );
        return false;
      }

      // Ctrl+S (Save webpage)
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Escape to close modal
      if (e.key === "Escape") {
        onClose();
      }
    }

    // 2. Anti-Snipping Tool via Window Blur & Visibility Change
    function handleWindowBlur() {
      setIsShielded(true);
      setSecurityWarning(
        isArabic
          ? "🛡️ تم حجب المنشور مؤقتاً لخروج المؤشر عن النافذة لحماية حقوق النشر."
          : "🛡️ Konten disembunyikan sementara karena jendela tidak aktif untuk perlindungan hak cipta."
      );
    }

    function handleWindowFocus() {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      warningTimerRef.current = setTimeout(() => {
        setIsShielded(false);
        setSecurityWarning(null);
      }, 1000);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        setIsShielded(true);
      } else {
        handleWindowFocus();
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyDown, true);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyDown, true);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [pkg, poster, isArabic, onClose]);

  if (!pkg && !poster) return null;

  const displayTitle = poster?.title || (pkg ? (isArabic && pkg.titleAr ? pkg.titleAr : pkg.title) : "");
  const displayBadge = poster?.badge || (pkg ? (isArabic ? (pkg.badgeAr || pkg.badge) : pkg.badge) : "POSTER RESMI");
  const posterImageSrc = poster?.imageUrl || pkg?.posterUrl;
  const licenseKey = poster?.licenseKey;

  let parsedFreebies: string[] = [];
  try {
    parsedFreebies = pkg ? JSON.parse(pkg.freebies || "[]") : [];
  } catch {}

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xl animate-fadeIn select-none print:hidden"
      onClick={onClose}
      onContextMenu={(e) => e.preventDefault()}
      dir={isArabic ? "rtl" : "ltr"}
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
    >
      <div
        className="max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/40 flex flex-col max-h-[92dvh] sm:max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Top Header Bar */}
        <div className="p-3 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3 relative z-30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {displayBadge || "POSTER RESMI"}
              </span>
              {pkg && (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  🗓️ {pkg.programDays} {isArabic ? "أيام" : "Hari"} • {pkg.month} {pkg.year}
                </span>
              )}
              {licenseKey && (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Lisensi: {licenseKey}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-black text-white truncate max-w-md">
              {displayTitle}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
              <span>🛡️</span>
              <span>{isArabic ? "معاينة محمية" : "Protected Preview"}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition"
              title={isArabic ? "إغلاق" : "Tutup"}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Poster Display Canvas Area with Multi-layered Watermark & DRM Overlay */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center relative min-h-[380px]">
          {/* Active Security Blackout Shield (When Snipping tool or Screenshot is detected) */}
          {isShielded && (
            <div className="absolute inset-0 z-40 bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center space-y-4 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center text-3xl shadow-lg shadow-rose-500/30">
                🛡️
              </div>
              <div className="space-y-2 max-w-md">
                <h4 className="text-base font-black text-white">
                  {isArabic ? "محتوى محمي بحقوق الملكية الفكرية" : "Konten Dilindungi Hak Cipta Resmi"}
                </h4>
                <p className="text-xs text-rose-300 leading-relaxed font-medium">
                  {securityWarning ||
                    (isArabic
                      ? "تم تفعيل نظام الحماية لمنع تصوير الشاشة أو نسخ محتوى بوست الباقة."
                      : "Sistem keamanan aktif mencegah tangkapan layar atau penyalinan materi promosi.")}
                </p>
                <div className="pt-2 text-[11px] text-slate-400">
                  {isArabic
                    ? "انقر داخل النافذة للمتابعة بشكل نظامي."
                    : "Klik pada jendela untuk melanjutkan tampilan."}
                </div>
              </div>
            </div>
          )}

          {/* Central Protected Poster Container */}
          <div
            className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/30 bg-slate-900 group select-none"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          >
            {/* If package or poster has an image URL, display it */}
            {posterImageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={posterImageSrc}
                alt={displayTitle}
                className="w-full h-auto object-contain max-h-[68vh] pointer-events-none select-none transition-transform duration-300"
                draggable={false}
              />
            ) : pkg ? (
              /* Built-in Luxury Generated Branded Poster Card for Packages without custom poster */
              <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-950 via-emerald-950/40 to-slate-950 text-white space-y-6 relative overflow-hidden">
                {/* Poster Header */}
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
                  <UbkLogo size="sm" variant="dark" showSubtitle={false} />
                  <div className="text-end">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                      {displayBadge || "PAKET RESMI"}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {pkg.month} {pkg.year}
                    </div>
                  </div>
                </div>

                {/* Main Package Title & Highlights */}
                <div className="text-center space-y-2 py-2">
                  <span className="inline-block text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    ✈️ {pkg.airline} • 🗓️ {pkg.programDays} {isArabic ? "أيام" : "Hari"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                    {displayTitle}
                  </h2>
                  {pkg.scholarLeader && (
                    <div className="text-xs text-amber-300 font-medium">
                      👥 {pkg.scholarLeader}
                    </div>
                  )}
                </div>

                {/* Hotels Info Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-amber-500/20 space-y-1">
                    <div className="text-amber-400 font-bold text-[11px]">🕋 HOTEL MAKKAH:</div>
                    <div className="text-slate-200 text-xs font-semibold leading-snug">
                      {pkg.makkahHotel}
                    </div>
                  </div>
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-500/20 space-y-1">
                    <div className="text-emerald-400 font-bold text-[11px]">🕌 HOTEL MADINAH:</div>
                    <div className="text-slate-200 text-xs font-semibold leading-snug">
                      {pkg.madinahHotel}
                    </div>
                  </div>
                </div>

                {/* Pricing Quad / Triple / Double */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/40 text-center space-y-2">
                  <div className="text-[10px] uppercase tracking-wider text-amber-400 font-black">
                    {isArabic ? "خيارات أسعار الغرف (للشخص الواحد)" : "PILIHAN HARGA PER ORANG"}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold">QUAD (4 Org)</div>
                      <div className="text-xs font-mono font-black text-emerald-400">
                        Rp {(pkg.priceQuad / 1000000).toFixed(1)} JT
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold">TRIPLE (3 Org)</div>
                      <div className="text-xs font-mono font-black text-amber-400">
                        Rp {(pkg.priceTriple / 1000000).toFixed(1)} JT
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold">DOUBLE (2 Org)</div>
                      <div className="text-xs font-mono font-black text-white">
                        Rp {(pkg.priceDouble / 1000000).toFixed(1)} JT
                      </div>
                    </div>
                  </div>
                </div>

                {/* Freebies Banner */}
                {parsedFreebies.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                      🎁 FREE / BONUS FASILITAS:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedFreebies.map((f, i) => (
                        <span
                          key={i}
                          className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-lg"
                        >
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Down Payment & Accreditations Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div>
                    <span>Cukup DP: </span>
                    <strong className="text-amber-300 font-mono">
                      Rp {(pkg.downPayment / 1000000).toFixed(1)} Juta
                    </strong>
                  </div>
                  <div className="text-end text-[10px] text-slate-500 font-mono">
                    Izin PPUI: U-271/2021
                  </div>
                </div>
              </div>
            ) : null}

            {/* ============================================================== */}
            {/* COMPREHENSIVE DIAGONAL WATERMARK OVERLAY (العلامة المائية) */}
            {/* ============================================================== */}
            <div
              className="absolute inset-0 z-20 pointer-events-none select-none flex flex-col justify-around overflow-hidden"
              style={{
                background:
                  "repeating-linear-gradient(45deg, rgba(245, 158, 11, 0.04) 0px, rgba(245, 158, 11, 0.04) 40px, transparent 40px, transparent 80px)",
              }}
            >
              {/* Row 1 Watermark */}
              <div className="transform -rotate-12 whitespace-nowrap opacity-30 text-[10px] sm:text-xs font-black tracking-widest text-amber-300/80 font-mono select-none">
                UBK UMRAH • OFFICIAL PREVIEW ONLY • DILARANG MENYALIN / MEREKAM TANPA IZIN • UBK UMRAH •
              </div>

              {/* Central Seal Watermark */}
              <div className="flex flex-col items-center justify-center transform -rotate-12 opacity-35 space-y-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-emblem.png"
                  alt="UBK Watermark"
                  className="w-24 sm:w-32 h-auto object-contain filter drop-shadow-lg"
                />
                <div className="text-xs sm:text-sm font-black font-mono tracking-widest text-amber-400 uppercase text-center border-y border-amber-400/40 py-0.5 px-4 bg-black/40 rounded">
                  PROTECTED PREVIEW • HAK CIPTA UBK
                </div>
              </div>

              {/* Row 2 Watermark */}
              <div className="transform -rotate-12 whitespace-nowrap opacity-30 text-[10px] sm:text-xs font-black tracking-widest text-amber-300/80 font-mono select-none">
                • DILARANG MENGAMBIL TANGKAPAN LAYAR • SCREENSHOT PROHIBITED • غير مصرح بالتصوير •
              </div>

              {/* Row 3 Watermark */}
              <div className="transform -rotate-12 whitespace-nowrap opacity-25 text-[9px] sm:text-[11px] font-black tracking-widest text-amber-300/70 font-mono select-none">
                PPUI NO. U-271 TAHUN 2021 • KEPALA CABANG BOGOR • KODE AGEN: EGWASDOB • UBK
              </div>
            </div>

            {/* Invisible Top Shield Glass preventing mouse drag/save */}
            <div
              className="absolute inset-0 z-30 cursor-default"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs relative z-30">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>🛡️</span>
            <span>
              {isArabic
                ? "هذا البوست محمي بنظام علامة مائية ذكية لمنع إعادة الإنتاج أو التصوير غير المصرح به."
                : "Brosur ini diproteksi watermark resmi untuk menjaga hak cipta & keaslian program."}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold transition text-xs"
            >
              {isArabic ? "إغلاق" : "Tutup"}
            </button>

            {onBookNow && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookNow(displayTitle);
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black transition shadow-lg text-xs"
              >
                {isArabic ? "حجز هذه الباقة 🚀" : "Pilih & Daftar Paket 🚀"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
