"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";

export interface AdminDeleteOrderModalProps {
  orderId: number;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  marketerName?: string | null;
  parentMarketerName?: string | null;
  status: string;
  rewardAwarded?: boolean;
}

export function AdminDeleteOrderModal({
  orderId,
  clientName,
  clientEmail,
  clientPhone,
  marketerName,
  parentMarketerName,
  status,
  rewardAwarded = false,
}: AdminDeleteOrderModalProps) {
  const { isArabic } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/orders?orderId=${orderId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus pesanan");
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || (isArabic ? "حدث خطأ أثناء محاولة الحذف" : "Terjadi kesalahan saat menghapus"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setErrorMsg(null);
          setIsOpen(true);
        }}
        title={isArabic ? "حذف الحجز وإلغاء العمولات" : "Hapus Pesanan & Batalkan Komisi"}
        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors inline-flex items-center gap-1 font-semibold text-xs"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span className="hidden sm:inline">
          {isArabic ? "حذف" : "Hapus"}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-100 flex flex-col max-h-[90vh]"
            dir={isArabic ? "rtl" : "ltr"}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-xl shrink-0">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {isArabic ? "تأكيد حذف حجز المعتمر" : "Konfirmasi Hapus Pesanan Jamaah"}
                  </h3>
                  <p className="text-xs text-rose-200 mt-0.5 font-mono">
                    #{orderId} - {clientName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => !loading && setIsOpen(false)}
                disabled={loading}
                className="text-white/60 hover:text-white p-1 rounded-xl transition text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto text-xs leading-relaxed text-slate-700">
              {/* Order Info Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-400">{isArabic ? "رقم الحجز:" : "No. Pesanan:"}</span>
                  <span className="font-mono font-bold text-slate-900">#{orderId}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-400">{isArabic ? "اسم المعتمر:" : "Nama Jamaah:"}</span>
                  <span className="font-bold text-slate-900">{clientName}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-400">{isArabic ? "البريد الإلكتروني:" : "Email Jamaah:"}</span>
                  <span className="font-mono text-slate-700">{clientEmail}</span>
                </div>
                {clientPhone && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-400">{isArabic ? "رقم الهاتف:" : "No. WhatsApp/HP:"}</span>
                    <span className="font-mono text-slate-700">{clientPhone}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-400">{isArabic ? "المسوق المباشر:" : "Mitra Pemasar:"}</span>
                  <span className="font-bold text-emerald-700">
                    {marketerName || (isArabic ? "حجز مباشر (بدون مسوق)" : "Langsung (Tanpa Mitra)")}
                  </span>
                </div>
                {parentMarketerName && (
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                    <span className="text-slate-400">{isArabic ? "المسوق الراعي (الذي سجله):" : "Mitra Sponsor/Induk:"}</span>
                    <span className="font-bold text-indigo-700">{parentMarketerName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">{isArabic ? "حالة الحجز الحالية:" : "Status Saat Ini:"}</span>
                  <span className="font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px]">
                    {status}
                  </span>
                </div>
              </div>

              {/* Warning Alert Banner */}
              <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                  <span>🚨</span>
                  <span>{isArabic ? "التبعات الإدارية والمالية للحذف:" : "Dampak Finansial & Administrasi:"}</span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-xs text-rose-800 pr-1">
                  <li>
                    {isArabic
                      ? "سيتم حذف هذا الحجز نهائياً من قاعدة البيانات وجدول الطلبات."
                      : "Pesanan ini akan dihapus permanen dari database."}
                  </li>
                  {rewardAwarded || status === "COMPLETED" ? (
                    <>
                      <li className="font-semibold text-rose-950">
                        {isArabic
                          ? `سيتم فورياً إلغاء وسحب عمولة المسوق المباشر (${marketerName || "المسوق"}) من رصيده ومحفظته.`
                          : `Komisi mitra langsung (${marketerName || "mitra"}) otomatis ditarik dan dibatalkan.`}
                      </li>
                      {parentMarketerName && (
                        <li className="font-semibold text-rose-950">
                          {isArabic
                            ? `سيتم فورياً إلغاء وسحب عمولة المسوق الراعي (${parentMarketerName}) من رصيده ومحفظته.`
                            : `Komisi sponsor induk (${parentMarketerName}) otomatis ditarik dan dibatalkan.`}
                        </li>
                      )}
                      <li>
                        {isArabic
                          ? "سيتم تحديث كشف الحساب البنكي وسجل المحفظة لكلا المسوقين تلقائياً."
                          : "Buku kas ledger dan saldo dompet kedua mitra otomatis terkoreksi."}
                      </li>
                    </>
                  ) : (
                    <li>
                      {isArabic
                        ? "هذا الحجز لم يتم توزيع عمولات له بعد (لم تكن حالته مكتملة)، لذا لن يتم خصم أي عمولات من المسوقين."
                        : "Pesanan ini belum menghasilkan komisi, tidak ada pemotongan saldo yang terjadi."}
                    </li>
                  )}
                </ul>
              </div>

              {errorMsg && (
                <div className="bg-rose-100 border border-rose-300 text-rose-800 rounded-xl p-3 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition"
              >
                {isArabic ? "إلغاء التراجع" : "Batal"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                {loading && (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>
                  {isArabic ? "تأكيد الحذف النهائي وإلغاء العمولات" : "Ya, Hapus & Batalkan Komisi"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
