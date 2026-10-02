"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UbkLogo } from "@/components/UbkLogo";
import { IslamicPattern } from "@/components/IslamicPattern";

export default function ExecutiveDeckPage() {
  const [activeLang, setActiveLang] = useState<"id" | "ar" | "both">("id");
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 print:bg-white print:text-slate-900">
      {/* Top Floating Control Bar (Hidden on print) */}
      <nav className="sticky top-0 z-50 bg-slate-950/95 border-b border-amber-500/30 backdrop-blur-md px-3 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xl print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/" className="hover:opacity-90 transition">
            <UbkLogo size="sm" variant="dark" showSubtitle={false} />
          </Link>
          <span className="hidden md:inline-block text-xs bg-amber-500/10 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-500/30">
            📑 Profil Eksekutif UBK • الملف التعريفي للإدارة
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Language Switcher */}
          <div className="bg-slate-900 border border-slate-700 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveLang("id")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeLang === "id" ? "bg-emerald-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇮🇩</span>
              <span>Bahasa Indonesia</span>
            </button>
            <button
              onClick={() => setActiveLang("ar")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeLang === "ar" ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇸🇦</span>
              <span>العربية</span>
            </button>
            <button
              onClick={() => setActiveLang("both")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeLang === "both" ? "bg-slate-700 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🌐</span>
              <span className="hidden sm:inline">اللغتان معاً</span>
              <span className="sm:hidden">Keduanya</span>
            </button>
          </div>

          {/* Action: Download PDF Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3.5 py-2 rounded-xl transition shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>📥</span>
              <span>{activeLang === "id" ? "Unduh PDF Resmi" : "تحميل ملف PDF"}</span>
              <span className="text-[10px]">▼</span>
            </button>

            {showDownloadMenu && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-slate-950 border-2 border-amber-500/50 rounded-2xl shadow-2xl p-2 z-50 space-y-1.5"
                onMouseLeave={() => setShowDownloadMenu(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-800">
                  {activeLang === "id" ? "Pilih Bahasa PDF:" : "اختر لغة ملف PDF للتحميل:"}
                </div>
                
                <a
                  href="/UBK-Umrah-Profil-ID.pdf"
                  download="UBK-Umrah-Profil-ID.pdf"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-emerald-950/60 border border-transparent hover:border-emerald-500/30 text-emerald-300 font-bold transition"
                  onClick={() => setShowDownloadMenu(false)}
                >
                  <span className="text-base">🇮🇩</span>
                  <div className="text-start">
                    <div className="text-white text-xs">Versi Bahasa Indonesia (Lengkap)</div>
                    <div className="text-[10px] text-emerald-400">ملف كامل باللغة الإندونيسية (A4)</div>
                  </div>
                </a>

                <a
                  href="/UBK-Umrah-Profile-AR.pdf"
                  download="UBK-Umrah-Profile-AR.pdf"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-amber-950/60 border border-transparent hover:border-amber-500/30 text-amber-300 font-bold transition"
                  onClick={() => setShowDownloadMenu(false)}
                >
                  <span className="text-base">🇸🇦</span>
                  <div className="text-start">
                    <div className="text-white text-xs">النسخة العربية الكاملة</div>
                    <div className="text-[10px] text-amber-400">Versi Lengkap Bahasa Arab (A4)</div>
                  </div>
                </a>

                <a
                  href="/UBK-Umrah-Profile-Bilingual.pdf"
                  download="UBK-Umrah-Profile-Bilingual.pdf"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 text-slate-200 font-bold transition"
                  onClick={() => setShowDownloadMenu(false)}
                >
                  <span className="text-base">🌐</span>
                  <div className="text-start">
                    <div className="text-white text-xs">النسخة المدمجة (ثنائي اللغة)</div>
                    <div className="text-[10px] text-slate-400">Versi Dwibahasa / Bilingual (A4)</div>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* Action: Print to PDF */}
          <button
            onClick={handlePrint}
            className="bg-gradient-to-r from-emerald-600 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl transition shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
            title="طباعة ما هو معروض على الشاشة حالياً"
          >
            <span>🖨️</span>
            <span>{activeLang === "id" ? "Cetak Halaman" : "طباعة الشاشة"}</span>
          </button>

          <Link
            href="/"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition shrink-0"
          >
            ← {activeLang === "id" ? "Kembali ke Web" : "العودة للموقع"}
          </Link>
        </div>
      </nav>

      {/* Main Presentation Container */}
      <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-12 print:p-0 print:space-y-8 print:max-w-none">
        
        {/* ========================================================= */}
        {/* SECTION 1: COVER PAGE */}
        {/* ========================================================= */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950/60 to-slate-950 border-2 border-amber-500/50 p-8 sm:p-14 shadow-2xl text-center space-y-8 print:border-none print:shadow-none print:rounded-none print:bg-white print:text-slate-900 print:page-break-after-always">
          <IslamicPattern opacity={0.12} color="#fbbf24" scale={64} />

          <div className="relative z-10 flex flex-col items-center space-y-6">
            <UbkLogo size="lg" variant="dark" showSubtitle={true} animated={false} />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 font-black text-xs uppercase tracking-widest print:border-slate-300 print:text-amber-800">
              <span>🕋</span>
              <span>
                {activeLang === "id"
                  ? "DOKUMEN PROFIL EKSEKUTIF RESMI"
                  : activeLang === "ar"
                  ? "الملف التعريفي والتنفيذي الرسمي"
                  : "الملف التعريفي الرسمي • DOKUMEN PROFIL EKSEKUTIF"}
              </span>
              <span>🕋</span>
            </div>

            <div className="space-y-4 max-w-3xl">
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight print:text-slate-950">
                {activeLang === "id"
                  ? "PT. UMAR BIN AL-KHATTAB FOR UMRAH (UBK)"
                  : "منظومة عمر بن الخطاب للعمرة (UBK)"}
              </h1>
              <p className="text-lg sm:text-2xl font-bold text-amber-400 font-serif print:text-emerald-900">
                {activeLang === "ar"
                  ? "المنصة الرقمية المتكاملة لإدارة رحلات العمرة والتسويق بالعمولة"
                  : "Platform Digital Terpadu Manajemen Program Umrah & Kemitraan Afiliasi"}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto print:text-slate-700">
                {activeLang === "id"
                  ? "Transformasi Digital Tepercaya untuk Perjalanan Ibadah Umrah dan Tata Kelola Jaringan Pemasaran Afiliasi Mandiri Terbesar di Republik Indonesia."
                  : activeLang === "ar"
                  ? "التحول الرقمي الموثوق لرحلات العمرة وإدارة شبكات التسويق بالعمولة في جمهورية إندونيسيا (أكبر سوق إسلامي للعمرة في العالم)."
                  : "التحول الرقمي الموثوق لرحلات العمرة وإدارة شبكات التسويق بالعمولة في جمهورية إندونيسيا • Transformasi Digital Umrah & Afiliasi di Indonesia"}
                <br />
                <span className="text-slate-400 font-mono text-xs print:text-slate-600 block mt-2">
                  Transparansi Finansial • Legalitas Resmi Kemenag PPIU • Kebebasan Kerja Mandiri
                </span>
              </p>
            </div>

            {/* Official Credentials Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl pt-4 text-xs">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">
                  {activeLang === "id" ? "Izin Resmi Kemenag" : "الترخيص الرسمي"}
                </span>
                <strong className="text-emerald-400 print:text-emerald-800">PPIU No. U-271/2021</strong>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">
                  {activeLang === "id" ? "Kantor Wilayah" : "المقر الإقليمي"}
                </span>
                <strong className="text-slate-200 print:text-slate-900">Bogor, Jawa Barat</strong>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">
                  {activeLang === "id" ? "Landasan Kemitraan" : "طبيعة الشراكة"}
                </span>
                <strong className="text-amber-400 print:text-amber-800">KUHPerdata 1320</strong>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">
                  {activeLang === "id" ? "Tahun Rilis" : "تاريخ الإصدار"}
                </span>
                <strong className="text-slate-200 print:text-slate-900">
                  {activeLang === "id" ? "Oktober 2026" : "أكتوبر 2026"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: EXECUTIVE SUMMARY & VISION */}
        {/* ========================================================= */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl print:border-slate-200 print:bg-white print:text-slate-900 print:page-break-after-always">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <span className="text-2xl p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              🎯
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white print:text-slate-950">
                {activeLang === "id"
                  ? "Ringkasan Eksekutif & Visi Transformasi Digital"
                  : activeLang === "ar"
                  ? "الملخص التنفيذي والرؤية الاستراتيجية"
                  : "الملخص التنفيذي والرؤية • Ringkasan Eksekutif & Visi"}
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                {activeLang === "id"
                  ? "Latar Belakang, Visi Korporasi, dan Nilai Strategis Platform UBK"
                  : "رؤية التحول الرقمي وأهداف المنصة في ربط الحرمين بالسوق الإندونيسي"}
              </p>
            </div>
          </div>

          <div className={`grid ${activeLang === "both" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} gap-6 leading-relaxed text-xs sm:text-sm`}>
            {/* Indonesian Content */}
            {(activeLang === "both" || activeLang === "id") && (
              <div className="space-y-4 text-start bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 print:bg-slate-50 print:border-slate-200" dir="ltr">
                <h3 className="font-black text-emerald-400 text-base flex items-center gap-2 print:text-emerald-900">
                  <span>🇮🇩</span>
                  <span>Visi & Tujuan Strategis Platform UBK</span>
                </h3>
                <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                  Platform <strong>Umar Bin Alkhattab for Umrah (UBK)</strong> hadir sebagai ekosistem digital terintegrasi yang menghubungkan jamaah umrah Indonesia langsung dengan penyelenggara resmi di Tanah Suci Makkah dan Madinah.
                </p>
                <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                  Menggabungkan kepatuhan legalitas Kemenag (5 Pasti Umrah), perlindungan dana jamaah, dan pemberdayaan ekonomi umat melalui program <strong>Kemitraan Mandiri Tanpa Modal</strong> yang fleksibel dari mana saja dan kapan saja.
                </p>
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs print:bg-emerald-50 print:text-emerald-950">
                  <strong>Tujuan Utama Manajemen:</strong> Menggantikan operasional manual yang rentan menjadi sistem terotomasi penuh berbasis cloud, transparan, dan akuntabel.
                </div>
              </div>
            )}

            {/* Arabic Content */}
            {(activeLang === "both" || activeLang === "ar") && (
              <div className="space-y-4 text-start bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 print:bg-slate-50 print:border-slate-200" dir="rtl">
                <h3 className="font-black text-amber-400 text-base flex items-center gap-2 print:text-amber-800">
                  <span>🇸🇦</span>
                  <span>رؤية المنصة وغاياتها الكبرى</span>
                </h3>
                <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                  تأسست منصة <strong>عمر بن الخطاب للعمرة (UBK)</strong> لتكون الجسر الرقمي الأول المعتمد لربط الحرمين الشريفين بالسوق الإندونيسي (أكبر دولة إسلامية في العالم من حيث أعداد المعتمرين).
                </p>
                <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                  تجمع المنصة بين <strong>الامتثال الشرعي والنظامي الصارم</strong>، وتوفير تجربة رقمية استثنائية للمعتمر، وبناء أضخم <strong>شبكة تسويق لا مركزية بالعمولة</strong> تتيح للآلاف من أبناء المجتمع الإندونيسي تحقيق دخل كريم ومجزٍ دون الحاجة لرأس مال أو التزام بأوقات دوام رسمي.
                </p>
                <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-300 text-xs print:bg-amber-50 print:text-amber-950">
                  <strong>الهدف الرئيسي:</strong> تحويل عملية التسويق والحجز من النمط اليدوي العشوائي والمعرض للمخاطر إلى نظام سحابي مؤتمت وآمن بنسبة 100%.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: PROBLEMS & SOLUTIONS */}
        {/* ========================================================= */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl print:border-slate-200 print:bg-white print:text-slate-900 print:page-break-after-always">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <span className="text-2xl p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              ⚡
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white print:text-slate-950">
                {activeLang === "id"
                  ? "Tantangan Nyata di Pasar Umrah & Solusi Teknologi UBK"
                  : activeLang === "ar"
                  ? "ماذا يحل الموقع من مشاكل وتحديات في السوق؟"
                  : "التحديات والحلول المبتكرة • Masalah Pasar & Solusi UBK"}
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                {activeLang === "id"
                  ? "Analisis Masalah Operasional Lapangan di Indonesia dan Solusi Terintegrasi"
                  : "معالجة جذرية لمشاكل الاحتيال، وتسريب العملاء، وحساب العمولات"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Item 1 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-black flex items-center gap-1.5 print:text-rose-700">
                  <span>❌ {activeLang === "id" ? "Masalah 1:" : "المشكلة 1:"}</span>
                  <span>
                    {activeLang === "id"
                      ? "Risiko Penipuan & Setoran ke Rekening Pribadi"
                      : "الاحتيال وجمع الأموال شخصياً"}
                  </span>
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">Anti-Fraud</span>
              </div>
              <p className="text-slate-400 print:text-slate-700 leading-relaxed">
                {activeLang === "id"
                  ? "Oknum perantara kerap mengumpulkan dana setoran jamaah ke rekening pribadi, menimbulkan bahaya penggelapan dana dan merusak reputasi travel haji/umrah."
                  : "قيام بعض الوسطاء أو المسوقين بجمع مبالغ العمرة في حساباتهم البنكية الشخصية مما يعرض المعتمرين والشركة لخطر الاحتيال أو ضياع الأموال."}
              </p>
              <div className="pt-2 border-t border-slate-800 print:border-slate-200 text-emerald-400 font-bold print:text-emerald-800">
                ✅ <strong>{activeLang === "id" ? "Solusi UBK:" : "حل UBK:"}</strong>{" "}
                {activeLang === "id"
                  ? "Larangan total uang tunai. Seluruh pembayaran wajib ditransfer langsung ke rekening giro resmi PT. UBK dengan verifikasi sistem mutasi otomatis."
                  : "حظر استلام أي أموال نقدية؛ كافة التحويلات البنكية تتم حصراً إلى الحساب الرسمي للشركة مع رفع إيصال الدفع وتوثيقه بالنظام."}
              </div>
            </div>

            {/* Item 2 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-black flex items-center gap-1.5 print:text-rose-700">
                  <span>❌ {activeLang === "id" ? "Masalah 2:" : "المشكلة 2:"}</span>
                  <span>
                    {activeLang === "id"
                      ? "Kebocoran Klien Mitra (Client Leakage)"
                      : "تسرب عملاء المسوّق (Client Leakage)"}
                  </span>
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">Affiliate Lock</span>
              </div>
              <p className="text-slate-400 print:text-slate-700 leading-relaxed">
                {activeLang === "id"
                  ? "Ketika mitra mempromosikan web umum travel, calon jamaah sering menghubungi kantor pusat secara mandiri sehingga mitra kehilangan hak komisi atas jerih payahnya."
                  : "عندما يرسل المسوق عميلاً لرابط الشركة العام، قد يتواصل العميل مع الإدارة أو مسوق آخر فيخسر المسوق عمولته ومجهوده التسويقي."}
              </p>
              <div className="pt-2 border-t border-slate-800 print:border-slate-200 text-emerald-400 font-bold print:text-emerald-800">
                ✅ <strong>{activeLang === "id" ? "Solusi UBK:" : "حل UBK:"}</strong>{" "}
                {activeLang === "id"
                  ? "Halaman terisolasi khusus (/m/[kode]) untuk setiap mitra dengan QR code dan profil personal. Seluruh tombol booking & WhatsApp mengunci rujukan ke mitra bersangkutan 100%."
                  : "صفحة تسويقية خاصة ومستقلة لكل مسوق (/m/[code]) تبرز هويته وتوجه كافة أزرار الواتساب والتسجيل إليه حصراً بنسبة 100%."}
              </div>
            </div>

            {/* Item 3 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-black flex items-center gap-1.5 print:text-rose-700">
                  <span>❌ {activeLang === "id" ? "Masalah 3:" : "المشكلة 3:"}</span>
                  <span>
                    {activeLang === "id"
                      ? "Rekap Komisi Manual & Keterlambatan Pembayaran"
                      : "فوضى العمولات وبطء صرفها"}
                  </span>
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">Smart Wallet</span>
              </div>
              <p className="text-slate-400 print:text-slate-700 leading-relaxed">
                {activeLang === "id"
                  ? "Pencatatan komisi melalui buku catatan atau Excel manual kerap memicu salah hitung, perselisihan bagi hasil, dan komplain keterlambatan pencairan yang melemahkan motivasi mitra."
                  : "تسجيل العمولات في دفاتر أو ملفات Excel يدوية يؤدي لأخطاء الحساب وتأخر سداد مستحقات المسوقين مما يضعف حماسهم."}
              </p>
              <div className="pt-2 border-t border-slate-800 print:border-slate-200 text-emerald-400 font-bold print:text-emerald-800">
                ✅ <strong>{activeLang === "id" ? "Solusi UBK:" : "حل UBK:"}</strong>{" "}
                {activeLang === "id"
                  ? "Dompet digital pintar (Smart Wallet) dengan pencatatan komisi otomatis per booking dan alur penarikan dana (Payout) cepat disertai bukti transfer bank resmi."
                  : "محفظة رقمية ذكية بالروبية الإندونيسية تسجل العمولات آلياً مع نظام طلب سحب فوري ورفع إشعار التحويل البنكي المعتمد."}
              </div>
            </div>

            {/* Item 4 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-black flex items-center gap-1.5 print:text-rose-700">
                  <span>❌ {activeLang === "id" ? "Masalah 4:" : "المشكلة 4:"}</span>
                  <span>
                    {activeLang === "id"
                      ? "Pembajakan Desain & Manipulasi Harga Brosur"
                      : "التلاعب بتصاميم وأسعار البوسترات"}
                  </span>
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">DRM & Marketplace</span>
              </div>
              <p className="text-slate-400 print:text-slate-700 leading-relaxed">
                {activeLang === "id"
                  ? "Pihak tidak bertanggung jawab mengedit materi promosi resmi perusahaan, mengganti kontak/harga, dan memperdaya jamaah sehingga merusak citra korporat."
                  : "قيام جهات غير مصرح لها بتعديل بوسترات الشركة وتغيير الأسعار أو أرقام التواصل والتغرير بالمعتمرين وتشويه سمعة المؤسسة."}
              </p>
              <div className="pt-2 border-t border-slate-800 print:border-slate-200 text-emerald-400 font-bold print:text-emerald-800">
                ✅ <strong>{activeLang === "id" ? "Solusi UBK:" : "حل UBK:"}</strong>{" "}
                {activeLang === "id"
                  ? "Sistem proteksi Anti-Screenshot DRM, tanda air dinamis terenkripsi, serta Marketplace Poster resmi yang dapat diunduh menggunakan poin keaktifan."
                  : "نظام حماية ضد تصوير الشاشة (Anti-Screenshot DRM) وعلامات مائية ديناميكية مشفرة مع متجر بوسترات مرخص بنظام النقاط."}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: PLATFORM ARCHITECTURE */}
        {/* ========================================================= */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xl print:border-slate-200 print:bg-white print:text-slate-900 print:page-break-after-always">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <span className="text-2xl p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              💻
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white print:text-slate-950">
                {activeLang === "id"
                  ? "Peta Arsitektur & Modul Fitur Unggulan Sistem UBK"
                  : activeLang === "ar"
                  ? "خارطة أقسام الموقع وآلية عمل المنصة"
                  : "خارطة أقسام الموقع • Peta Arsitektur Sistem UBK"}
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                {activeLang === "id"
                  ? "Penjelasan 5 Modul Utama Berbasis Next.js 14 & Prisma Cloud Database"
                  : "تفصيل البوابات الخمس الرئيسية للمنصة وكيف تتكامل لخدمة المعتمر والمسوق"}
              </p>
            </div>
          </div>

          <div className="space-y-6 text-xs sm:text-sm">
            {/* Part 1: Homepage */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl space-y-3 print:bg-slate-50 print:border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black text-amber-400 text-base flex items-center gap-2 print:text-amber-800">
                  <span>1️⃣</span>
                  <span>
                    {activeLang === "id"
                      ? "Portal Publik & Reservasi Jamaah (Homepage - /)"
                      : "البوابة الرئيسية الرسمية للمعتمرين (Homepage - /)"}
                  </span>
                </h3>
                <span className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-bold">
                  {activeLang === "id" ? "Pintu Utama Jamaah" : "واجهة جذب المعتمرين"}
                </span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 print:text-slate-800">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Showcase Paket Interaktif:" : "معرض الباقات التفاعلي:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Katalog visual beresolusi tinggi dengan komparasi fasilitas hotel bintang 5 di Makkah & Madinah, maskapai, dan rincian harga."
                      : "عرض الباقات كمعرض صور تفاعلي بغلاف بصري لمعالم الحرمين مع أزرار تبديل ومقارنة شبكية."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Informasi Down Payment (DP):" : "بيانات الفنادق والدفعة المقدمة:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Transparansi nominal DP untuk penguncian kuota kursi penerbangan sebelum keberangkatan."
                      : "تفاصيل فنادق 5 نجوم بمكة والمدينة، الخطوط الناقلة، والدفعة المقدمة (DP) لتأكيد المقعد."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Galeri Jamaah Bergerak (Marquee):" : "معرض المعتمرين المتحرك:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Dokumentasi sinematik jamaah terdahulu yang bergerak dinamis untuk membangun kepercayaan publik."
                      : "شريط سينمائي لصور المعتمرين السابقين يعزز الثقة والمصداقية الجماهيرية."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Formulir Booking Instan:" : "نظام الحجز الفوري المؤتمت:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Alur pendaftaran digital yang meneruskan identitas calon jamaah langsung ke saluran verifikasi."
                      : "نموذج إدخال بيانات المعتمر وتوجيه مباشر لقناة الاستشارة والمتابعة."}
                  </span>
                </li>
              </ul>
            </div>

            {/* Part 2: Marketer Recruitment Landing Page */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl space-y-3 print:bg-slate-50 print:border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black text-emerald-400 text-base flex items-center gap-2 print:text-emerald-900">
                  <span>2️⃣</span>
                  <span>
                    {activeLang === "id"
                      ? "Halaman Rekrutmen Mitra Mandiri (Recruitment Landing - /mitra)"
                      : "صفحة جذب وتجنيد المسوقين (Recruitment Landing - /mitra)"}
                  </span>
                </h3>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
                  {activeLang === "id" ? "Perekrutan Afiliasi" : "بوابة الشركاء والمسوقين"}
                </span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 print:text-slate-800">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Kebebasan Waktu & Tempat:" : "شعار حرية العمل:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Pemberdayaan kemitraan tanpa modal, tanpa target jam kantor formal, dan dapat dijalankan dari mana saja."
                      : "«دون الارتباط بأوقات عمل رسمية ومن أي مكان» (Bebas Waktu & Tempat)."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Kalkulator Potensi Profit (Live):" : "حاسبة الأرباح التفاعلية:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Slider interaktif menghitung proyeksi komisi langsung dan bonus supervisi tim dalam Rupiah secara transparan."
                      : "شريط منزلق لحساب العمولات الفورية المباشرة وعمولات الفريق بالروبية الإندونيسية."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Klausul Syarat & Ketentuan Hukum:" : "نافذة الشروط النظامية الإندونيسية:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Perjanjian kemitraan mengikat berbasis KUHPerdata Pasal 1320 & 1338 yang melindungi institusi travel."
                      : "اتفاقية ملزمة تخضع للقانون المدني الإندونيسي (KUHPerdata Pasal 1320 & 1338) لحماية المنشأة."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Integrasi WhatsApp Dwibahasa:" : "التوجيه الذكي للواتساب:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Pesan pengantar otomatis dwibahasa yang menghubungkan pendaftar langsung ke WhatsApp admin atau mitra sponsor."
                      : "تحويل الزائر لواتساب الشركة أو لواتساب المسوّق الراعي مباشرة برسالة ثنائية اللغة."}
                  </span>
                </li>
              </ul>
            </div>

            {/* Part 3: Marketer Personal Isolated Page */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl space-y-3 print:bg-slate-50 print:border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black text-amber-400 text-base flex items-center gap-2 print:text-amber-800">
                  <span>3️⃣</span>
                  <span>
                    {activeLang === "id"
                      ? "Halaman Mandiri Terisolasi Mitra (/m/[kode])"
                      : "صفحة المسوق الشخصية المستقلة (/m/[code])"}
                  </span>
                </h3>
                <span className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full font-bold">
                  {activeLang === "id" ? "Proteksi Referensi 100%" : "حماية إحالة المسوق بنسبة 100%"}
                </span>
              </div>
              <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                {activeLang === "id"
                  ? "Halaman promosi eksklusif yang memuat nama, nomor telepon, dan kode QR unik milik mitra. Tidak terdapat tautan keluar ke web umum travel, memastikan seluruh calon jamaah hanya berinteraksi dan mendaftar di bawah rujukan mitra tersebut."
                  : "صفحة حصرية تحمل هوية واسم المسوق ورمز الباركود (QR Code) ورقم هاتفه. لا تحتوي على أي روابط تنقل العميل إلى الموقع العام، مما يضمن أن كل طلب تسجيل أو استفسار يعود حصراً للمسوق."}
              </p>
            </div>

            {/* Part 4: Marketer Portal & Dashboard */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl space-y-3 print:bg-slate-50 print:border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black text-emerald-400 text-base flex items-center gap-2 print:text-emerald-900">
                  <span>4️⃣</span>
                  <span>
                    {activeLang === "id"
                      ? "Portal & Dasbor Digital Mitra (/dashboard)"
                      : "لوحة تحكم المسوّق الرقمية (/dashboard)"}
                  </span>
                </h3>
                <span className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-bold">
                  {activeLang === "id" ? "Dompet Finansial & Tim" : "محفظة مالية وإدارة الفريق"}
                </span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 print:text-slate-800">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Dompet Finansial Real-Time:" : "المحفظة المالية:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Monitoring akumulasi laba, riwayat pencairan, dan saldo aktif siap ditarik dalam Rupiah."
                      : "استعراض الأرباح الكلية، والمبالغ المسحوبة، والرصيد الفعلي المتاح للسحب بالروبية."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Fitur Penarikan Dana (Payouts):" : "طلب سحب العمولات:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Pengajuan pencairan komisi ke rekening bank nasional dengan bukti transfer resmi terlampir."
                      : "طلب تحويل الأرباح للحساب البنكي مع إمكانية تحميل إيصال التحويل المعتمد من الإدارة."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Struktur Tim Binaan (Downline):" : "شجرة المسوقين الفرعيين:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Pemantauan produktivitas sub-mitra binaan dan kalkulasi bonus supervisi manajerial otomatis."
                      : "متابعة أداء الفريق الفرعي وحساب عمولة الإشراف المكتسبة منهم."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Marketplace Brosur & Poin:" : "متجر البوسترات ونظام النقاط:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Akses pengunduhan materi desain promosi berlisensi menggunakan poin keaktifan tanpa biaya tambahan."
                      : "إمكانية شراء تصاميم وبوسترات إعلانية احترافية مباشرة من رصيد العمولات والنقاط."}
                  </span>
                </li>
              </ul>
            </div>

            {/* Part 5: Admin Control Superpanel */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl space-y-3 print:bg-slate-50 print:border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black text-amber-400 text-base flex items-center gap-2 print:text-amber-800">
                  <span>5️⃣</span>
                  <span>
                    {activeLang === "id"
                      ? "Superpanel Kontrol Manajemen Pusat (/admin)"
                      : "لوحة تحكم الإدارة العليا (Admin Superpanel - /admin)"}
                  </span>
                </h3>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
                  {activeLang === "id" ? "Audit & Kontrol Penuh" : "التحكم الشامل والتدقيق"}
                </span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 print:text-slate-800">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Pengaturan Paket Dinamis:" : "إدارة باقات العمرة ديناميكياً:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Tambah, edit tanggal, jadwal, harga, hotel, dan status tayang paket secara instan."
                      : "إضافة وتعديل الباقات والأسعار وتحديث الفنادق وتفعيل/تعطيل العرض بلحظة واحدة."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Otorisasi & Verifikasi Mitra:" : "إدارة واعتماد المسوقين:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Persetujuan akun mitra baru, penentuan peringkat, dan pengaturan skema komisi khusus."
                      : "الموافقة على طلبات الانضمام، تعديل رتب المسوقين ونسب مشاركة الفريق الفرعي."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Audit Keuangan & Validasi Payout:" : "تدقيق طلبات الصرف المالي:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Verifikasi mutasi pembayaran DP jamaah dan unggah bukti transfer pencairan komisi mitra."
                      : "اعتماد تحويل العمولات ورفع صورة الإشعار البنكي الرسمي في حساب المسوق."}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span>
                    <strong>{activeLang === "id" ? "Ekspor Data Manifest Jamaah (CSV):" : "إدارة وتصدير الحجوزات:"}</strong>{" "}
                    {activeLang === "id"
                      ? "Unduh seluruh data paspor dan kontak jamaah sekali klik untuk integrasi sistem Siskopatuh Kemenag."
                      : "تصدير كامل بيانات المعتمرين وجوازاتهم بضغطة زر بصيغة CSV إلى برامج الأوفيس والتأشيرات."}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: COMMISSION STRUCTURE & WORKFLOW */}
        {/* ========================================================= */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl print:border-slate-200 print:bg-white print:text-slate-900 print:page-break-after-always">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <span className="text-2xl p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              💰
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white print:text-slate-950">
                {activeLang === "id"
                  ? "Skema Komisi Transparan & Pembagian Pendapatan (IDR)"
                  : activeLang === "ar"
                  ? "نموذج العمولات وآلية التوزيع المالي الشفاف"
                  : "نموذج العمولات • Skema Komisi Kemitraan (IDR)"}
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                {activeLang === "id"
                  ? "Distribusi Pendapatan yang Adil, Berkelanjutan, dan Terukur dalam Mata Uang Rupiah"
                  : "توزيع مالي عادل، مستدام، ومحفز للانتشار السريع في كافة المحافظات"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
            {/* Direct Marketer Card */}
            <div className="p-6 bg-gradient-to-b from-slate-900 to-emerald-950/40 border-2 border-emerald-500/50 rounded-3xl space-y-3 print:bg-slate-50 print:border-slate-300">
              <span className="text-3xl block">👤</span>
              <h3 className="text-base font-black text-white print:text-slate-900">
                {activeLang === "id"
                  ? "Komisi Mitra Langsung (Pemasar Utama)"
                  : "عمولة المسوّق المباشر (Komisi Pemasar Langsung)"}
              </h3>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono print:text-emerald-800">
                Rp 500.000,-
              </div>
              <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                {activeLang === "id"
                  ? "Diberikan langsung per jamaah yang mendaftar dan melunasi DP melalui tautan rujukan mitra."
                  : "تُستحق فوراً عن كل معتمر يسجل ويؤكد حجزه بالدفعة المقدمة من خلال رابط المسوق المباشر."}
              </p>
              <div className="text-[11px] bg-emerald-500/20 text-emerald-300 py-1 px-3 rounded-full font-bold print:bg-emerald-100 print:text-emerald-900">
                {activeLang === "id"
                  ? "Simulasi: 20 Jamaah = Rp 10.000.000,- Bersih"
                  : "مثال: 20 معتمر = 10,000,000 روبية ربح صافي"}
              </div>
            </div>

            {/* Sub-Marketer Supervisory Bonus */}
            <div className="p-6 bg-gradient-to-b from-slate-900 to-amber-950/40 border-2 border-amber-500/50 rounded-3xl space-y-3 print:bg-slate-50 print:border-slate-300">
              <span className="text-3xl block">👥</span>
              <h3 className="text-base font-black text-white print:text-slate-900">
                {activeLang === "id"
                  ? "Bonus Supervisi & Pembinaan Tim (Downline)"
                  : "مكافأة الإشراف وتطوير الفريق (Bonus Supervisi Tim)"}
              </h3>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono print:text-amber-800">
                Rp 150.000,-
              </div>
              <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
                {activeLang === "id"
                  ? "Diberikan kepada mitra sponsor atas setiap jamaah yang didaftarkan oleh sub-mitra binaannya."
                  : "تُصرف للمسوّق الرئيسي كعائد إشرافي ومكافأة قيادة عن كل معتمر يأتي عن طريق مسوقيه الفرعيين."}
              </p>
              <div className="text-[11px] bg-amber-500/20 text-amber-300 py-1 px-3 rounded-full font-bold print:bg-amber-100 print:text-amber-900">
                {activeLang === "id"
                  ? "Passive Income Berkelanjutan dari Jaringan Tim"
                  : "حافز لبناء وتدريب شبكة تسويق عريضة تغطي مدن إندونيسيا"}
              </div>
            </div>
          </div>

          {/* Workflow Sequence */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3 print:bg-slate-50 print:border-slate-200 text-xs">
            <span className="font-black text-white block print:text-slate-900">
              🔄 {activeLang === "id"
                ? "Siklus Transaksi 4 Tahap: Dari Promosi hingga Pencairan Dana"
                : "دورة المعاملة من الزيارة حتى صرف الأرباح:"}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-slate-300 print:text-slate-800">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:bg-white print:border-slate-300">
                <span className="font-bold text-amber-400 block mb-1">
                  1. {activeLang === "id" ? "Bagikan Tautan" : "مشاركة الرابط"}
                </span>
                {activeLang === "id"
                  ? "Mitra membagikan tautan/QR code personal di media sosial."
                  : "ينشر المسوق رابطه الحصري أو كود QR عبر واتساب وشبكات التواصل."}
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:bg-white print:border-slate-300">
                <span className="font-bold text-amber-400 block mb-1">
                  2. {activeLang === "id" ? "Booking Digital" : "استشارة وحجز"}
                </span>
                {activeLang === "id"
                  ? "Calon jamaah memilih paket dan mengisi manifest pemesanan."
                  : "يدخل العميل ويختار الباقة المناسبة ويرسل استمارة الحجز."}
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:bg-white print:border-slate-300">
                <span className="font-bold text-amber-400 block mb-1">
                  3. {activeLang === "id" ? "Setoran Giro PT. UBK" : "السداد البنكي"}
                </span>
                {activeLang === "id"
                  ? "Pembayaran DP langsung ke rekening giro resmi kantor."
                  : "يسدد المعتمر الدفعة المقدمة بحساب الشركة الرسمي المعتمد."}
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:bg-white print:border-slate-300">
                <span className="font-bold text-amber-400 block mb-1">
                  4. {activeLang === "id" ? "Pencairan Komisi" : "نزول العمولة"}
                </span>
                {activeLang === "id"
                  ? "Komisi masuk otomatis ke dompet digital dan siap dicairkan."
                  : "يتحول الرصيد تلقائياً لمحفظة المسوق ويصبح متاحاً للسحب الفوري."}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 6: LEGAL COMPLIANCE & PRIVACY */}
        {/* ========================================================= */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl print:border-slate-200 print:bg-white print:text-slate-900 print:page-break-after-always">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <span className="text-2xl p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ⚖️
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white print:text-slate-950">
                {activeLang === "id"
                  ? "Kepatuhan Regulasi & Landasan Hukum Republik Indonesia"
                  : activeLang === "ar"
                  ? "المظلة النظامية والامتثال للقوانين الإندونيسية"
                  : "المظلة النظامية • Regulasi & Aspek Legalitas RI"}
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                {activeLang === "id"
                  ? "Perlindungan Hukum bagi Perusahaan dan Fleksibilitas Pemasar Mandiri"
                  : "الحصانة القانونية للمنشأة وتأمين حقوق المسوقين المستقلين"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-200">
              <span className="text-lg">📜</span>
              <h4 className="font-black text-amber-400 print:text-amber-800">
                {activeLang === "id"
                  ? "Akad Kemitraan Mandiri (KUHPerdata 1320)"
                  : "شراكة حرة مستقلة (KUHPerdata)"}
              </h4>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                {activeLang === "id"
                  ? "Hubungan kemitraan usaha bebas (partnership) berbasis Pasal 1320 & 1338 KUHPerdata, bukan karyawan tetap. Membebaskan perusahaan dari kewajiban upah minimum (UMR) dan pesangon PHK."
                  : "تخضع العلاقة للمادتين 1320 و 1338 من القانون المدني الإندونيسي (Kemitraan Mandiri)، مما يمنح المسوق حرية تامة ويحمي المنشأة من أعباء الرواتب الدائمة أو تعويضات نهاية الخدمة."}
              </p>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-200">
              <span className="text-lg">🔒</span>
              <h4 className="font-black text-emerald-400 print:text-emerald-800">
                {activeLang === "id"
                  ? "Perlindungan Data Pribadi (UU PDP No. 27/2022)"
                  : "حماية البيانات (UU PDP No. 27/2022)"}
              </h4>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                {activeLang === "id"
                  ? "Kepatuhan penuh terhadap UU Perlindungan Data Pribadi RI. Seluruh berkas paspor, KTP, dan manifes jamaah dienkripsi secara aman dan dilarang disebarluaskan."
                  : "التزام صارم بنظام حماية البيانات الشخصية الإندونيسي؛ كافة وثائق وجوازات سفر المعتمرين مشفرة ومحمية من التداول أو التسريب غير النظامي."}
              </p>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-200">
              <span className="text-lg">🕋</span>
              <h4 className="font-black text-amber-400 print:text-amber-800">
                {activeLang === "id"
                  ? "Standar Kemenag (5 Pasti Umrah)"
                  : "معايير وزارة الشؤون الدينية (5 Pasti)"}
              </h4>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                {activeLang === "id"
                  ? "Kepatuhan mutlak regulasi Kementerian Agama RI: Pasti Travel Berizin PPIU, Pasti Jadwalnya, Pasti Terbangnya, Pasti Hotelnya, dan Pasti Visanya."
                  : "التزام تام بضوابط وزارة الشؤون الدينية الإندونيسية: (تأكيد الترخيص، تأكيد الرحلة، تأكيد الفندق، تأكيد التأشيرة، وتأكيد باقة الأسعار الرسمية)."}
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 7: VALUE IMPACT & CONCLUSION */}
        {/* ========================================================= */}
        <section className="bg-gradient-to-r from-emerald-950/80 via-slate-950 to-amber-950/80 border-2 border-amber-500/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl print:bg-white print:border-slate-300 print:text-slate-900">
          <h2 className="text-2xl sm:text-3xl font-black text-white print:text-slate-950">
            {activeLang === "id"
              ? "Rekomendasi Manajemen & Kesiapan Peluncuran"
              : activeLang === "ar"
              ? "خاتمة وتوصية استراتيجية للإدارة العليا"
              : "خاتمة وتوصية للإدارة العليا • Rekomendasi Manajemen"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto print:text-slate-700">
            {activeLang === "id"
              ? "Platform UBK Umrah merupakan solusi masa depan paling aman, modern, dan terukur untuk mengakselerasi pertumbuhan bisnis umrah di Indonesia. Dengan memadukan teknologi cloud modern, tata kelola finansial terpadu, dan perlindungan legal yang kokoh, platform ini menciptakan ekosistem yang menguntungkan bagi jamaah, mitra pemasar, dan manajemen perusahaan."
              : "تمثل منصة UBK Umrah النموذج المستقبلي الأكثر أماناً وقوة لنمو أعمال العمرة في إندونيسيا. بالاعتماد على التكنولوجيا الحديثة والحوكمة المالية الذكية، تحقق المنصة التوازن المثالي بين راحة المعتمر، وأرباح الشركاء، وحصانة المؤسسة القانونية والتجارية. المنصة جاهزة للإطلاق التشغيلي الفوري."}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-300 print:text-slate-700">
            <span>📞 {activeLang === "id" ? "Kontak Manajemen:" : "تواصل الإدارة:"} +62 851-1053-9752</span>
            <span>•</span>
            <span>🌐 {activeLang === "id" ? "Situs Resmi:" : "الموقع الرسمي:"} ubk-umrah.vercel.app</span>
            <span>•</span>
            <span>📍 Bogor, Jawa Barat, Indonesia</span>
          </div>

          <div className="pt-6 print:hidden flex flex-wrap justify-center gap-3">
            <a
              href={
                activeLang === "id"
                  ? "/UBK-Umrah-Profil-ID.pdf"
                  : activeLang === "ar"
                  ? "/UBK-Umrah-Profile-AR.pdf"
                  : "/UBK-Umrah-Profile-Bilingual.pdf"
              }
              download
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-xl transition active:scale-95 inline-flex items-center gap-2"
            >
              <span>📥</span>
              <span>
                {activeLang === "id"
                  ? "Unduh Dokumen PDF Ini (Bahasa Indonesia)"
                  : activeLang === "ar"
                  ? "تحميل هذا الملف بصيغة PDF (بالعربية)"
                  : "تحميل ملف PDF (Bilingual)"}
              </span>
            </a>

            <button
              onClick={handlePrint}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-amber-500 to-amber-400 hover:opacity-95 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <span>🖨️</span>
              <span>{activeLang === "id" ? "Cetak Halaman Ini" : "طباعة العرض مباشرة"}</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 print:hidden">
        © 2026 PT. UMAR BIN AL-KHATTAB FOR UMRAH (UBK). All rights reserved.
      </footer>
    </div>
  );
}
