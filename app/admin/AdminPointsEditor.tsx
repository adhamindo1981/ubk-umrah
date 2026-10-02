"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

interface AdminBalanceEditorProps {
  marketerId: number;
  marketerName?: string;
  currentBalanceIDR?: number;
  currentPoints?: number; // legacy backward compatibility
}

export function AdminBalanceEditor({
  marketerId,
  marketerName,
  currentBalanceIDR,
  currentPoints,
}: AdminBalanceEditorProps) {
  const { isArabic } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"ADD" | "DEDUCT">("ADD");
  const [amountInput, setAmountInput] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Compute active balance in IDR
  const activeBalance =
    currentBalanceIDR !== undefined
      ? currentBalanceIDR
      : (currentPoints || 0) * 1000;

  const parsedAmount = Math.max(0, parseInt(amountInput.replace(/\D/g, "") || "0", 10));
  const changeValue = mode === "ADD" ? parsedAmount : -parsedAmount;
  const newProjectedBalance = activeBalance + changeValue;

  const quickPresets = [100000, 350000, 500000, 1000000, 2000000];

  async function handleSaveAdjustment() {
    if (parsedAmount <= 0) {
      alert(
        isArabic
          ? "يرجى إدخال مبلغ صحيح أكبر من الصفر"
          : "Silakan masukkan nominal yang valid lebih dari nol"
      );
      return;
    }

    if (mode === "DEDUCT" && parsedAmount > activeBalance) {
      const confirmNegative = confirm(
        isArabic
          ? `المبلغ المراد خصمه (Rp ${parsedAmount.toLocaleString("id-ID")}) يتجاوز الرصيد الحالي (Rp ${activeBalance.toLocaleString("id-ID")}). سيصبح الرصيد سلبياً. هل أنت متأكد من المتابعة؟`
          : `Nominal yang dipotong melebihi saldo aktif. Saldo akan menjadi minus. Lanjutkan?`
      );
      if (!confirmNegative) return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketer-points", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketerId,
          amountChange: changeValue,
          description:
            description.trim() ||
            (mode === "ADD"
              ? isArabic
                ? "تسوية رصيد يدوية (إيداع نقدي)"
                : "Penyesuaian manual (Kredit saldo)"
              : isArabic
              ? "تسوية رصيد يدوية (خصم خارج الموقع)"
              : "Penyesuaian manual (Debet saldo)"),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(
          isArabic
            ? `تم تحديث رصيد المسوّق بنجاح! الرصيد الجديد: Rp ${newProjectedBalance.toLocaleString("id-ID")}`
            : `Saldo berhasil diperbarui! Saldo baru: Rp ${newProjectedBalance.toLocaleString("id-ID")}`
        );
        setShowModal(false);
        window.location.reload();
      } else {
        alert(data.error || (isArabic ? "فشل تعديل الرصيد" : "Gagal memperbarui saldo"));
      }
    } catch (err) {
      alert(isArabic ? "حدث خطأ في الاتصال بالخادم" : "Terjadi kesalahan koneksi server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setAmountInput("");
          setDescription("");
          setMode("ADD");
          setShowModal(true);
        }}
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-300 px-3 py-1.5 rounded-xl transition shadow-sm"
      >
        <span>✏️</span>
        <span>{isArabic ? "تعديل الرصيد" : "Koreksi Saldo"}</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-slate-200 text-start space-y-5"
            onClick={(e) => e.stopPropagation()}
            dir={isArabic ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isArabic ? "تعديل رصيد المسوّق (تسوية مالية)" : "Koreksi Saldo Mitra (Penyesuaian Manual)"}
                </h3>
                {marketerName && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {isArabic ? `المسوّق: ` : `Mitra: `}
                    <strong className="text-emerald-700 font-bold">{marketerName}</strong>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Current Active Balance Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-inner">
              <span className="text-xs text-slate-300">
                {isArabic ? "الرصيد المتاح الحالي:" : "Saldo Aktif Saat Ini:"}
              </span>
              <span className="text-base font-black font-mono text-emerald-400">
                Rp {activeBalance.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Action Mode Toggle (Add vs Deduct) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {isArabic ? "نوع التسوية:" : "Jenis Penyesuaian:"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("ADD")}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 border ${
                    mode === "ADD"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>➕</span>
                  <span>{isArabic ? "إضافة رصيد (إيداع)" : "Tambah Saldo (Kredit)"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("DEDUCT")}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 border ${
                    mode === "DEDUCT"
                      ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>➖</span>
                  <span>{isArabic ? "خصم رصيد (سحب)" : "Kurangi Saldo (Debet)"}</span>
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {isArabic
                  ? "المبلغ بالروبية الإندونيسية (IDR):"
                  : "Nominal Penyesuaian (IDR):"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 start-0 ps-3.5 flex items-center text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  value={amountInput ? Number(amountInput.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                  onChange={(e) => {
                    const cleanNum = e.target.value.replace(/\D/g, "");
                    setAmountInput(cleanNum);
                  }}
                  className="w-full ps-10 pe-4 py-2.5 text-base font-black font-mono border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                  placeholder="0"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountInput(preset.toString())}
                    className="text-[10px] font-bold font-mono px-2 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-600 border border-slate-200 transition"
                  >
                    +{preset.toLocaleString("id-ID")}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason / Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                {isArabic
                  ? "سبب التسوية / ملاحظات الإدارة (اختياري):"
                  : "Catatan Penyesuaian (Opsional):"}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={
                  isArabic
                    ? "مثال: تسوية عمولة خارج المنصة / حافز إضافي / خصم مقابل سحب نقدي"
                    : "Contoh: Penyesuaian komisi offline / insentif bonus / koreksi penarikan tunai"
                }
              />
            </div>

            {/* Result Preview Box */}
            <div
              className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                newProjectedBalance < 0
                  ? "bg-rose-50 border-rose-200 text-rose-900"
                  : "bg-emerald-50 border-emerald-200 text-emerald-900"
              }`}
            >
              <span className="font-bold">
                {isArabic ? "الرصيد بعد التعديل:" : "Saldo Setelah Penyesuaian:"}
              </span>
              <span className="font-black font-mono text-sm">
                Rp {newProjectedBalance.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-xl transition"
              >
                {isArabic ? "إلغاء" : "Batal"}
              </button>
              <button
                type="button"
                onClick={handleSaveAdjustment}
                disabled={loading || parsedAmount <= 0}
                className="px-5 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition shadow-md shadow-emerald-600/20"
              >
                {loading
                  ? isArabic
                    ? "جاري الحفظ..."
                    : "Menyimpan..."
                  : isArabic
                  ? "تأكيد تعديل الرصيد 💾"
                  : "Konfirmasi Perubahan 💾"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Backward compatibility alias
export const AdminPointsEditor = AdminBalanceEditor;
