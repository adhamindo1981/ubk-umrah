"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

interface AdminPayoutActionProps {
  payoutId: number;
  initialStatus: string;
  initialReceiptUrl?: string | null;
  initialNotes?: string | null;
  amount?: number;
  bankInfo?: string;
  marketerName?: string;
}

export function AdminPayoutAction({
  payoutId,
  initialStatus,
  initialReceiptUrl,
  initialNotes,
  amount,
  bankInfo,
  marketerName,
}: AdminPayoutActionProps) {
  const { isArabic } = useLanguage();
  const [status, setStatus] = useState(initialStatus);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(initialReceiptUrl || null);
  const [notes, setNotes] = useState<string>(initialNotes || "");
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [selectedReceiptFile, setSelectedReceiptFile] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setSelectedReceiptFile(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleApproveWithProof() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId,
          status: "APPROVED",
          receiptImageUrl: selectedReceiptFile || undefined,
          notes: approvalNotes.trim() || undefined,
        }),
      });

      if (res.ok) {
        setStatus("APPROVED");
        if (selectedReceiptFile) setReceiptUrl(selectedReceiptFile);
        if (approvalNotes.trim()) setNotes(approvalNotes.trim());
        setShowApprovalModal(false);
      } else {
        alert(isArabic ? "فشل اعتماد طلب التحويل" : "Gagal menyetujui transfer penarikan dana");
      }
    } catch (err) {
      alert(isArabic ? "حدث خطأ في الاتصال بالخادم" : "Gangguan koneksi jaringan");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!confirm(isArabic ? "هل أنت متأكد من رفض طلب السحب؟" : "Apakah Anda yakin ingin menolak pengajuan ini?")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId, status: "REJECTED" }),
      });

      if (res.ok) {
        setStatus("REJECTED");
      } else {
        alert(isArabic ? "فشل رفض طلب السحب" : "Gagal menolak permohonan");
      }
    } catch (err) {
      alert(isArabic ? "حدث خطأ في الاتصال بالخادم" : "Gangguan koneksi jaringan");
    } finally {
      setLoading(false);
    }
  }

  if (status === "APPROVED") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
          <span>✓</span>
          <span>{isArabic ? "تم التحويل بنجاح" : "Berhasil Ditransfer"}</span>
        </span>

        {receiptUrl ? (
          <button
            onClick={() => setShowReceiptPreview(true)}
            className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition inline-flex items-center gap-1"
          >
            <span>📄</span>
            <span>{isArabic ? "معاينة الإيصال" : "Bukti Transfer"}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowApprovalModal(true)}
            className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-200 transition"
          >
            {isArabic ? "+ إرفاق إيصال" : "+ Upload Bukti"}
          </button>
        )}

        {/* Receipt Lightbox Preview Modal */}
        {showReceiptPreview && receiptUrl && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowReceiptPreview(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-5 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {isArabic ? "إيصال التحويل البنكي المعتمد" : "Bukti Transfer Bank Resmi"}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ID Payout: #{payoutId} {marketerName ? `• ${marketerName}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => setShowReceiptPreview(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto bg-slate-100 rounded-xl flex items-center justify-center p-2 border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={receiptUrl}
                  alt="Bukti Transfer Payout"
                  className="max-h-[50vh] max-w-full object-contain rounded-lg shadow-sm"
                />
              </div>

              {notes && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold">{isArabic ? "ملاحظات / رقم المرجع:" : "Catatan / No. Ref:"} </span>
                  <span className="font-mono">{notes}</span>
                </div>
              )}

              <div className="flex gap-2">
                <a
                  href={receiptUrl}
                  download={`bukti-transfer-payout-${payoutId}.png`}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl text-center shadow-sm transition"
                >
                  {isArabic ? "تحميل الإيصال ⬇️" : "Unduh Bukti ⬇️"}
                </a>
                <button
                  onClick={() => setShowReceiptPreview(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  {isArabic ? "إغلاق" : "Tutup"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Allow attaching receipt if missed earlier */}
        {showApprovalModal && (
          <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setShowApprovalModal(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-start"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-extrabold text-sm text-slate-900">
                  {isArabic ? "إرفاق إيصال التحويل البنكي" : "Upload Bukti Transfer Bank"}
                </h4>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isArabic ? "صورة الإيصال (PNG, JPG)" : "File Bukti Transfer (PNG, JPG)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              {selectedReceiptFile && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedReceiptFile} alt="Preview" className="max-h-40 mx-auto object-contain rounded-lg" />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isArabic ? "رقم المرجع / ملاحظات التحويل" : "No. Referensi / Catatan"}
                </label>
                <input
                  type="text"
                  placeholder="Contoh: TRF-BCA-98129031"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleApproveWithProof}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {loading ? (isArabic ? "جاري الحفظ..." : "Menyimpan...") : (isArabic ? "حفظ الإيصال" : "Simpan Bukti")}
                </button>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  {isArabic ? "إلغاء" : "Batal"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <span className="text-xs font-bold text-rose-800 bg-rose-100 px-3 py-1 rounded-full border border-rose-200 inline-flex items-center gap-1">
        <span>✕</span>
        <span>{isArabic ? "تم الرفض" : "Ditolak"}</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowApprovalModal(true)}
        disabled={loading}
        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl shadow-xs transition"
      >
        {isArabic ? "تأكيد التحويل ✅" : "Konfirmasi Transfer ✅"}
      </button>

      <button
        onClick={handleReject}
        disabled={loading}
        className="text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 px-3 py-1.5 rounded-xl transition"
      >
        {isArabic ? "رفض ❌" : "Tolak ❌"}
      </button>

      {/* Approval & Receipt Upload Modal */}
      {showApprovalModal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowApprovalModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-extrabold text-base text-slate-900">
                  {isArabic ? "تأكيد تحويل العمولة وإرفاق الإيصال" : "Konfirmasi Transfer & Bukti Payout"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: #{payoutId} {marketerName ? `• ${marketerName}` : ""}
                </p>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Transfer Summary */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">{isArabic ? "المبلغ المراد تحويله:" : "Nominal Transfer:"}</span>
                <span className="font-black text-emerald-700 font-mono">
                  {amount !== undefined ? `Rp ${amount.toLocaleString("id-ID")}` : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isArabic ? "الحساب البنكي / المحفظة:" : "Rekening Tujuan:"}</span>
                <span className="font-bold text-slate-800 text-end max-w-xs">{bankInfo || "-"}</span>
              </div>
            </div>

            {/* Proof of Transfer Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isArabic ? "إرفاق إيصال التحويل البنكي (Bukti Transfer)" : "Lampirkan Bukti Transfer Bank (Screenshot / Foto)"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {isArabic
                  ? "يُفضل إرفاق إشعار تحويل البنك لتوثيق العملية وحماية حقوق المسوّق."
                  : "Dianjurkan melampirkan resi/screenshot transfer untuk transparansi dengan mitra."}
              </p>
            </div>

            {/* Receipt Preview */}
            {selectedReceiptFile && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedReceiptFile} alt="Preview Bukti Transfer" className="max-h-40 mx-auto object-contain rounded-lg" />
              </div>
            )}

            {/* Transfer Reference / Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isArabic ? "رقم الحوالة أو المرجع (اختياري)" : "No. Referensi / Catatan Transfer (Opsional)"}
              </label>
              <input
                type="text"
                placeholder="Contoh: TRF-BCA-20261001-9812"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleApproveWithProof}
                disabled={loading}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
              >
                {loading
                  ? (isArabic ? "جاري الاعتماد..." : "Sedang Menyimpan...")
                  : (isArabic ? "اعتماد وإتمام التحويل ✅" : "Konfirmasi & Setujui Transfer ✅")}
              </button>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                {isArabic ? "إلغاء" : "Batal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
