"use client";

import { useState } from "react";

interface AdminPointsEditorProps {
  marketerId: number;
  currentPoints: number;
}

export function AdminPointsEditor({
  marketerId,
  currentPoints,
}: AdminPointsEditorProps) {
  const [showModal, setShowModal] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  async function handleAddPoints() {
    if (pointsToAdd === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketer-points", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketerId, pointsToAdd: Number(pointsToAdd) }),
      });

      if (res.ok) {
        alert("تم تعديل النقاط بنجاح!");
        window.location.reload();
      } else {
        alert("فشل تعديل النقاط");
      }
    } catch (err) {
      alert("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 rounded-lg transition"
      >
        ✏️ تعديل النقاط ({currentPoints})
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 text-right">
            <h3 className="text-lg font-bold text-slate-900 mb-2">تعديل نقاط المسوّق يدويًا</h3>
            <p className="text-xs text-slate-500 mb-4">
              النقاط الحالية: <strong>{currentPoints}</strong> نقطة. أضف أو اخصم نقاطاً لهذا المسوّق.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  النقاط المضافة (أدخل رقم سلبي للخصم)
                </label>
                <input
                  type="number"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  placeholder="مثال: 50 أو -20"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddPoints}
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
                >
                  {loading ? "جاري الحفظ…" : "حفظ النقاط"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
