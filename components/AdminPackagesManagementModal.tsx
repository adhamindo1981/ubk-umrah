"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export interface UmrahPackageData {
  id: number;
  title: string;
  titleAr?: string | null;
  year: number;
  month: string;
  programDays: number;
  downPayment: number;
  airline: string;
  makkahHotel: string;
  madinahHotel: string;
  freebies: string; // JSON
  inclusions: string; // JSON
  priceQuad: number;
  priceTriple: number;
  priceDouble: number;
  scholarLeader?: string | null;
  notes?: string | null;
  customFields?: string | null; // JSON
  badge?: string | null;
  badgeAr?: string | null;
  posterUrl?: string | null;
  isPopular: boolean;
  isActive: boolean;
  createdAt?: string;
}

export function AdminPackagesManagementModal() {
  const { t, isArabic } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [packages, setPackages] = useState<UmrahPackageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPkg, setEditingPkg] = useState<UmrahPackageData | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    titleAr: "",
    year: 2026,
    month: "Desember",
    programDays: 9,
    downPayment: 5000000,
    airline: "Qatar Airways",
    makkahHotel: "",
    madinahHotel: "",
    priceQuad: 31500000,
    priceTriple: 32500000,
    priceDouble: 34900000,
    scholarLeader: "",
    notes: "",
    badge: "",
    badgeAr: "",
    posterUrl: "",
    isPopular: false,
    isActive: true,
  });

  const [freebiesList, setFreebiesList] = useState<string[]>([]);
  const [newFreebieInput, setNewFreebieInput] = useState("");

  const [inclusionsList, setInclusionsList] = useState<string[]>([]);
  const [newInclusionInput, setNewInclusionInput] = useState("");

  const [customFieldsList, setCustomFieldsList] = useState<Array<{ label: string; value: string }>>([]);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");

  async function fetchPackages() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packages");
      const data = await res.json();
      if (res.ok && data.packages) {
        setPackages(data.packages);
      }
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  function startCreate() {
    setIsCreating(true);
    setEditingPkg(null);
    setFormData({
      title: "",
      titleAr: "",
      year: 2026,
      month: "Desember",
      programDays: 9,
      downPayment: 5000000,
      airline: "Qatar Airways",
      makkahHotel: "",
      madinahHotel: "",
      priceQuad: 31500000,
      priceTriple: 32500000,
      priceDouble: 34900000,
      scholarLeader: "",
      notes: "Harga & jadwal sewaktu-waktu dapat berubah mengikuti kebijakan pemerintah atau maskapai.",
      badge: "Paling Diminati",
      badgeAr: "الأكثر طلباً",
      posterUrl: "",
      isPopular: false,
      isActive: true,
    });
    setFreebiesList([
      "Welcome Drink Air Zam-Zam",
      "Paket ALBAIK Chicken",
      "Full Ziarah Makkah & Madinah"
    ]);
    setInclusionsList([
      "Full Bimbingan & Manasik Sesuai Sunnah",
      "Handling Bandara, Tiket Pesawat PP",
      "Visa Umrah + Siskopatuh",
      "Tour Leader & Muthowwif",
      "Hotel Dekat & Makan 3x Sehari",
      "Air Zam-Zam 5 Liter & Asuransi Perjalanan"
    ]);
    setCustomFieldsList([]);
  }

  function startEdit(pkg: UmrahPackageData) {
    setIsCreating(false);
    setEditingPkg(pkg);
    setFormData({
      title: pkg.title,
      titleAr: pkg.titleAr || "",
      year: pkg.year,
      month: pkg.month,
      programDays: pkg.programDays,
      downPayment: pkg.downPayment,
      airline: pkg.airline,
      makkahHotel: pkg.makkahHotel,
      madinahHotel: pkg.madinahHotel,
      priceQuad: pkg.priceQuad,
      priceTriple: pkg.priceTriple,
      priceDouble: pkg.priceDouble,
      scholarLeader: pkg.scholarLeader || "",
      notes: pkg.notes || "",
      badge: pkg.badge || "",
      badgeAr: pkg.badgeAr || "",
      posterUrl: pkg.posterUrl || "",
      isPopular: pkg.isPopular,
      isActive: pkg.isActive,
    });

    try {
      setFreebiesList(JSON.parse(pkg.freebies || "[]"));
    } catch {
      setFreebiesList([]);
    }

    try {
      setInclusionsList(JSON.parse(pkg.inclusions || "[]"));
    } catch {
      setInclusionsList([]);
    }

    try {
      setCustomFieldsList(JSON.parse(pkg.customFields || "[]"));
    } catch {
      setCustomFieldsList([]);
    }
  }

  function handlePosterUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert(isArabic ? "حجم الصورة كبير جداً، الحد الأقصى 8 ميجابايت" : "Ukuran file terlalu besar (maksimal 8MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData((prev) => ({ ...prev, posterUrl: result }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      freebies: JSON.stringify(freebiesList),
      inclusions: JSON.stringify(inclusionsList),
      customFields: JSON.stringify(customFieldsList),
    };

    try {
      const url = "/api/admin/packages";
      const method = editingPkg ? "PUT" : "POST";
      const body = editingPkg ? { id: editingPkg.id, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsCreating(false);
        setEditingPkg(null);
        fetchPackages();
      } else {
        alert(isArabic ? "فشل حفظ بيانات الباقة" : "Gagal menyimpan data paket");
      }
    } catch (err) {
      alert(isArabic ? "خطأ في الاتصال" : "Kesalahan koneksi");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(isArabic ? "هل أنت متأكد من حذف هذه الباقة نهائياً؟" : "Hapus paket umrah ini secara permanen?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/packages?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchPackages();
      } else {
        alert(isArabic ? "فشل حذف الباقة" : "Gagal menghapus paket");
      }
    } catch {
      alert(isArabic ? "خطأ في الاتصال" : "Kesalahan koneksi");
    }
  }

  async function toggleStatus(pkg: UmrahPackageData) {
    try {
      await fetch("/api/admin/packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pkg.id, isActive: !pkg.isActive }),
      });
      fetchPackages();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition shadow-sm inline-flex items-center gap-1.5"
      >
        <span>🕋</span>
        <span>{isArabic ? "إدارة باقات وبرامج العمرة" : "Kelola Paket Umrah"}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm overflow-y-auto"
          onClick={() => {
            if (!isCreating && !editingPkg) setIsOpen(false);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-start"
            onClick={(e) => e.stopPropagation()}
            dir={isArabic ? "rtl" : "ltr"}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🕋</span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-amber-400">
                    {isArabic ? "لوحة التحكم بباقات وبرامج العمرة (UBK)" : "Manajemen Paket Program Umrah UBK"}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {isArabic
                      ? "إضافة وحذف وتعديل الباقات ومطابقة تفاصيلها مع بروشورات وبوستات عمر بن الخطاب للعمرة (UBK)."
                      : "Tambah, ubah, dan kelola rincian program umrah dinamis sesuai brosur resmi."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isCreating && !editingPkg && (
                  <button
                    onClick={startCreate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition inline-flex items-center gap-1"
                  >
                    <span>➕</span>
                    <span>{isArabic ? "إضافة باقة جديدة" : "Tambah Paket Baru"}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingPkg(null);
                    setIsOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition border border-slate-700"
                >
                  <span>{isArabic ? "العودة / إغلاق" : "Kembali / Tutup"}</span>
                  <span>✕</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50 space-y-6 text-slate-900">
              {/* Form View (Create / Edit) */}
              {(isCreating || editingPkg) ? (
                <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-slate-900">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <span>{editingPkg ? "✏️" : "➕"}</span>
                      <span>
                        {editingPkg
                          ? (isArabic ? `تعديل باقة: ${editingPkg.title}` : `Edit Paket: ${editingPkg.title}`)
                          : (isArabic ? "إدخال بيانات باقة عمرة جديدة" : "Formulir Tambah Paket Umrah Baru")}
                      </span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingPkg(null);
                      }}
                      className="text-xs text-slate-700 hover:text-slate-900 font-bold bg-slate-200 hover:bg-slate-300 border border-slate-300 px-3.5 py-2 rounded-xl transition inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>{isArabic ? "← إلغاء والعودة للقائمة" : "← Batal & Kembali"}</span>
                    </button>
                  </div>

                  {/* 1. Basic Info & Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isArabic ? "اسم / عنوان الباقة (بالإندونيسية أو الإنجليزية) *" : "Nama / Judul Paket Program *"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: UMRAH TAYSIR PROGRAM 9 HARI"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold placeholder-slate-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isArabic ? "اسم الباقة (باللغة العربية)" : "Judul Paket (Bahasa Arab)"}
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: برنامج عمرة التيسير 9 أيام"
                        value={formData.titleAr}
                        onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isArabic ? "السنة (Year) *" : "Tahun *"}
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isArabic ? "الشهر (Periode Bulan) *" : "Periode Bulan *"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Desember / Syawal"
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isArabic ? "عدد أيام البرنامج *" : "Durasi Hari Program *"}
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.programDays}
                        onChange={(e) => setFormData({ ...formData, programDays: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isArabic ? "قيمة الدفعة المقدمة (DP IDR) *" : "Uang Muka / DP (IDR) *"}
                      </label>
                      <input
                        type="number"
                        step={500000}
                        required
                        value={formData.downPayment}
                        onChange={(e) => setFormData({ ...formData, downPayment: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono font-black text-emerald-950"
                      />
                    </div>
                  </div>

                  {/* 2. Airline & Hotels */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isArabic ? "الخطوط الجوية الناقلة *" : "Maskapai Penerbangan (Flight by) *"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Qatar Airways / Saudia / Garuda"
                        value={formData.airline}
                        onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isArabic ? "مكان الإقامة بمكة المكرمة *" : "Akomodasi Hotel Makkah *"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Jada Ajyad / Kayan Raya ⭐⭐⭐ (4 Malam)"
                        value={formData.makkahHotel}
                        onChange={(e) => setFormData({ ...formData, makkahHotel: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isArabic ? "مكان الإقامة بالمدينة المنورة *" : "Akomodasi Hotel Madinah *"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Andalus Salam / Nada Salam ⭐⭐⭐ (3 Malam)"
                        value={formData.madinahHotel}
                        onChange={(e) => setFormData({ ...formData, madinahHotel: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold placeholder-slate-400"
                      />
                    </div>
                  </div>

                  {/* 3. Program Prices (Quad, Triple, Double) */}
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-3">
                    <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <span>🏷️</span>
                      <span>{isArabic ? "أسعار البرنامج حسب نوع الغرفة (Room Rates in IDR):" : "Harga Program Berdasarkan Tipe Kamar (IDR):"}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-xl border border-amber-200">
                        <label className="block text-[11px] font-bold text-slate-800 mb-1">
                          {isArabic ? "الغرفة الرباعية / الجماعية (QUAD) *" : "QUAD (Kamar Ber-4) *"}
                        </label>
                        <input
                          type="number"
                          step={100000}
                          required
                          value={formData.priceQuad}
                          onChange={(e) => setFormData({ ...formData, priceQuad: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-sm font-mono font-black text-emerald-950 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-amber-200">
                        <label className="block text-[11px] font-bold text-slate-800 mb-1">
                          {isArabic ? "الغرفة الثلاثية (TRIPLE) *" : "TRIPLE (Kamar Ber-3) *"}
                        </label>
                        <input
                          type="number"
                          step={100000}
                          required
                          value={formData.priceTriple}
                          onChange={(e) => setFormData({ ...formData, priceTriple: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-sm font-mono font-black text-emerald-950 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-amber-200">
                        <label className="block text-[11px] font-bold text-slate-800 mb-1">
                          {isArabic ? "الغرفة الثنائية (DOUBLE) *" : "DOUBLE (Kamar Ber-2) *"}
                        </label>
                        <input
                          type="number"
                          step={100000}
                          required
                          value={formData.priceDouble}
                          onChange={(e) => setFormData({ ...formData, priceDouble: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-sm font-mono font-black text-emerald-950 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Freebies (المميزات المجانية) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      {isArabic
                        ? "🎁 المميزات المجانية والضيافة (FREE / Bonus Fasilitas)"
                        : "🎁 Fasilitas Gratis & Bonus (FREE Items)"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: Welcome Drink Zam-Zam / Paket ALBAIK / Ziarah Makkah"
                        value={newFreebieInput}
                        onChange={(e) => setNewFreebieInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-white text-slate-900 font-medium placeholder-slate-400 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newFreebieInput.trim()) {
                            setFreebiesList([...freebiesList, newFreebieInput.trim()]);
                            setNewFreebieInput("");
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                      >
                        + {isArabic ? "إضافة ميزة" : "Tambah"}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {freebiesList.map((item, idx) => (
                        <span key={idx} className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                          <span>✓ {item}</span>
                          <button
                            type="button"
                            onClick={() => setFreebiesList(freebiesList.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 5. Inclusions (محتويات الباقة المشمولة بالسعر) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      {isArabic
                        ? "📋 قائمة محتويات الباقة المشمولة بالسعر (Paket Sudah Termasuk)"
                        : "📋 Paket Sudah Termasuk (Inclusions)"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Contoh: Tiket Pesawat PP / Visa Umrah / Muthowwif / Koper"
                        value={newInclusionInput}
                        onChange={(e) => setNewInclusionInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-white text-slate-900 font-medium placeholder-slate-400 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newInclusionInput.trim()) {
                            setInclusionsList([...inclusionsList, newInclusionInput.trim()]);
                            setNewInclusionInput("");
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                      >
                        + {isArabic ? "إضافة بند" : "Tambah"}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {inclusionsList.map((item, idx) => (
                        <span key={idx} className="bg-blue-50 border border-blue-200 text-blue-900 text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                          <span>• {item}</span>
                          <button
                            type="button"
                            onClick={() => setInclusionsList(inclusionsList.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 6. Scholar Leader (المشايخ والمرافقين) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {isArabic
                        ? "البرنامج إذا كان برفقة شيخ أو أستاذ (Bersama Sheikh / Ustadz Pembimbing)"
                        : "Pembimbing / Tokoh Agama (Bersama Sheikh / Ustadz)"}
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Sheikh Dr. Hassan Bugis & Istri Ummi Nurlaila"
                      value={formData.scholarLeader}
                      onChange={(e) => setFormData({ ...formData, scholarLeader: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold placeholder-slate-400"
                    />
                  </div>

                  {/* 7. Notes & Exchange Rate */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      {isArabic ? "ملاحظات وشروط الصرف (Catatan & Ketentuan Kurs)" : "Catatan / Note (Kebijakan & Kurs)"}
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Contoh: Note: Harga/jadwal sewaktu-waktu dapat berubah mengikuti kebijakan pemerintah atau maskapai. Kurs maksimal 18000 USD."
                      className="w-full px-3.5 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium placeholder-slate-400"
                    />
                  </div>

                  {/* 8. Dynamic Custom Fields (إمكانية إضافة أي معلومات إضافية) */}
                  <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      {isArabic ? "➕ إضافة حقول ومعلومات مخصصة إضافية (Custom Fields)" : "➕ Tambah Info Kustom Tambahan (Custom Fields)"}
                    </label>
                    <p className="text-[11px] text-slate-500">
                      {isArabic
                        ? "يمكنك إضافة أي معلومة خاصة لم يتم ذكرها أعلاه (مثل: رقم تصريح PPIU، عنوان الفرع، شروط خاصة، إلخ)."
                        : "Tambahkan info kustom lain yang diperlukan (contoh: No. PPIU, Alamat Cabang, dll)."}
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nama Label (contoh: No. Izin PPIU)"
                        value={newFieldLabel}
                        onChange={(e) => setNewFieldLabel(e.target.value)}
                        className="w-1/3 px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="Nilai / Isi (contoh: U-271 Tahun 2021)"
                        value={newFieldValue}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newFieldLabel.trim() && newFieldValue.trim()) {
                            setCustomFieldsList([...customFieldsList, { label: newFieldLabel.trim(), value: newFieldValue.trim() }]);
                            setNewFieldLabel("");
                            setNewFieldValue("");
                          }
                        }}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl"
                      >
                        + {isArabic ? "إضافة" : "Tambah"}
                      </button>
                    </div>

                    {customFieldsList.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        {customFieldsList.map((f, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                            <div>
                              <strong className="text-slate-800">{f.label}:</strong> <span className="text-slate-600">{f.value}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCustomFieldsList(customFieldsList.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-rose-700 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 9. Badges & Visibility Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isArabic ? "شارة تسويقية (Badge ID)" : "Badge Tag (ID)"}
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Paling Diminati / VIP"
                        value={formData.badge}
                        onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl font-bold placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {isArabic ? "شارة تسويقية (بالعربية)" : "Badge Tag (Arab)"}
                      </label>
                      <input
                        type="text"
                        placeholder="الأكثر طلباً / فاخرة"
                        value={formData.badgeAr}
                        onChange={(e) => setFormData({ ...formData, badgeAr: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl font-bold placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="isPopularCheck"
                        checked={formData.isPopular}
                        onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <label htmlFor="isPopularCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                        ⭐ {isArabic ? "تمييز كباقة رئيسية" : "Tandai Populer"}
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="isActiveCheck"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <label htmlFor="isActiveCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                        👁️ {isArabic ? "ظهور في الموقع (نشط)" : "Tampilkan di Web"}
                      </label>
                    </div>
                  </div>

                  {/* 10. Poster / Flyer Upload & Preview (رفع وإضافة بوست / بروشور الباقة) */}
                  <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 p-5 rounded-2xl border border-amber-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="block text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-2">
                          <span>🖼️</span>
                          <span>{isArabic ? "بوست / بروشور الباقة الرسمي (Poster / Flyer)" : "Poster / Brosur Resmi Program"}</span>
                        </label>
                        <p className="text-[11px] text-slate-600">
                          {isArabic
                            ? "ارفع تصميم أو بوست الباقة (PNG أو JPG أو WebP). سيظهر للعميل بعلامة مائية وحماية مشددة ضد لقطات الشاشة."
                            : "Unggah poster atau flyer resmi paket. Ditampilkan dengan watermark dan proteksi anti-screenshot."}
                        </p>
                      </div>

                      {formData.posterUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, posterUrl: "" })}
                          className="text-xs text-rose-600 hover:text-rose-800 font-bold bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl transition"
                        >
                          ✕ {isArabic ? "حذف البوست" : "Hapus Poster"}
                        </button>
                      )}
                    </div>

                    {formData.posterUrl ? (
                      /* Live Preview of the uploaded poster */
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="w-24 h-32 bg-slate-900 rounded-xl overflow-hidden border border-slate-300 shrink-0 relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formData.posterUrl}
                            alt="Preview Poster"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-2 flex-1 text-start">
                          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold">
                            <span>✓</span>
                            <span>{isArabic ? "تم إرفاق البوست بنجاح" : "Poster Berhasil Terpasang"}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {isArabic
                              ? "سيتم عرض هذا البوست في واجهة الموقع مع العلامة المائية وحماية الشاشة."
                              : "Poster ini akan tampil di web lengkap dengan watermark dan pengamanan anti-tangkapan layar."}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 transition inline-flex items-center gap-1">
                              <span>🔄</span>
                              <span>{isArabic ? "تغيير الصورة" : "Ganti Gambar"}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePosterUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Upload Input Area */
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-amber-400/60 hover:border-amber-500 bg-white/80 p-6 rounded-2xl text-center space-y-2 cursor-pointer transition relative group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePosterUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          />
                          <div className="text-3xl group-hover:scale-110 transition-transform">
                            📥
                          </div>
                          <div className="text-xs font-bold text-slate-800">
                            {isArabic
                              ? "انقر هنا لاختيار أو رفع صورة البوست (PNG, JPG, WebP)"
                              : "Klik untuk memilih atau mengunggah poster (PNG, JPG, WebP)"}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {isArabic
                              ? "الحد الأقصى المسموح 8 ميجابايت • يفضل المقاس الرأسي أو المربع (1:1 أو 4:5)"
                              : "Maksimal 8MB • Disarankan rasio vertikal atau kotak (1:1 / 4:5)"}
                          </div>
                        </div>

                        {/* Optional direct URL input */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 shrink-0 font-medium">
                            {isArabic ? "أو أدخل رابط الصورة:" : "Atau masukkan URL gambar:"}
                          </span>
                          <input
                            type="url"
                            placeholder="https://... /images/poster.jpg"
                            value={formData.posterUrl}
                            onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit / Cancel Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      {saving
                        ? (isArabic ? "جاري الحفظ..." : "Sedang Menyimpan...")
                        : (isArabic ? "💾 حفظ واعتماد الباقة" : "💾 Simpan & Terbitkan Paket")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingPkg(null);
                      }}
                      className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5"
                    >
                      <span>←</span>
                      <span>{isArabic ? "إلغاء والعودة" : "Batal & Kembali"}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Packages List View */
                <div className="space-y-4">
                  {loading ? (
                    <div className="p-12 text-center text-slate-400 text-xs">
                      {isArabic ? "جاري تحميل الباقات..." : "Memuat daftar paket..."}
                    </div>
                  ) : packages.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                      {isArabic ? "لا توجد باقات حالياً. اضغط 'إضافة باقة جديدة'." : "Belum ada paket umrah. Klik tombol tambah paket."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {packages.map((pkg) => {
                        let parsedFreebies: string[] = [];
                        try {
                          parsedFreebies = JSON.parse(pkg.freebies || "[]");
                        } catch {}

                        return (
                          <div
                            key={pkg.id}
                            className={`p-5 rounded-2xl border transition shadow-sm bg-white flex flex-col justify-between ${
                              pkg.isPopular ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200"
                            } ${!pkg.isActive ? "opacity-60 bg-slate-100/50" : ""}`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                                    {isArabic ? (pkg.badgeAr || pkg.badge || "باقة عمرة") : (pkg.badge || "Paket Umrah")}
                                  </span>
                                  {pkg.isPopular && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                                      ⭐ Populer
                                    </span>
                                  )}
                                </div>

                                <button
                                  onClick={() => toggleStatus(pkg)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                                    pkg.isActive
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                      : "bg-slate-200 text-slate-600 border-slate-300"
                                  }`}
                                >
                                  {pkg.isActive ? (isArabic ? "نشط ✓" : "Aktif ✓") : (isArabic ? "مخفي ✕" : "Nonaktif ✕")}
                                </button>
                              </div>

                              <div>
                                <h4 className="font-black text-slate-900 text-sm">
                                  {isArabic && pkg.titleAr ? pkg.titleAr : pkg.title}
                                </h4>
                                <div className="text-[11px] text-slate-500 font-medium">
                                  🗓️ {pkg.programDays} Hari • Periode: {pkg.month} {pkg.year}
                                </div>
                              </div>

                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-500">✈️ Maskapai:</span>
                                  <span className="font-bold text-slate-800">{pkg.airline}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-500">💵 Uang Muka (DP):</span>
                                  <span className="font-bold text-amber-700 font-mono">
                                    Rp {pkg.downPayment.toLocaleString("id-ID")}
                                  </span>
                                </div>
                              </div>

                              {/* Rates summary */}
                              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                                <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                                  <div className="text-emerald-900 font-bold">QUAD (Ber-4)</div>
                                  <div className="font-black font-mono text-emerald-700">Rp {pkg.priceQuad.toLocaleString("id-ID")}</div>
                                </div>
                                <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                                  <div className="text-emerald-900 font-bold">TPL (Ber-3)</div>
                                  <div className="font-black font-mono text-emerald-700">Rp {pkg.priceTriple.toLocaleString("id-ID")}</div>
                                </div>
                                <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                                  <div className="text-emerald-900 font-bold">DBL (Ber-2)</div>
                                  <div className="font-black font-mono text-emerald-700">Rp {pkg.priceDouble.toLocaleString("id-ID")}</div>
                                </div>
                              </div>

                              {/* Freebies badges */}
                              {parsedFreebies.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {parsedFreebies.slice(0, 3).map((f, i) => (
                                    <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                                      🎁 {f}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Poster status & Quick Upload button */}
                              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                                <div className="flex items-center gap-2">
                                  {pkg.posterUrl ? (
                                    <>
                                      <div className="w-7 h-9 rounded-md overflow-hidden bg-slate-800 shrink-0 border border-slate-300">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={pkg.posterUrl} alt="Poster" className="w-full h-full object-cover" />
                                      </div>
                                      <span className="text-[11px] font-bold text-emerald-800">
                                        {isArabic ? "🖼️ بوست مخصص مرفق" : "🖼️ Poster Kustom Terpasang"}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-[11px] text-slate-500 italic">
                                      {isArabic ? "🖼️ قالب البوست الافتراضي" : "🖼️ Menggunakan Poster Default"}
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => startEdit(pkg)}
                                  className="text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition"
                                >
                                  {pkg.posterUrl ? (isArabic ? "تغيير البوست 🖼️" : "Ganti Poster 🖼️") : (isArabic ? "+ رفع بوست 🖼️" : "+ Upload Poster 🖼️")}
                                </button>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 mt-3 border-t border-slate-100">
                              <button
                                onClick={() => startEdit(pkg)}
                                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition text-center"
                              >
                                {isArabic ? "✏️ تعديل" : "✏️ Ubah Data"}
                              </button>
                              <button
                                onClick={() => handleDelete(pkg.id)}
                                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition"
                              >
                                {isArabic ? "🗑️ حذف" : "🗑️ Hapus"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Bottom Footer with Back Button */}
            <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsCreating(false);
                  setEditingPkg(null);
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 shadow-2xs"
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
