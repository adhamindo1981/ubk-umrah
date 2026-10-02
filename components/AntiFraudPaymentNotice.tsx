"use client";

import React, { useState } from "react";
import { OFFICIAL_BANK_CONFIG } from "@/lib/bankConfig";

interface AntiFraudInlineBoxProps {
  isArabic: boolean;
  className?: string;
}

/**
 * Inline Security & Anti-Fraud Disclaimer Box for Booking Forms.
 * Shows corporate bank details and strict warning against paying marketers in cash or personal accounts.
 */
export function AntiFraudInlineBox({ isArabic, className = "" }: AntiFraudInlineBoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-red-950/40 via-slate-900 to-amber-950/30 border-2 border-red-500/50 shadow-lg space-y-3.5 text-start ${className}`}>
      {/* Warning Header */}
      <div className="flex items-center gap-2.5 text-rose-400 font-black text-xs sm:text-sm">
        <span className="text-xl animate-pulse">⚠️</span>
        <span>
          {isArabic
            ? "تنبيه أمني هام جداً وإخلاء مسؤولية مالية"
            : "PERINGATAN KEAMANAN FINANSIAL PENTING"}
        </span>
      </div>

      {/* Warning Body */}
      <p className="text-[11.5px] sm:text-xs text-slate-300 leading-relaxed">
        {isArabic ? (
          <>
            يُحظر تماماً تسليم أي مبالغ نقدية للمسوق أو تحويل أي مبالغ إلى أي حساب بنكي شخصي. <strong className="text-rose-300">منصة عمر بن الخطاب للعمرة (UBK) غير مسؤولة إطلاقاً</strong> عن أي أموال تُدفع خارج حساب الشركة الرسمي. الدفع يتم حصراً عبر التحويل البنكي المباشر إلى حساب الشركة المعتمد أدناه:
          </>
        ) : (
          <>
            Dilarang keras menyerahkan uang tunai kepada mitra pemasar atau mentransfer ke rekening bank pribadi siapa pun. <strong className="text-rose-300">PT. Umar Bin Alkhattab for Umrah (UBK) TIDAK BERTANGGUNG JAWAB</strong> atas pembayaran yang dilakukan di luar rekening resmi perusahaan. Pembayaran DP/Pelunasan HANYA SAH jika ditransfer langsung ke rekening giro resmi perusahaan berikut:
          </>
        )}
      </p>

      {/* Official Corporate Bank Account Card */}
      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/40 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-amber-400 font-bold">
          <span>🏛️ {OFFICIAL_BANK_CONFIG.bankName}</span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
            {isArabic ? "الحساب الرسمي المعتمد" : "Rekening Giro Resmi"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              {isArabic ? "رقم الحساب البنكي" : "Nomor Rekening"}
            </div>
            <div className="text-base sm:text-lg font-black text-white font-mono tracking-wider">
              {OFFICIAL_BANK_CONFIG.accountNumber}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(OFFICIAL_BANK_CONFIG.accountNumber)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition active:scale-95 flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
          >
            <span>{copied ? "✓" : "📋"}</span>
            <span>
              {copied
                ? isArabic ? "تم النسخ!" : "Tersalin!"
                : isArabic ? "نسخ الرقم" : "Salin No. Rek"}
            </span>
          </button>
        </div>

        <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
          <span className="text-slate-400">{isArabic ? "اسم المستفيد: " : "Atas Nama: "}</span>
          <strong className="text-emerald-400 font-bold">{OFFICIAL_BANK_CONFIG.accountHolder}</strong>
        </div>
      </div>
    </div>
  );
}

interface AntiFraudConfirmationModalProps {
  isOpen: boolean;
  isArabic: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Mandatory Pre-submission Security Confirmation Modal.
 * Will NOT disappear until user explicitly accepts and clicks confirm.
 */
export function AntiFraudConfirmationModal({
  isOpen,
  isArabic,
  onConfirm,
  onCancel,
  loading = false,
}: AntiFraudConfirmationModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-slate-900 border-2 border-red-500/80 rounded-3xl p-6 sm:p-7 shadow-2xl text-start space-y-5 animate-scaleUp text-slate-100"
        dir={isArabic ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center text-2xl shrink-0">
            🛡️
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
              {isArabic
                ? "تأكيد أمني وإخلاء مسؤولية مالية إلزامي"
                : "Konfirmasi Keamanan & Larangan Pembayaran Tunai"}
            </h3>
            <span className="text-[11px] text-rose-400 font-bold">
              {isArabic ? "خطوة تحقق إلزامية قبل إرسال طلب الحجز" : "Langkah wajib sebelum pengiriman formulir"}
            </span>
          </div>
        </div>

        {/* Warning Details */}
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-2xl border border-red-500/30">
          <p className="font-semibold text-rose-300">
            {isArabic ? (
              <>
                ⚠️ تنبيه للمعتمر الكريم: نلفت انتباهكم إلى أنه <span className="underline decoration-red-500 font-black">يُحظر تماماً</span> تسليم أي مبالغ نقدية للمسوق أو تحويل أي مبالغ لحسابات شخصية.
              </>
            ) : (
              <>
                ⚠️ Peringatan untuk Calon Jamaah: <span className="underline decoration-red-500 font-black">Dilarang Keras</span> menyerahkan uang tunai kepada mitra pemasar atau mentransfer ke rekening pribadi mitra.
              </>
            )}
          </p>
          <p>
            {isArabic ? (
              <>
                منصة عمر بن الخطاب للعمرة (PT. UBK) غير مسؤولة قانونياً أو مالياً عن أي أموال تُدفع خارج حساب الشركة الرسمي. جميع عمليات السداد يجب أن تتم حصراً عبر الحساب البنكي المعتمد للشركة:
              </>
            ) : (
              <>
                PT. Umar Bin Alkhattab for Umrah tidak bertanggung jawab secara hukum maupun materiil atas transaksi di luar rekening resmi berikut:
              </>
            )}
          </p>
        </div>

        {/* Official Account Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
            <span>🏛️ {OFFICIAL_BANK_CONFIG.bankName}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              {isArabic ? "حساب معتمد رسمي" : "Rekening Resmi"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                {isArabic ? "رقم الحساب البنكي" : "Nomor Rekening"}
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-300 font-mono tracking-wider">
                {OFFICIAL_BANK_CONFIG.accountNumber}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(OFFICIAL_BANK_CONFIG.accountNumber)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition active:scale-95 flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <span>{copied ? "✓" : "📋"}</span>
              <span>
                {copied
                  ? isArabic ? "تم النسخ!" : "Tersalin!"
                  : isArabic ? "نسخ الرقم" : "Salin No. Rek"}
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800">
            <span className="text-slate-400">{isArabic ? "اسم المستفيد: " : "Atas Nama: "}</span>
            <strong className="text-white font-bold">{OFFICIAL_BANK_CONFIG.accountHolder}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>✓</span>
            <span>
              {loading
                ? isArabic ? "جاري الإرسال..." : "Mengirimkan..."
                : isArabic
                ? "أقر وأوافق، وسأحول للحساب الرسمي فقط"
                : "Saya Setuju & Transfer Hanya ke Rekening Resmi"}
            </span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition text-center cursor-pointer"
          >
            {isArabic ? "تراجع" : "Batal / Kembali"}
          </button>
        </div>
      </div>
    </div>
  );
}
