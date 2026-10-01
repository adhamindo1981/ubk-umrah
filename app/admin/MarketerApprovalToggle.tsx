"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";

interface MarketerApprovalToggleProps {
  marketerId: number;
  initialApproved: boolean;
  marketerName?: string;
}

export function MarketerApprovalToggle({
  marketerId,
  initialApproved,
  marketerName = "المسوق",
}: MarketerApprovalToggleProps) {
  const router = useRouter();
  const { isArabic } = useLanguage();
  const [isApproved, setIsApproved] = useState(initialApproved);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  async function toggleApproval() {
    setLoading(true);
    const newStatus = !isApproved;

    try {
      const res = await fetch("/api/admin/marketers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketerId, isApproved: newStatus }),
      });

      if (res.ok) {
        setIsApproved(newStatus);
        router.refresh();
      } else {
        alert(isArabic ? "فشل تحديث حالة المسوق" : "Gagal memperbarui status marketer");
      }
    } catch (err) {
      alert(isArabic ? "حدث خطأ في الاتصال" : "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/marketers?id=${marketerId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsDeleted(true);
        setShowConfirmDelete(false);
        router.refresh();
      } else {
        alert(data.error || (isArabic ? "فشل حذف المسوق" : "Gagal menghapus marketer"));
      }
    } catch (err) {
      alert(isArabic ? "حدث خطأ أثناء محاولة الحذف" : "Terjadi kesalahan saat menghapus");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (isDeleted) {
    return (
      <span className="text-[11px] font-bold text-rose-500 italic bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
        {isArabic ? "تم حذف المسوق 🗑️" : "Marketer Terhapus 🗑️"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Toggle Status Button */}
      <button
        type="button"
        onClick={toggleApproval}
        disabled={loading || deleteLoading}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm whitespace-nowrap ${
          isApproved
            ? "bg-emerald-100 text-emerald-800 hover:bg-amber-100 hover:text-amber-800 border border-emerald-300"
            : "bg-amber-500 text-white hover:bg-emerald-600 shadow-amber-500/20"
        }`}
        title={isArabic ? "انقر لتغيير الحالة بين تفعيل وتجميد" : "Klik untuk mengubah status aktivasi"}
      >
        {loading
          ? (isArabic ? "جاري التعديل…" : "Menyimpan…")
          : isApproved
          ? (isArabic ? "مفعل (انقر للتجميد)" : "Aktif (Bekukan)")
          : (isArabic ? "موافقة وتفعيل ⚡" : "Setujui & Aktifkan ⚡")}
      </button>

      {/* Delete Marketer Button */}
      <button
        type="button"
        onClick={() => setShowConfirmDelete(true)}
        disabled={loading || deleteLoading}
        className="p-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200 transition shadow-xs flex items-center justify-center"
        title={isArabic ? `حذف حساب (${marketerName}) نهائياً` : `Hapus akun (${marketerName}) permanen`}
      >
        <span className="text-sm">🗑️</span>
      </button>

      {/* Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 text-center"
            dir={isArabic ? "rtl" : "ltr"}
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {isArabic ? "تأكيد حذف حساب المسوق" : "Konfirmasi Hapus Marketer"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isArabic ? (
                  <>
                    هل أنت متأكد من رغبتك في حذف حساب المسوق{" "}
                    <strong className="text-slate-900 font-bold">({marketerName})</strong> نهائياً؟
                    سيتم فك ارتباط الطلبات وإلغاء صلاحية الدخول فوراً.
                  </>
                ) : (
                  <>
                    Apakah Anda yakin ingin menghapus akun{" "}
                    <strong className="text-slate-900 font-bold">({marketerName})</strong> secara permanen?
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition"
              >
                {isArabic ? "إلغاء" : "Batal"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
              >
                {deleteLoading ? (
                  <span>{isArabic ? "جاري الحذف..." : "Menghapus..."}</span>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>{isArabic ? "تأكيد الحذف" : "Hapus Sekarang"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
