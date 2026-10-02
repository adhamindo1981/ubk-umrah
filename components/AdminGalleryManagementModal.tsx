"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { IslamicPattern } from "@/components/IslamicPattern";

export interface GalleryPhoto {
  id: number;
  title: string;
  titleAr?: string | null;
  category: string;
  categoryAr?: string | null;
  imageUrl: string;
  location?: string | null;
  year: number;
  isActive: boolean;
  createdAt: string;
}

export function AdminGalleryManagementModal() {
  const { isArabic } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [titleAr, setTitleAr] = useState("");
  const [titleId, setTitleId] = useState("");
  const [category, setCategory] = useState("MAKKAH");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedFileBase64, setSelectedFileBase64] = useState<string>("");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchPhotos() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      if (res.ok && data.photos) {
        setPhotos(data.photos);
      }
    } catch (err) {
      console.error("Failed to load gallery:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchPhotos();
    }
  }, [isOpen]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleAddPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFileBase64 && !customImageUrl) {
      alert(isArabic ? "يرجى اختيار صورة من جهازك أو وضع رابط للصورة" : "Silakan pilih foto atau masukkan URL");
      return;
    }

    setSaving(true);
    try {
      const categoryArMap: Record<string, string> = {
        MAKKAH: "مكة المكرمة",
        MADINAH: "المدينة المنورة",
        AIRPORT: "المطار والاستقبال",
        ZIARAH: "الجولات والمزارات",
      };

      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleId || titleAr || "Dokumentasi Jamaah UBK",
          titleAr: titleAr || titleId || "توثيق معتمري عمر بن الخطاب للعمرة",
          category,
          categoryAr: categoryArMap[category] || "المشاعر المقدسة",
          imageBase64: selectedFileBase64 || undefined,
          imageUrl: customImageUrl || undefined,
          location,
          year,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Reset form
        setTitleAr("");
        setTitleId("");
        setLocation("");
        setSelectedFileBase64("");
        setCustomImageUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchPhotos();
      } else {
        alert(data.error || "Gagal menyimpan foto");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat menyimpan foto");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(isArabic ? "هل أنت متأكد من حذف هذه الصورة؟" : "Yakin ingin menghapus foto ini?")) return;

    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleActive(photo: GalleryPhoto) {
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: photo.id,
          isActive: !photo.isActive,
        }),
      });
      if (res.ok) {
        setPhotos((prev) =>
          prev.map((p) => (p.id === photo.id ? { ...p, isActive: !p.isActive } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-sm inline-flex items-center gap-1.5"
      >
        <span>📸</span>
        <span>{isArabic ? "معرض صور المعتمرين" : "Galeri Jamaah"}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
            dir={isArabic ? "rtl" : "ltr"}
          >
            {/* Islamic Pattern Backdrop */}
            <IslamicPattern opacity={0.05} color="#fbbf24" scale={56} />

            {/* Modal Header */}
            <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center text-xl shadow-md">
                  📸
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {isArabic ? "إدارة معرض صور وتوثيق المعتمرين" : "Manajemen Galeri & Foto Jamaah"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isArabic
                      ? "رفع وإضافة صور المعتمرين السابقة التي تظهر في شريط الواجهة الرئيسي."
                      : "Unggah dan kelola foto dokumentasi jamaah untuk ditampilkan di beranda."}
                  </p>
                </div>
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

            {/* Modal Body with 2 Columns (Upload Form & Photos Grid) */}
            <div className="p-6 overflow-y-auto space-y-8 relative z-10 flex-1">
              {/* Form Section */}
              <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>➕</span>
                  <span>{isArabic ? "إضافة صورة جديدة للمعتمرين" : "Unggah Foto Jamaah Baru"}</span>
                </h4>

                <form onSubmit={handleAddPhoto} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* File Upload Box */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {isArabic ? "اختر صورة من جهازك:" : "Pilih File Gambar:"}
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer bg-slate-900 rounded-xl p-2 border border-slate-700"
                      />
                      {selectedFileBase64 && (
                        <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-amber-400 shadow-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={selectedFileBase64} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Or URL */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {isArabic ? "أو ضع رابط مباشر للصورة:" : "Atau Masukkan URL Gambar Langsung:"}
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-400"
                      />
                      <span className="text-[10px] text-slate-500 pt-1 block">
                        {isArabic ? "يدعم الصور بصيغة JPG أو PNG أو WEBP" : "Mendukung format JPG, PNG, atau WEBP"}
                      </span>
                    </div>
                  </div>

                  {/* Title Ar & Id */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        {isArabic ? "العنوان والتعليق بالعربية:" : "Judul (Bahasa Arab):"}
                      </label>
                      <input
                        type="text"
                        placeholder="مثلاً: طواف المعتمرين حول الكعبة المشرفة"
                        value={titleAr}
                        onChange={(e) => setTitleAr(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        {isArabic ? "العنوان بالإندونيسية:" : "Judul (Bahasa Indonesia):"}
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Jamaah UBK Tawaf di Ka'bah"
                        value={titleId}
                        onChange={(e) => setTitleId(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Category, Location, Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        {isArabic ? "التصنيف / المحطة:" : "Kategori:"}
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-amber-300 outline-none focus:border-amber-400"
                      >
                        <option value="MAKKAH">🕋 {isArabic ? "مكة المكرمة" : "Makkah"}</option>
                        <option value="MADINAH">🕌 {isArabic ? "المدينة المنورة" : "Madinah"}</option>
                        <option value="AIRPORT">✈️ {isArabic ? "المطار والاستقبال" : "Bandara / Keberangkatan"}</option>
                        <option value="ZIARAH">🚠 {isArabic ? "الجولات والمزارات (الطائف / القطار)" : "Ziarah & Wisata"}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        {isArabic ? "الموقع التفصيلي:" : "Lokasi Spesifik:"}
                      </label>
                      <input
                        type="text"
                        placeholder="مثلاً: صحن المطاف، فندق أجياد"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        {isArabic ? "السنة:" : "Tahun Keberangkatan:"}
                      </label>
                      <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value, 10))}
                        className="w-full px-4 py-2.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-700/30 transition disabled:opacity-50"
                  >
                    {saving
                      ? (isArabic ? "جاري الرفع والحفظ..." : "Menyimpan foto...")
                      : (isArabic ? "حفظ وإضافة إلى المعرض 🚀" : "Simpan & Tampilkan di Galeri 🚀")}
                  </button>
                </form>
              </div>

              {/* Photos List Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
                    {isArabic ? `الصور الحالية المعتمدة (${photos.length})` : `Daftar Foto Tersimpan (${photos.length})`}
                  </h4>
                  <button
                    onClick={fetchPhotos}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    🔄 {isArabic ? "تحديث القائمة" : "Refresh"}
                  </button>
                </div>

                {loading ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    {isArabic ? "جاري تحميل الصور..." : "Memuat data foto..."}
                  </div>
                ) : photos.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    {isArabic ? "لا توجد صور بعد. أضف صورتك الأولى أعلاه." : "Belum ada foto tersimpan."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-md flex flex-col justify-between"
                      >
                        <div className="relative h-44 w-full bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2.5 start-2.5">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900/80 text-amber-300 border border-amber-500/30 backdrop-blur-xs">
                              {photo.category} • {photo.year}
                            </span>
                          </div>
                          {!photo.isActive && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-xs font-bold text-rose-400 bg-rose-950/80 px-3 py-1 rounded-xl border border-rose-800">
                                {isArabic ? "معطّل (مخفي)" : "Nonaktif"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="text-xs font-bold text-white line-clamp-1">
                              {isArabic && photo.titleAr ? photo.titleAr : photo.title}
                            </h5>
                            {photo.location && (
                              <p className="text-[10px] text-slate-400 truncate pt-0.5">
                                📍 {photo.location}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <button
                              onClick={() => handleToggleActive(photo)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition ${
                                photo.isActive
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
                                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                              }`}
                            >
                              {photo.isActive
                                ? (isArabic ? "ظاهر بالواجهة ✓" : "Aktif ✓")
                                : (isArabic ? "مخفي ✕" : "Nonaktif ✕")}
                            </button>

                            <button
                              onClick={() => handleDelete(photo.id)}
                              className="text-[10px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 px-2 py-1 rounded-lg transition"
                            >
                              🗑️ {isArabic ? "حذف" : "Hapus"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Footer with Back Button */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex justify-end relative z-10">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 border border-slate-700 shadow-2xs"
              >
                <span>←</span>
                <span>{isArabic ? "العودة للوحة الإدارة" : "Kembali ke Panel"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
