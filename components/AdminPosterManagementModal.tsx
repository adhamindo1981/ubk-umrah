"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";

interface PosterOrder {
  id: number;
  marketerId: number;
  templateId: number;
  paymentMethod: string;
  paymentStatus: string;
  receiptImageUrl: string | null;
  pricePaid: number;
  licenseKey: string;
  createdAt: string;
  marketer: {
    id: number;
    username: string;
    email: string;
    whatsapp: string | null;
    referralCode: string | null;
  };
  template: {
    id: number;
    title: string;
    price: number;
    category: string;
    previewImageUrl: string;
  };
}

export function AdminPosterManagementModal() {
  const { isArabic } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "publish">("orders");
  const [orders, setOrders] = useState<PosterOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // New Template Form State (For Designer / Admin)
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [packagePrice, setPackagePrice] = useState("Rp 29.900.000");
  const [posterPrice, setPosterPrice] = useState(25000);
  const [category, setCategory] = useState("INSTAGRAM_FEED");
  const [bgTheme, setBgTheme] = useState<"emerald" | "black" | "navy" | "purple">("emerald");
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);

  // Lightbox Receipt Image
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketplace/orders");
      const data = await res.json();
      if (res.ok) {
        setOrders(data.purchases || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(posterId: number) {
    setProcessingId(posterId);
    try {
      const res = await fetch("/api/admin/marketplace/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posterId }),
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch (e) {
      alert("Gagal memproses persetujuan");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(posterId: number) {
    setProcessingId(posterId);
    try {
      const res = await fetch("/api/admin/marketplace/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posterId }),
      });
      if (res.ok) {
        await fetchOrders();
      }
    } catch (e) {
      alert("Gagal memproses penolakan");
    } finally {
      setProcessingId(null);
    }
  }

  async function handlePublishSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPublishLoading(true);
    setPublishMsg(null);

    const themeColors = {
      emerald: { bgStart: "#022c22", bgEnd: "#064e3b" },
      black: { bgStart: "#09090b", bgEnd: "#1c1917" },
      navy: { bgStart: "#0f172a", bgEnd: "#1e293b" },
      purple: { bgStart: "#1e1b4b", bgEnd: "#31104b" },
    };

    const colors = themeColors[bgTheme];

    try {
      const res = await fetch("/api/admin/marketplace/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim(),
          packagePrice: packagePrice.trim(),
          posterPrice: Number(posterPrice),
          category,
          bgStart: colors.bgStart,
          bgEnd: colors.bgEnd,
        }),
      });

      const data = await res.json();
      setPublishLoading(false);

      if (res.ok) {
        setPublishMsg(
          isArabic
            ? "تم نشر قالب البوستر بنجاح في متجر المسوقين! 🎉"
            : "Desain poster berhasil diterbitkan ke marketplace! 🎉"
        );
        setTitle("");
        setSubtitle("");
        setTimeout(() => setPublishMsg(null), 3000);
      } else {
        setPublishMsg(data.error || "Gagal menerbitkan poster.");
      }
    } catch (e) {
      setPublishLoading(false);
      setPublishMsg("Terjadi gangguan jaringan.");
    }
  }

  const pendingCount = orders.filter((o) => o.paymentStatus === "PENDING_APPROVAL").length;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-sm inline-flex items-center gap-1.5"
      >
        <span>🎨</span>
        <span>
          {isArabic
            ? `إدارة ونشر البوستات (${pendingCount} معلق)`
            : `Manajemen Desain & Lisensi (${pendingCount} Pending)`}
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 transition-all"
          dir={isArabic ? "rtl" : "ltr"}
        >
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-start">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full">
                  ADMIN / DESIGNER WORKSPACE
                </span>
                <h2 className="text-xl font-black mt-2">
                  {isArabic ? "إدارة سوق البوستات واعتماد إيصالات الدفع" : "Manajemen Desain & Persetujuan Bukti Transfer"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isArabic
                    ? "أنت المخول الوحيد بنشر قوالب جديدة وتأكيد مبيعات البوستات المدفوعة بالتحويل البنكي."
                    : "Anda adalah desainer resmi yang berhak menerbitkan desain dan memverifikasi pembayaran transfer mitra."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition border border-slate-700"
              >
                <span>{isArabic ? "العودة / إغلاق" : "Kembali / Tutup"}</span>
                <span>✕</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 py-3 border-b border-slate-100 flex gap-2 bg-slate-50">
              <button
                onClick={() => setActiveTab("orders")}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                  activeTab === "orders"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                📥 {isArabic ? "طلبات وإيصالات الشراء" : "Permintaan Pembelian & Bukti Transfer"} ({orders.length})
                {pendingCount > 0 && (
                  <span className="ms-2 px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-black">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("publish")}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                  activeTab === "publish"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                ➕ {isArabic ? "نشر وتصميم بوستر جديد" : "Terbitkan Desain Poster Baru"}
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              {activeTab === "orders" ? (
                loading ? (
                  <div className="py-20 text-center text-slate-400 text-xs">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 text-xs">
                    {isArabic ? "لا توجد طلبات شراء مسجلة حتى الآن." : "Belum ada transaksi pembelian poster."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-start text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3">{isArabic ? "المسوّق" : "Mitra"}</th>
                          <th className="px-4 py-3">{isArabic ? "التصميم" : "Desain"}</th>
                          <th className="px-4 py-3">{isArabic ? "طريقة الدفع" : "Metode"}</th>
                          <th className="px-4 py-3">{isArabic ? "المبلغ" : "Nominal"}</th>
                          <th className="px-4 py-3">{isArabic ? "الإيصال" : "Bukti Struk"}</th>
                          <th className="px-4 py-3">{isArabic ? "الحالة والقرار" : "Status & Aksi"}</th>
                          <th className="px-4 py-3">{isArabic ? "التاريخ" : "Tanggal"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-slate-900">{o.marketer.username}</div>
                              <div className="text-[10px] text-slate-400 font-mono" dir="ltr">
                                WA: {o.marketer.whatsapp || "-"}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 font-medium text-slate-800 max-w-xs">
                              {o.template.title}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  o.paymentMethod === "FREE_STARTER"
                                    ? "bg-amber-100 text-amber-900"
                                    : o.paymentMethod === "COMMISSION_BALANCE"
                                    ? "bg-blue-100 text-blue-900"
                                    : "bg-purple-100 text-purple-900"
                                }`}
                              >
                                {o.paymentMethod === "FREE_STARTER"
                                  ? (isArabic ? "بداية مجاني" : "Gratis Awal")
                                  : o.paymentMethod === "COMMISSION_BALANCE"
                                  ? (isArabic ? "خصم رصيد" : "Potong Saldo")
                                  : (isArabic ? "تحويل بنكي" : "Transfer Bank")}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-bold font-mono text-emerald-700">
                              Rp {o.pricePaid.toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-3.5">
                              {o.receiptImageUrl ? (
                                <button
                                  onClick={() => setViewReceiptUrl(o.receiptImageUrl)}
                                  className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg transition"
                                >
                                  👁️ {isArabic ? "معاينة الإيصال" : "Lihat Bukti"}
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              {o.paymentStatus === "PENDING_APPROVAL" ? (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => handleApprove(o.id)}
                                    disabled={processingId === o.id}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-2.5 py-1 rounded-lg text-[11px] transition shadow-xs disabled:opacity-50"
                                  >
                                    ✓ {isArabic ? "اعتماد" : "Setujui"}
                                  </button>
                                  <button
                                    onClick={() => handleReject(o.id)}
                                    disabled={processingId === o.id}
                                    className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-2.5 py-1 rounded-lg text-[11px] transition disabled:opacity-50"
                                  >
                                    ✕ {isArabic ? "رفض" : "Tolak"}
                                  </button>
                                </div>
                              ) : (
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    o.paymentStatus === "APPROVED"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {o.paymentStatus === "APPROVED"
                                    ? (isArabic ? "معتمد ومرخص ✅" : "Disetujui ✅")
                                    : (isArabic ? "مرفوض ❌" : "Ditolak ❌")}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                              {new Date(o.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "id-ID")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                /* Publish New Template Form */
                <form onSubmit={handlePublishSubmit} className="max-w-xl mx-auto space-y-4 py-2">
                  <div className="border-b pb-3 mb-2">
                    <h3 className="text-sm font-black text-slate-900">
                      {isArabic ? "نشر وتصميم قالب بوستر عمرة جديد" : "Formulir Penerbitan Desain Poster Baru"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isArabic
                        ? "سيقوم النظام تلقائياً بإنشاء النسخة المحمية بالعلامة المائية مع حجز مكان ختم بيانات المسوقين."
                        : "Sistem otomatis membuatkan versi preview ber-watermark dan menyiapkan slot otomatis untuk data mitra."}
                    </p>
                  </div>

                  {publishMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
                      {publishMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isArabic ? "عنوان البوستر الرئيسي (مثل: باقة عمرة شوال 1448هـ)" : "Judul Utama Poster:"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UMRAH AWAL TAHUN 1448 H"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isArabic ? "العنوان الفرعي أو ميزة الباقة:" : "Sub-judul / Keunggulan Paket:"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9 Hari Nyaman Bintang 4 Dekat Masjidil Haram"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isArabic ? "سعر برنامج العمرة في البوستر:" : "Harga Paket Umrah di Poster:"}
                      </label>
                      <input
                        type="text"
                        placeholder="Rp 29.500.000"
                        value={packagePrice}
                        onChange={(e) => setPackagePrice(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isArabic ? "سعر شراء التصميم للمسوقين (روبية):" : "Harga Jual Desain (IDR):"}
                      </label>
                      <input
                        type="number"
                        step={5000}
                        min={0}
                        value={posterPrice}
                        onChange={(e) => setPosterPrice(Number(e.target.value))}
                        className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isArabic ? "فئة وتنسيق المقاس:" : "Kategori / Format Ukuran:"}
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                      >
                        <option value="INSTAGRAM_FEED">Instagram Feed (1:1 Square)</option>
                        <option value="INSTAGRAM_STORY">Instagram Story / WA Status (9:16)</option>
                        <option value="BANNER">Website Banner (16:9)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isArabic ? "السمة اللونية للتصميم:" : "Tema Warna Poster:"}
                      </label>
                      <select
                        value={bgTheme}
                        onChange={(e) => setBgTheme(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                      >
                        <option value="emerald">Zamrud Hijau (Islamic Emerald)</option>
                        <option value="black">Hitam Emas Kerajaan (Luxury Black Gold)</option>
                        <option value="navy">Biru Malam Elegan (Midnight Navy)</option>
                        <option value="purple">Ungu Berkah Ramadhan (Royal Purple)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={publishLoading}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg transition disabled:opacity-50 mt-4"
                  >
                    {publishLoading
                      ? (isArabic ? "جاري إنشاء ونشر التصميم..." : "Sedang Menerbitkan...")
                      : (isArabic ? "نشر التصميم في المتجر فوراً 🚀" : "Terbitkan ke Marketplace Sekarang 🚀")}
                  </button>
                </form>
              )}
            </div>

            {/* Modal Bottom Footer with Back Button */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 shadow-2xs"
              >
                <span>←</span>
                <span>{isArabic ? "العودة للوحة الإدارة" : "Kembali ke Panel"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Image Lightbox Modal */}
      {viewReceiptUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-[90] flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setViewReceiptUrl(null)}
        >
          <div
            className="max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
            dir={isArabic ? "rtl" : "ltr"}
          >
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-xs font-bold text-slate-900">
                {isArabic ? "صورة إيصال التحويل البنكي للمسوق" : "Bukti Struk Transfer Bank"}
              </span>
              <button
                onClick={() => setViewReceiptUrl(null)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                <span>{isArabic ? "العودة / إغلاق" : "Kembali / Tutup"}</span>
                <span>✕</span>
              </button>
            </div>
            <div className="bg-slate-100 p-2 rounded-xl flex items-center justify-center max-h-[70vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={viewReceiptUrl} alt="Receipt" className="max-h-[65vh] object-contain rounded-lg" />
            </div>
            <div className="pt-2 flex justify-end border-t border-slate-100">
              <button
                onClick={() => setViewReceiptUrl(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5"
              >
                <span>←</span>
                <span>{isArabic ? "العودة" : "Kembali"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
