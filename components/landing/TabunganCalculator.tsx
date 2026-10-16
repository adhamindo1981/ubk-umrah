"use client";

import React, { useState, useId } from "react";
import {
  Calculator,
  CheckCircle2,
  ChevronRight,
  Flame,
  Lock,
  MessageCircle,
  Phone,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Utensils,
  Wallet,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface TabunganCalculatorProps {
  marketerCode: string;
  marketerName: string;
  marketerWhatsapp?: string | null;
}

interface PackageOption {
  id: string;
  name: string;
  nameAr: string;
  period: string;
  days: number;
  guide?: string;
  prices: {
    quad: number; // 4 Orang
    triple: number; // 3 Orang
    double: number; // 2 Orang
  };
  features: string[];
}

const PACKAGES: PackageOption[] = [
  {
    id: "NOVEMBER_2026",
    name: "Umrah Periode November 2026",
    nameAr: "عمرة شهر نوفمبر 2026 (9 أيام)",
    period: "November 2026",
    days: 9,
    prices: {
      quad: 30900000,
      triple: 31900000,
      double: 34000000,
    },
    features: [
      "Izin Kemenag RI (PPIU No. U-271 Tahun 2021 - Asma Tour)",
      "Penerbangan Premium Qatar Airways PP",
      "Hotel Makkah Jada Ajyad / Kayan Raya (4 Malam) Tanpa Shuttle",
      "Hotel Madinah Andalus Salam / Nada Salam (3 Malam)",
      "Gratis Ayam Albaik & Welcome Drink Zam-zam",
    ],
  },
  {
    id: "DESEMBER_2026",
    name: "Umrah Taysir Desember 2026",
    nameAr: "عمرة التيسير ديسمبر 2026 (بإشراف الشيخ د. حسن بوقس)",
    period: "Desember 2026",
    days: 9,
    guide: "Sheikh Dr. Hassan Bugis & Ummi Nurlaila",
    prices: {
      quad: 31500000,
      triple: 32500000,
      double: 34900000,
    },
    features: [
      "Bimbingan Eksklusif Sheikh Dr. Hassan Bugis & Ummi Nurlaila",
      "Izin Resmi PPIU No. U-271 Tahun 2021 - Asma Tour Bogor",
      "Penerbangan Qatar Airways PP",
      "Hotel Makkah & Madinah Walking Distance Tanpa Shuttle",
      "Gratis Kuliner Khas Albaik & Fasilitas All-In",
    ],
  },
];

export function TabunganCalculator({
  marketerCode,
  marketerName,
  marketerWhatsapp,
}: TabunganCalculatorProps) {
  const { isArabic } = useLanguage();
  const nameInputId = useId();
  const waInputId = useId();

  // Configuration States
  const [selectedPkgId, setSelectedPkgId] = useState<string>("NOVEMBER_2026");
  const [roomType, setRoomType] = useState<"quad" | "triple" | "double">("quad");
  const [jamaahCount, setJamaahCount] = useState<number>(1);
  const [installmentMonths, setInstallmentMonths] = useState<number>(6); // 3, 6, 12 months

  // Lead Form States
  const [clientName, setClientName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected Package Calculation
  const activePackage = PACKAGES.find((p) => p.id === selectedPkgId) || PACKAGES[0];
  const unitPrice = activePackage.prices[roomType];
  const totalPrice = unitPrice * jamaahCount;
  const standardDpPerPerson = 5000000; // DP 5 Juta to lock seat
  const totalDp = standardDpPerPerson * jamaahCount;
  const remainingBalance = Math.max(0, totalPrice - totalDp);
  const monthlyInstallment = Math.round(remainingBalance / installmentMonths);

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!clientName.trim() || clientName.trim().length < 2) {
      setErrorMessage(
        isArabic ? "يرجى كتابة اسم المعتمر بالكامل" : "Harap masukkan nama lengkap Anda (minimal 2 karakter)"
      );
      return;
    }

    if (!whatsappNumber.trim()) {
      setErrorMessage(
        isArabic ? "يرجى إدخال رقم الواتساب" : "Harap masukkan nomor WhatsApp yang aktif"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        marketerCode,
        clientName: clientName.trim(),
        whatsappNumber: whatsappNumber.trim(),
        packageChoice: `${activePackage.name} (${roomType.toUpperCase()} Room)`,
        jamaahCount,
        installmentMonths,
        totalPrice,
        dpAmount: totalDp,
        monthlyInstallment,
      };

      const res = await fetch("/api/public/tabungan-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim data simulasi.");
      }

      setFormSubmitted(true);

      // Open pre-filled WhatsApp link to the marketer in a new tab
      if (data.waUrl) {
        window.open(data.waUrl, "_blank");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="simulasi-tabungan"
      className="relative py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-amber-500/20 text-white overflow-hidden"
    >
      {/* Decorative Glow Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-10">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-amber-500/20 to-emerald-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-wider shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span>{isArabic ? "حاسبة التوفير الذكية للعمرة" : "SIMULASI TABUNGAN UMRAH UBK"}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {isArabic ? (
              <>
                خطط لرحلتك المباركة بـ{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400">
                  دفعة أولى 5 مليون روبية فقط
                </span>
              </>
            ) : (
              <>
                Rencanakan Ibadah Nyaman:{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400">
                  Cukup DP Rp 5 Juta
                </span>{" "}
                Langsung Kunci Seat
              </>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isArabic
              ? "اختر باقة نوفمبر أو ديسمبر، وحدد عدد المعتمرين ومدة التقسيط، واكتشف القسط الشهري الميسر مع تثبيت سعر الصرف وفنادق قريبة مشياً دون باصات شاتل."
              : "Hitung perkiraan tabungan bulanan yang ringan untuk Anda & keluarga. Tersedia program 9 hari bergaransi resmi Kemenag RI tanpa biaya tersembunyi."}
          </p>
        </div>

        {/* Studio-Style Interactive Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Configurator Controls (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur-xl border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* 1. Package Selector */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Plane className="w-4 h-4 text-emerald-400" />
                <span>{isArabic ? "1. اختر برنامج وباقة العمرة:" : "1. Pilih Program Periode Umrah:"}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PACKAGES.map((pkg) => {
                  const isSelected = selectedPkgId === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={`text-start p-4 rounded-2xl border transition-all duration-300 relative cursor-pointer active:scale-98 ${
                        isSelected
                          ? "bg-gradient-to-br from-emerald-950/80 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50"
                          : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      {pkg.guide && (
                        <span className="inline-block text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full mb-1.5 font-sans">
                          ⭐ Pembimbing Khusus
                        </span>
                      )}
                      <h4 className="font-black text-sm text-white">
                        {isArabic ? pkg.nameAr : pkg.name}
                      </h4>
                      <p className="text-[11px] text-emerald-400 font-mono mt-1 font-bold">
                        Mulai Rp {(pkg.prices.quad / 1000000).toFixed(1)} Juta
                      </p>
                      {pkg.guide && (
                        <p className="text-[10px] text-slate-400 mt-0.5 italic">
                          {pkg.guide}
                        </p>
                      )}
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-amber-400">
                          <CheckCircle2 className="w-5 h-5 fill-amber-400 text-slate-950" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Room Type Selector (Quad / Triple / Double) */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>{isArabic ? "2. نوع الغرفة والتسكين:" : "2. Pilihan Tipe Kamar Hotel:"}</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {isArabic ? "سعر الفرد يختلف حسب سعة الغرفة" : "Harga per jamaah"}
                </span>
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {(
                  [
                    { id: "quad", label: "Quad (4 Orang)", sub: "Paling Hemat", price: activePackage.prices.quad },
                    { id: "triple", label: "Triple (3 Orang)", sub: "Keluarga Kecil", price: activePackage.prices.triple },
                    { id: "double", label: "Double (2 Orang)", sub: "Pasangan/VIP", price: activePackage.prices.double },
                  ] as const
                ).map((r) => {
                  const active = roomType === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRoomType(r.id)}
                      className={`p-3 rounded-2xl border text-center transition cursor-pointer active:scale-95 ${
                        active
                          ? "bg-amber-500/15 border-amber-400 text-white shadow-md shadow-amber-500/10 font-black"
                          : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold">{r.label}</div>
                      <div className="text-[10px] text-emerald-400 font-mono font-bold mt-1">
                        Rp {(r.price / 1000000).toFixed(1)} JT
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{r.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Number of Jamaah Stepper */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="space-y-0.5 text-center sm:text-start">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  {isArabic ? "3. عدد المعتمرين المسافرين:" : "3. Jumlah Jamaah yang Didaftarkan:"}
                </span>
                <p className="text-[11px] text-slate-400">
                  {isArabic ? "مبلغ الدفعة الأولى يحسب لكل معتمر" : "DP dihitung Rp 5.000.000 per orang"}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-2xl p-1.5">
                <button
                  type="button"
                  onClick={() => setJamaahCount(Math.max(1, jamaahCount - 1))}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center transition active:scale-90"
                  disabled={jamaahCount <= 1}
                >
                  -
                </button>
                <span className="w-10 text-center font-mono font-black text-lg text-amber-400">
                  {jamaahCount}
                </span>
                <button
                  type="button"
                  onClick={() => setJamaahCount(Math.min(10, jamaahCount + 1))}
                  className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center transition active:scale-90"
                  disabled={jamaahCount >= 10}
                >
                  +
                </button>
              </div>
            </div>

            {/* 4. Installment Duration (3, 6, 12 months) */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>{isArabic ? "4. خطة ومدة التوفير والتقسيط:" : "4. Rencana Periode Tabungan / Angsuran:"}</span>
                </span>
                <span className="text-[10px] text-amber-400 font-bold">
                  {installmentMonths} {isArabic ? "أشهر" : "Bulan"}
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[3, 6, 12, 18].map((months) => {
                  const active = installmentMonths === months;
                  return (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setInstallmentMonths(months)}
                      className={`py-3 px-2 rounded-2xl border text-center transition cursor-pointer active:scale-95 ${
                        active
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-700 border-emerald-400 text-white font-black shadow-lg shadow-emerald-700/20"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold">
                        {months} {isArabic ? "أشهر" : "Bulan"}
                      </div>
                      <div className="text-[10px] text-emerald-200 mt-0.5">
                        {months === 3
                          ? "Cepat"
                          : months === 6
                          ? "Favorit"
                          : months === 12
                          ? "1 Tahun"
                          : "1.5 Tahun"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Key USPs / Package Guarantees */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Keunggulan Fasilitas All-In Resmi UBK:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {activePackage.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Output & Lead Capture Gate (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Visual Breakdown Card */}
            <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-400/40 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
              {/* Highlight Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Estimasi Realistis</span>
                </span>
                <span className="text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  Garansi Seat 100%
                </span>
              </div>

              {/* DP Highlight Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border border-amber-400/30 space-y-1 text-center">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                  {isArabic ? "دفعة أولى لتأكيد وقفل المقعد:" : "CUKUP DP KUNCI SEAT HARI INI:"}
                </span>
                <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                  Rp {totalDp.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-slate-400 font-sans">
                  (Rp 5.000.000 × {jamaahCount} Jamaah)
                </div>
              </div>

              {/* Monthly Installment Output */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>{isArabic ? "إجمالي قيمة الرحلة:" : "Total Biaya Paket:"}</span>
                  <span className="font-mono font-bold text-white">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>{isArabic ? "المتبقي بعد الدفعة الأولى:" : "Sisa Pembayaran (Setelah DP):"}</span>
                  <span className="font-mono font-bold text-slate-300">
                    Rp {remainingBalance.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                      {isArabic ? "الادخار الشهري المقدر:" : "ESTIMASI TABUNGAN / BULAN:"}
                    </div>
                    <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                      Rp {monthlyInstallment.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-1 rounded-lg">
                      Selama {installmentMonths} Bulan
                    </span>
                  </div>
                </div>
              </div>

              {/* Lead Capture Gate Form */}
              <div className="pt-2 border-t border-slate-800 space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dapatkan Jadwal Resmi & Konsultasi Gratis</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Kirimkan simulasi ini ke konsultan resmi Anda{" "}
                    <strong className="text-amber-300">({marketerName})</strong> untuk mengamankan seat dan panduan pendaftaran:
                  </p>
                </div>

                {formSubmitted ? (
                  <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-center space-y-2 animate-fadeIn">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div className="font-black text-sm text-white">Simulasi Berhasil Disimpan!</div>
                    <p className="text-xs text-slate-300">
                      WhatsApp Anda telah disiapkan. Tim konsultan kami ({marketerName}) akan memandu Anda secara personal.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFormSubmitted(false)}
                      className="text-xs font-bold text-emerald-300 underline pt-1"
                    >
                      Lakukan Simulasi Ulang
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitLead} className="space-y-3">
                    {errorMessage && (
                      <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs">
                        {errorMessage}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label htmlFor={nameInputId} className="text-[11px] font-bold text-slate-300 block">
                        Nama Lengkap Anda
                      </label>
                      <input
                        id={nameInputId}
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Contoh: H. Ahmad Subagio"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor={waInputId} className="text-[11px] font-bold text-slate-300 block">
                        Nomor WhatsApp Aktif
                      </label>
                      <div className="relative">
                        <input
                          id={waInputId}
                          type="tel"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="Contoh: 08123456789 atau 628..."
                          required
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                        />
                        <Phone className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/50 transition-all duration-300 transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Sedang Memproses...</span>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          <span>Kirim Simulasi ke WhatsApp Konsultan</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Marketer Attribution Note */}
            <div className="text-center text-[11px] text-slate-500">
              Konsultan Resmi: <span className="text-slate-300 font-semibold">{marketerName}</span> • Kode:{" "}
              <span className="font-mono text-amber-400">{marketerCode}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
