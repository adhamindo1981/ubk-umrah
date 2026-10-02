"use client";

import { useState, useEffect, useRef } from "react";
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

  // Publish Mode: "upload" (Designer custom artwork) or "studio" (Automated SVG)
  const [publishMode, setPublishMode] = useState<"upload" | "studio">("upload");
  const [selectedFileBase64, setSelectedFileBase64] = useState<string>("");
  const [customImageUrl, setCustomImageUrl] = useState<string>("");
  const [imageWidth, setImageWidth] = useState<number>(1080);
  const [imageHeight, setImageHeight] = useState<number>(1350);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template Form State
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert(isArabic ? "حجم الصورة كبير جداً، الحد الأقصى 15 ميجابايت" : "Ukuran foto terlalu besar, maksimal 15MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;
        if (naturalW > 0 && naturalH > 0) {
          setImageWidth(naturalW);
          setImageHeight(naturalH);
        }

        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.86);
          setSelectedFileBase64(compressedDataUrl);
        } else {
          setSelectedFileBase64(result);
        }
      };
      img.onerror = () => {
        setSelectedFileBase64(result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }

  async function handlePublishSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPublishLoading(true);
    setPublishMsg(null);

    if (publishMode === "upload" && !selectedFileBase64 && !customImageUrl) {
      alert(isArabic ? "يرجى اختيار صورة البوستر المصمم من جهازك أو وضع رابط الصورة" : "Silakan unggah file desain poster atau masukkan tautan URL");
      setPublishLoading(false);
      return;
    }

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
          imageBase64: selectedFileBase64 || undefined,
          uploadedImageUrl: customImageUrl.trim() || undefined,
          imageWidth,
          imageHeight,
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
        setSelectedFileBase64("");
        setCustomImageUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setTimeout(() => setPublishMsg(null), 3500);
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
                    ? "نشر التصاميم المصممة خارجياً ودمج باركود وبيانات المسوقين آلياً فور الشراء."
                    : "Terbitkan desain eksternal (Photoshop/Canva) dan sistem otomatis menyematkan barcode QR serta data mitra."}
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
                ➕ {isArabic ? "رفع ونشر بوستر جديد" : "Unggah & Terbitkan Desain Baru"}
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
                                {o.paymentMethod}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-bold font-mono text-slate-900">
                              Rp {o.pricePaid.toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-3.5">
                              {o.receiptImageUrl ? (
                                <button
                                  type="button"
                                  onClick={() => setViewReceiptUrl(o.receiptImageUrl)}
                                  className="text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
                                >
                                  {isArabic ? "عرض الإيصال 📄" : "Lihat Struk 📄"}
                                </button>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              {o.paymentStatus === "PENDING_APPROVAL" ? (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => handleApprove(o.id)}
                                    disabled={processingId === o.id}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                                  >
                                    {processingId === o.id ? "..." : (isArabic ? "اعتماد وترخيص ✅" : "Setujui ✅")}
                                  </button>
                                  <button
                                    onClick={() => handleReject(o.id)}
                                    disabled={processingId === o.id}
                                    className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg transition disabled:opacity-50"
                                  >
                                    {isArabic ? "رفض" : "Tolak"}
                                  </button>
                                </div>
                              ) : (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    o.paymentStatus === "APPROVED"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-red-100 text-red-800"
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
                <form onSubmit={handlePublishSubmit} className="max-w-2xl mx-auto space-y-5 py-2">
                  <div className="border-b pb-3 mb-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        {isArabic ? "رفع ونشر قالب بوستر عمرة جديد" : "Formulir Penerbitan Desain Poster Baru"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isArabic
                          ? "اختر رفع ملف مصمم في برامج خارجية (Photoshop / Canva) أو إنشاء قالب برمجي تلقائي."
                          : "Unggah materi desain eksternal atau buat otomatis melalui studio sistem."}
                      </p>
                    </div>

                    {/* Mode Selector Toggle */}
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setPublishMode("upload")}
                        className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                          publishMode === "upload"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <span>📁</span>
                        <span>{isArabic ? "رفع تصميم خارجي (فوتوشوب/كانفا)" : "Unggah Desain Eksternal"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPublishMode("studio")}
                        className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                          publishMode === "studio"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <span>🎨</span>
                        <span>{isArabic ? "استوديو تلقائي (SVG)" : "Studio SVG Otomatis"}</span>
                      </button>
                    </div>
                  </div>

                  {publishMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
                      {publishMsg}
                    </div>
                  )}

                  {/* Mode 1: External Designer File Upload */}
                  {publishMode === "upload" && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-emerald-400 space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-black text-slate-800">
                          {isArabic ? "ملف صورة البوستر المصمم (PNG / JPG / WebP):" : "File Desain Poster (PNG / JPG / WebP):"}
                        </label>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          {isArabic ? "أقصى حجم: 10MB" : "Maks 10MB"}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleFileChange}
                          className="block w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                        />
                        <span className="text-xs text-slate-400 font-bold shrink-0">{isArabic ? "أو" : "atau"}</span>
                        <input
                          type="url"
                          placeholder={isArabic ? "رابط الصورة (Google Drive / CDN)..." : "Tautan Gambar URL..."}
                          value={customImageUrl}
                          onChange={(e) => setCustomImageUrl(e.target.value)}
                          className="w-full sm:w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                        />
                      </div>

                      {/* Image Preview Thumbnail */}
                      {(selectedFileBase64 || customImageUrl) && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedFileBase64 || customImageUrl}
                            alt="Design Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-slate-300 shadow-sm"
                          />
                          <div className="text-xs space-y-1 flex-1">
                            <strong className="text-slate-900 block">{isArabic ? "تم اختيار صورة التصميم بنجاح" : "File desain siap diterbitkan"}</strong>
                            <p className="text-slate-500 text-[11px]">
                              {isArabic
                                ? "سيقوم النظام بحفظ التصميم كأصل عالي الدقة وإضافة شريط باركود المسوق ورقم واتسابه في الأسفل تلقائياً."
                                : "Sistem otomatis menyiapkan slot barcode QR dan data kontak mitra di bagian bawah."}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFileBase64("");
                              setCustomImageUrl("");
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="text-xs text-red-600 hover:text-red-700 font-bold px-2 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition"
                          >
                            {isArabic ? "إلغاء ✕" : "Hapus ✕"}
                          </button>
                        </div>
                      )}

                      {/* Architecture Explanation Banner */}
                      <div className="p-3.5 bg-emerald-950 text-slate-200 rounded-xl text-xs space-y-1.5 border border-amber-500/40">
                        <strong className="text-amber-400 flex items-center gap-1.5">
                          <span>💡</span>
                          <span>{isArabic ? "كيف يتم ختم بيانات والباركود الخاص بالمسوق؟" : "Bagaimana Barcode & Kontak Mitra Disematkan?"}</span>
                        </strong>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {isArabic
                            ? "يقوم النظام تلقائياً بدمج التصميم المرفوع، وإلحاق شريط رسمي في أسفل البوستر يحتوي على: باركود (QR Code) ذكي برابط صفحة المسوق المباشرة، واسمه المعتمد، ورقم واتسابه، وكود ترخيص الملكية الفكرية (UBK-LIC)."
                            : "Sistem otomatis melampirkan footer branding terenkripsi di bawah poster yang memuat: Barcode QR langsung ke link mitra, Nama Konsultan, WhatsApp, dan Nomor Lisensi Resmi saat mitra membeli."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Common Fields */}
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

                    {publishMode === "studio" && (
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
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={publishLoading}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl transition active:scale-95 disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {publishLoading
                      ? (isArabic ? "جاري رفع ونشر التصميم..." : "Sedang Menerbitkan...")
                      : (isArabic ? "نشر التصميم في متجر المسوقين فوراً 🚀" : "Terbitkan ke Marketplace Sekarang 🚀")}
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
