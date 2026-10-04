"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";

export interface SimpleMarketer {
  id: number;
  username: string;
  email: string;
  whatsapp?: string | null;
  role: string;
  createdAt: string | Date;
}

interface AdminUserManagementModalProps {
  marketers?: SimpleMarketer[];
}

export function AdminUserManagementModal({ marketers = [] }: AdminUserManagementModalProps) {
  const { isArabic } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"LIST" | "CREATE" | "PROMOTE">("LIST");

  // Create Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Existing Admins State
  const [admins, setAdmins] = useState<any[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Promote / Demote Action State
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchAdmins();
    }
  }, [isOpen]);

  async function fetchAdmins() {
    setFetchLoading(true);
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      if (res.ok && data.admins) {
        setAdmins(data.admins);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFetchLoading(false);
    }
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateMsg(null);

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          password,
        }),
      });

      const data = await res.json();
      setCreateLoading(false);

      if (res.ok && data.success) {
        setCreateMsg({
          text: isArabic
            ? `تم إنشاء حساب الأدمن (${data.admin.username}) بنجاح كامل الصلاحيات! 🎉`
            : `Akun Administrator (${data.admin.username}) berhasil dibuat! 🎉`,
          isError: false,
        });
        setUsername("");
        setEmail("");
        setWhatsapp("");
        setPassword("");
        fetchAdmins();
        router.refresh();
      } else {
        setCreateMsg({
          text: data.error || (isArabic ? "فشل إنشاء حساب الأدمن" : "Gagal membuat akun admin"),
          isError: true,
        });
      }
    } catch (err) {
      setCreateLoading(false);
      setCreateMsg({
        text: isArabic ? "حدث خطأ في الاتصال بالخادم" : "Terjadi kesalahan koneksi",
        isError: true,
      });
    }
  }

  async function handleRoleChange(userId: number, targetRole: "ADMIN" | "MARKETER", userName: string) {
    const isPromoting = targetRole === "ADMIN";
    const confirmText = isPromoting
      ? isArabic
        ? `هل أنت متأكد من ترقية (${userName}) إلى رتبة أدمن؟ سيمتلك كافة الصلاحيات الإدارية للمنصة.`
        : `Apakah Anda yakin ingin mempromosikan (${userName}) menjadi Admin? Pengguna akan memiliki akses penuh ke panel admin.`
      : isArabic
      ? `هل أنت متأكد من خفض رتبة (${userName}) إلى مسوّق فقط؟`
      : `Apakah Anda yakin ingin menurunkan peran (${userName}) menjadi Mitra Pemasar biasa?`;

    if (!confirm(confirmText)) return;

    setActionLoadingId(userId);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: targetRole }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || (isArabic ? "تم تحديث الرتبة بنجاح!" : "Peran berhasil diperbarui!"));
        fetchAdmins();
        router.refresh();
      } else {
        alert(data.error || (isArabic ? "فشل تحديث الصلاحية" : "Gagal memperbarui peran"));
      }
    } catch (err) {
      alert(isArabic ? "حدث خطأ في الاتصال" : "Terjadi kesalahan jaringan");
    } finally {
      setActionLoadingId(null);
    }
  }

  const filteredMarketers = marketers.filter(
    (m) =>
      m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl transition shadow-sm inline-flex items-center gap-1.5 shrink-0"
      >
        <span>👑</span>
        <span>{isArabic ? "إدارة مسؤولي النظام (Admins)" : "Manajemen Admin (Admins)"}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden text-start my-auto"
            onClick={(e) => e.stopPropagation()}
            dir={isArabic ? "rtl" : "ltr"}
          >
            {/* Modal Header */}
            <div className="bg-slate-950 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">👑</span>
                <div>
                  <h3 className="text-base font-black text-white">
                    {isArabic ? "إدارة مسؤولي النظام والصلاحيات (Admins)" : "Manajemen Administrator & Hak Akses"}
                  </h3>
                  <p className="text-xs text-amber-400 font-medium">
                    {isArabic
                      ? "إنشاء حسابات أدمن جديدة وترقية المسوقين المعتمدين لكامل الصلاحيات"
                      : "Buat akun admin baru dan promosikan mitra menjadi administrator resmi"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold transition"
              >
                ✕ {isArabic ? "إغلاق" : "Tutup"}
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("LIST")}
                className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  activeTab === "LIST"
                    ? "bg-slate-950 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>👥</span>
                <span>{isArabic ? "مسؤولو النظام الحاليين" : "Daftar Admin Aktif"}</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-mono">
                  {admins.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("CREATE")}
                className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  activeTab === "CREATE"
                    ? "bg-slate-950 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>➕</span>
                <span>{isArabic ? "إنشاء حساب أدمن جديد" : "Tambah Admin Baru"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("PROMOTE")}
                className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  activeTab === "PROMOTE"
                    ? "bg-slate-950 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>🚀</span>
                <span>{isArabic ? "ترقية مسوّق مسجل إلى أدمن" : "Promosikan Mitra Jadi Admin"}</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* TAB 1: CURRENT ADMINS */}
              {activeTab === "LIST" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {isArabic
                        ? "جميع الحسابات المدرجة أدناه تملك صلاحية كاملة 100% لإدارة المنصة:"
                        : "Seluruh akun berikut memiliki akses penuh untuk mengelola sistem UBK:"}
                    </span>
                    <button
                      type="button"
                      onClick={fetchAdmins}
                      className="text-emerald-700 hover:underline font-bold"
                    >
                      🔄 {isArabic ? "تحديث القائمة" : "Segarkan"}
                    </button>
                  </div>

                  {fetchLoading ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-bold">
                      {isArabic ? "جاري تحميل البيانات..." : "Memuat daftar admin..."}
                    </div>
                  ) : admins.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400">
                      {isArabic ? "لا يوجد مسؤولو نظام حالياً" : "Belum ada admin terdaftar"}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {admins.map((adm) => (
                        <div
                          key={adm.id}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
                                👑
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-900">{adm.username}</h4>
                                <div className="text-[11px] text-slate-500 font-mono">{adm.email}</div>
                                {adm.whatsapp && (
                                  <div className="text-[10px] text-emerald-700 font-mono">
                                    WA: {adm.whatsapp}
                                  </div>
                                )}
                              </div>
                            </div>

                            <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                              SUPER ADMIN
                            </span>
                          </div>

                          <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                            <span>
                              {isArabic ? "تاريخ الإنشاء: " : "Dibuat: "}
                              {new Date(adm.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "id-ID")}
                            </span>

                            {/* Demote option */}
                            <button
                              type="button"
                              disabled={actionLoadingId === adm.id}
                              onClick={() => handleRoleChange(adm.id, "MARKETER", adm.username)}
                              className="text-rose-600 hover:text-rose-800 font-bold hover:underline"
                            >
                              {actionLoadingId === adm.id
                                ? "..."
                                : isArabic
                                ? "خفض إلى مسوق"
                                : "Jadikan Mitra"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CREATE BRAND NEW ADMIN */}
              {activeTab === "CREATE" && (
                <form onSubmit={handleCreateAdmin} className="space-y-4 max-w-lg mx-auto">
                  {createMsg && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs font-bold border ${
                        createMsg.isError
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }`}
                    >
                      {createMsg.text}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isArabic ? "اسم الأدمن (Username):" : "Nama Pengguna Admin (Username):"}
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="مثال: admin_ahmed"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isArabic ? "البريد الإلكتروني (Email):" : "Alamat Email:"}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@ubkumrah.com"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isArabic ? "رقم الهاتف / واتساب (WhatsApp):" : "Nomor WhatsApp (Opsional):"}
                    </label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isArabic ? "كلمة المرور (Password):" : "Kata Sandi Akun:"}
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {isArabic ? "6 أحرف أو أرقام على الأقل" : "Minimal 6 karakter"}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      {createLoading
                        ? isArabic
                          ? "جاري إنشاء الحساب..."
                          : "Membuat Akun Admin..."
                        : isArabic
                        ? "إنشاء حساب الأدمن وتفعيله فوراً 🚀"
                        : "Buat & Aktifkan Akun Admin 🚀"}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: PROMOTE REGISTERED MARKETER TO ADMIN */}
              {activeTab === "PROMOTE" && (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={
                        isArabic
                          ? "🔍 ابحث عن مسوّق بالاسم أو البريد للترقية..."
                          : "🔍 Cari nama atau email mitra untuk dipromosikan..."
                      }
                      className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="max-h-[360px] overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-2">
                    {filteredMarketers.length === 0 ? (
                      <div className="py-10 text-center text-xs text-slate-400">
                        {isArabic ? "لم يتم العثور على مسوقين مطابقين" : "Tidak ada mitra ditemukan"}
                      </div>
                    ) : (
                      filteredMarketers.map((m) => (
                        <div
                          key={m.id}
                          className="bg-slate-50 hover:bg-slate-100/80 p-3 rounded-xl border border-slate-200 flex items-center justify-between transition"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900">{m.username}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{m.email}</div>
                            {m.whatsapp && (
                              <div className="text-[10px] text-emerald-700 font-mono">
                                WA: {m.whatsapp}
                              </div>
                            )}
                          </div>

                          <div>
                            <button
                              type="button"
                              disabled={actionLoadingId === m.id}
                              onClick={() => handleRoleChange(m.id, "ADMIN", m.username)}
                              className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-xl shadow-xs transition disabled:opacity-50"
                            >
                              <span>👑</span>
                              <span>
                                {actionLoadingId === m.id
                                  ? isArabic
                                    ? "جاري الترقية..."
                                    : "Memproses..."
                                  : isArabic
                                  ? "ترقية لأدمن"
                                  : "Jadikan Admin"}
                              </span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
