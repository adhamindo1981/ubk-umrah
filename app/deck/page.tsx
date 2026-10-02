"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UbkLogo } from "@/components/UbkLogo";
import { IslamicPattern } from "@/components/IslamicPattern";

export default function ExecutiveDeckPage() {
  const [activeLang, setActiveLang] = useState<"both" | "ar" | "id">("both");

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 print:bg-white print:text-slate-900">
      {/* Top Floating Control Bar (Hidden on print) */}
      <nav className="sticky top-0 z-50 bg-slate-950/95 border-b border-amber-500/30 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/" className="hover:opacity-90 transition">
            <UbkLogo size="sm" variant="dark" showSubtitle={false} />
          </Link>
          <span className="hidden sm:inline-block text-xs bg-amber-500/10 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-500/30">
            📑 الملف التعريفي التنفيذي • Executive Presentation Deck
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Language Filter */}
          <div className="bg-slate-900 border border-slate-700 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveLang("both")}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                activeLang === "both" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              🌐 اللغتان معاً
            </button>
            <button
              onClick={() => setActiveLang("ar")}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                activeLang === "ar" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              🇸🇦 العربية
            </button>
            <button
              onClick={() => setActiveLang("id")}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                activeLang === "id" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              🇮🇩 Indonesia
            </button>
          </div>

          {/* Action: Download Prepared PDF */}
          <a
            href="/UBK-Umrah-Profile.pdf"
            download="UBK-Umrah-Executive-Profile.pdf"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3.5 py-2 rounded-xl transition shadow-md flex items-center gap-1.5 shrink-0"
          >
            <span>📥</span>
            <span>تحميل PDF جاهز</span>
          </a>

          {/* Action: Print to PDF */}
          <button
            onClick={handlePrint}
            className="bg-gradient-to-r from-emerald-600 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl transition shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>🖨️</span>
            <span>طباعة PDF</span>
          </button>

          <Link
            href="/"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition shrink-0"
          >
            ← العودة للموقع
          </Link>
        </div>
      </nav>

      {/* Main Presentation Container (Optimized for Screen and A4 Print) */}
      <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-12 print:p-0 print:space-y-8 print:max-w-none">
        
        {/* ========================================================= */}
        {/* SECTION 1: COVER PAGE (غلاف التقرير الفاخر) */}
        {/* ========================================================= */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950/60 to-slate-950 border-2 border-amber-500/50 p-8 sm:p-14 shadow-2xl text-center space-y-8 print:border-none print:shadow-none print:rounded-none print:bg-white print:text-slate-900 print:page-break-after-always">
          <IslamicPattern opacity={0.12} color="#fbbf24" scale={64} />

          <div className="relative z-10 flex flex-col items-center space-y-6">
            <UbkLogo size="lg" variant="dark" showSubtitle={true} animated={false} />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-amber-300 font-black text-xs uppercase tracking-widest print:border-slate-300 print:text-amber-800">
              <span>🕋</span>
              <span>الملف التعريفي الرسمي • DOKUMEN PROFIL EKSEKUTIF</span>
              <span>🕋</span>
            </div>

            <div className="space-y-4 max-w-3xl">
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight print:text-slate-950">
                منظومة عمر بن الخطاب للعمرة (UBK)
              </h1>
              <p className="text-lg sm:text-2xl font-bold text-amber-400 font-serif print:text-emerald-900">
                Platform Digital Terpadu Manajemen Program Umrah & Kemitraan Afiliasi
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto print:text-slate-700">
                التحول الرقمي الموثوق لرحلات العمرة وإدارة شبكات التسويق بالعمولة في جمهورية إندونيسيا
                <br />
                <span className="text-slate-400 font-mono text-xs print:text-slate-600">
                  Transparansi Finansial • Legalitas Resmi Kemenag PPIU • Kebebasan Kerja Mandiri
                </span>
              </p>
            </div>

            {/* Official Credentials Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl pt-4 text-xs">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">الترخيص الرسمي</span>
                <strong className="text-emerald-400 print:text-emerald-800">PPIU No. U-271/2021</strong>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">المقر الإقليمي</span>
                <strong className="text-slate-200 print:text-slate-900">بوغور - إندونيسيا (Bogor)</strong>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">طبيعة الشراكة</span>
                <strong className="text-amber-400 print:text-amber-800">KUHPerdata 1320</strong>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 block font-bold">تاريخ الإصدار</span>
                <strong className="text-slate-200 print:text-slate-900">أكتوبر 2026</strong>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: EXECUTIVE SUMMARY & VISION (الملخص التنفيذي والرؤية) */}
        {/* ========================================================= */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl print:border-slate-200 print:bg-white print:text-slate-900 print:page-break-after-always">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <span className="text-2xl p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              🎯
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white print:text-slate-950">
                الملخص التنفيذي والرؤية الاستراتيجية
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Ringkasan Eksekutif, Visi Transformasi, dan Nilai Tambah
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed text-xs sm:text-sm">
            {/* Arabic Column */}
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
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs print:bg-emerald-50 print:text-emerald-950">
                  <strong>الهدف الرئيسي:</strong> تحويل عملية التسويق والحجز من النمط اليدوي العشوائي والمعرض للمخاطر إلى نظام سحابي مؤتمت وآمن بنسبة 100%.
                </div>
              </div>
            )}

            {/* Indonesian Column */}
            {(activeLang === "both" || activeLang === "id") && (
              <div className="space-y-4 text-start bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 print:bg-slate-50 print:border-slate-200" dir="ltr">
                <h3 className="font-black text-emerald-400 text-base flex items-center gap-2 print:text-emerald-900">
                  <span>🇮🇩</span>
                  <span>Visi & Tujuan Strategis Platform</span>
                </h3>
                <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                  Platform <strong>Umar Bin Alkhattab for Umrah (UBK)</strong> hadir sebagai ekosistem digital terintegrasi yang menghubungkan jamaah umrah Indonesia langsung dengan penyelenggara resmi di Tanah Suci.
                </p>
                <p className="text-slate-300 print:text-slate-800 leading-relaxed">
                  Menggabungkan kepatuhan legalitas Kemenag (5 Pasti Umrah), perlindungan dana jamaah, dan pemberdayaan ekonomi umat melalui program <strong>Kemitraan Mandiri Tanpa Modal</strong> yang fleksibel dari mana saja dan kapan saja.
                </p>
                <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-300 text-xs print:bg-amber-50 print:text-amber-950">
                  <strong>Tujuan Utama:</strong> Menggantikan operasional manual yang rentan menjadi sistem terotomasi penuh, transparan, dan terpercaya.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: PROBLEMS WE SOLVE (المشاكل التي يحلها الموقع) */}
        {/* ========================================================= */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl print:border-slate-200 print:bg-white print:text-slate-900 print:page-break-after-always">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <span className="text-2xl p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              ⚡
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white print:text-slate-950">
                ماذا يحل الموقع من مشاكل وتحديات في السوق؟
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Tantangan Nyata di Pasar Umrah Indonesia & Solusi Inovatif UBK
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Problem & Solution 1 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-black flex items-center gap-1.5 print:text-rose-700">
                  <span>❌ المشكلة 1:</span>
                  <span>الاحتيال وجمع الأموال شخصياً</span>
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">Risiko Fraud</span>
              </div>
              <p className="text-slate-400 print:text-slate-700">
                قيام بعض الوسطاء أو المسوقين بجمع مبالغ العمرة في حساباتهم البنكية الشخصية مما يعرض المعتمرين والشركة لخطر الاحتيال أو ضياع الأموال.
              </p>
              <div className="pt-2 border-t border-slate-800 print:border-slate-200 text-emerald-400 font-bold print:text-emerald-800">
                ✅ <strong>حل UBK:</strong> حظر استلام أي أموال نقدية؛ كافة التحويلات البنكية تتم حصراً إلى الحساب الرسمي للشركة مع رفع إيصال الدفع وتوثيقه بالنظام.
              </div>
            </div>

            {/* Problem & Solution 2 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-black flex items-center gap-1.5 print:text-rose-700">
                  <span>❌ المشكلة 2:</span>
                  <span>تسرب عملاء المسوّق (Client Leakage)</span>
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">Kebocoran Klien</span>
              </div>
              <p className="text-slate-400 print:text-slate-700">
                عندما يرسل المسوق عميلاً لرابط الشركة، قد يتواصل العميل مع الإدارة أو مسوق آخر فيخسر المسوق عمولته ومجهوده التسويقي.
              </p>
              <div className="pt-2 border-t border-slate-800 print:border-slate-200 text-emerald-400 font-bold print:text-emerald-800">
                ✅ <strong>حل UBK:</strong> صفحة تسويقية خاصة ومستقلة لكل مسوق (<code className="text-amber-300">/m/[code]</code>) تبرز هويته وتوجه كافة أزرار الواتساب والتسجيل إليه حصراً.
              </div>
            </div>

            {/* Problem & Solution 3 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-black flex items-center gap-1.5 print:text-rose-700">
                  <span>❌ المشكلة 3:</span>
                  <span>فوضى العمولات وبطء صرفها</span>
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">Rekap Komisi Manual</span>
              </div>
              <p className="text-slate-400 print:text-slate-700">
                تسجيل العمولات في دفاتر أو ملفات Excel يدوية يؤدي لأخطاء الحساب وتأخر سداد مستحقات المسوقين مما يضعف حماسهم.
              </p>
              <div className="pt-2 border-t border-slate-800 print:border-slate-200 text-emerald-400 font-bold print:text-emerald-800">
                ✅ <strong>حل UBK:</strong> محفظة رقمية ذكية بالروبية الإندونيسية تسجل العمولات آلياً مع نظام طلب سحب فوري ورفع إشعار التحويل البنكي.
              </div>
            </div>

            {/* Problem & Solution 4 */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-black flex items-center gap-1.5 print:text-rose-700">
                  <span>❌ المشكلة 4:</span>
                  <span>التلاعب بتصاميم وأسعار البوسترات</span>
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">Pencurian Desain</span>
              </div>
              <p className="text-slate-400 print:text-slate-700">
                قيام جهات غير مصرح لها بتعديل بوسترات الشركة وتغيير الأسعار أو أرقام التواصل والتغرير بالمعتمرين.
              </p>
              <div className="pt-2 border-t border-slate-800 print:border-slate-200 text-emerald-400 font-bold print:text-emerald-800">
                ✅ <strong>حل UBK:</strong> نظام حماية ضد تصوير الشاشة (Anti-Screenshot DRM) وعلامات مائية ديناميكية مشفرة تحمي حقوق النشر.
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: SITE ARCHITECTURE (أقسام الموقع ومميزاته بالتفصيل) */}
        {/* ========================================================= */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xl print:border-slate-200 print:bg-white print:text-slate-900 print:page-break-after-always">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <span className="text-2xl p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              💻
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white print:text-slate-950">
                خارطة أقسام الموقع وآلية عمل المنصة
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Peta Arsitektur Halaman & Fitur Unggulan Sistem UBK
              </p>
            </div>
          </div>

          <div className="space-y-6 text-xs sm:text-sm">
            {/* Part 1: Homepage */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl space-y-3 print:bg-slate-50 print:border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black text-amber-400 text-base flex items-center gap-2 print:text-amber-800">
                  <span>1️⃣</span>
                  <span>البوابة الرئيسية الرسمية للمعتمرين (Homepage - <code className="text-xs">/</code>)</span>
                </h3>
                <span className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-bold">
                  واجهة جذب المعتمرين
                </span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 print:text-slate-800">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span><strong>معرض الباقات التفاعلي (Showcase Gallery):</strong> عرض الباقات كمعرض صور تفاعلي بغلاف بصري لمعالم الحرمين مع أزرار تبديل ومقارنة شبكية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span><strong>بيانات الفنادق والرحلات:</strong> تفاصيل فنادق 5 نجوم بمكة والمدينة، الخطوط الناقلة، والدفعة المقدمة (DP) لتأكيد المقعد.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span><strong>معرض المعتمرين المتحرك (Marquee Gallery):</strong> شريط سينمائي لصور المعتمرين السابقين يعزز الثقة والمصداقية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span><strong>نظام الحجز الفوري المؤتمت:</strong> نموذج إدخال بيانات المعتمر وتوجيه مباشر لقناة الاستشارة والمتابعة.</span>
                </li>
              </ul>
            </div>

            {/* Part 2: Marketer Recruitment Landing Page */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl space-y-3 print:bg-slate-50 print:border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black text-emerald-400 text-base flex items-center gap-2 print:text-emerald-900">
                  <span>2️⃣</span>
                  <span>صفحة جذب وتجنيد المسوقين (Recruitment Landing - <code className="text-xs">/mitra</code>)</span>
                </h3>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
                  بوابة الشركاء والمسوقين
                </span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 print:text-slate-800">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span><strong>شعار حرية العمل:</strong> «دون الارتباط بأوقات عمل رسمية ومن أي مكان» (Bebas Waktu & Tempat).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span><strong>حاسبة الأرباح التفاعلية (Live Calculator):</strong> شريط منزلق لحساب العمولات الفورية المباشرة وعمولات الفريق بالروبية الإندونيسية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span><strong>نافذة الشروط النظامية الإندونيسية:</strong> اتفاقية ملزمة تخضع للقانون المدني الإندونيسي (KUHPerdata Pasal 1320 & 1338) لحماية المؤسسة.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span><strong>التوجيه الذكي للواتساب:</strong> تحويل الزائر لواتساب الشركة أو لواتساب المسوّق الراعي مباشرة برسالة ثنائية اللغة.</span>
                </li>
              </ul>
            </div>

            {/* Part 3: Marketer Personal Isolated Page */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl space-y-3 print:bg-slate-50 print:border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black text-amber-400 text-base flex items-center gap-2 print:text-amber-800">
                  <span>3️⃣</span>
                  <span>صفحة المسوق الشخصية المستقلة (<code className="text-xs">/m/[code]</code>)</span>
                </h3>
                <span className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full font-bold">
                  حماية إحالة المسوق بنسبة 100%
                </span>
              </div>
              <p className="text-slate-300 print:text-slate-800">
                صفحة حصرية تحمل هوية واسم المسوق ورمز الباركود (QR Code) ورقم هاتفه. لا تحتوي على أي روابط تنقل العميل إلى الموقع العام، مما يضمن أن كل طلب تسجيل أو استفسار يعود حصراً للمسوق.
              </p>
            </div>

            {/* Part 4: Marketer Portal & Dashboard */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl space-y-3 print:bg-slate-50 print:border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black text-emerald-400 text-base flex items-center gap-2 print:text-emerald-900">
                  <span>4️⃣</span>
                  <span>لوحة تحكم المسوّق الرقمية (Marketer Portal - <code className="text-xs">/dashboard</code>)</span>
                </h3>
                <span className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1 rounded-full font-bold">
                  محفظة مالية وإدارة الفريق
                </span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 print:text-slate-800">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span><strong>المحفظة المالية:</strong> استعراض الأرباح الكلية، والمبالغ المسحوبة، والرصيد الفعلي المتاح للسحب بالروبية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span><strong>طلب سحب العمولات (Payouts):</strong> طلب تحويل الأرباح للحساب البنكي مع إمكانية تحميل إيصال التحويل المعتمد من الإدارة.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span><strong>شجرة المسوقين الفرعيين (Downline Team):</strong> متابعة أداء الفريق الفرعي وحساب عمولة الإشراف المكتسبة منهم.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">❖</span>
                  <span><strong>متجر البوسترات (Poster Marketplace):</strong> إمكانية شراء تصاميم وبوسترات إعلانية احترافية مباشرة من رصيد العمولات.</span>
                </li>
              </ul>
            </div>

            {/* Part 5: Admin Control Superpanel */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl space-y-3 print:bg-slate-50 print:border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-black text-amber-400 text-base flex items-center gap-2 print:text-amber-800">
                  <span>5️⃣</span>
                  <span>لوحة تحكم الإدارة العليا (Admin Superpanel - <code className="text-xs">/admin</code>)</span>
                </h3>
                <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
                  التحكم الشامل والتدقيق
                </span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 print:text-slate-800">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span><strong>إدارة باقات العمرة ديناميكياً:</strong> إضافة وتعديل الباقات والأسعار وتحديث الفنادق وتفعيل/تعطيل العرض بلحظة واحدة.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span><strong>إدارة واعتماد المسوقين:</strong> الموافقة على طلبات الانضمام، تعديل رتب المسوقين ونسب مشاركة الفريق الفرعي.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span><strong>تدقيق طلبات الصرف المالي:</strong> اعتماد تحويل العمولات ورفع صورة الإشعار البنكي الرسمي في حساب المسوق.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">❖</span>
                  <span><strong>إدارة وتصدير الحجوزات:</strong> تصدير كامل بيانات المعتمرين وجوازاتهم بضغطة زر بصيغة CSV إلى برامج الأوفيس.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: MARKETING & COMMISSION STRUCTURE (آلية التسويق ونموذج العمولات) */}
        {/* ========================================================= */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl print:border-slate-200 print:bg-white print:text-slate-900 print:page-break-after-always">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <span className="text-2xl p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              💰
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white print:text-slate-950">
                نموذج العمولات وآلية التوزيع المالي الشفاف
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Skema Komisi Transparan & Pembagian Pendapatan Kemitraan (IDR)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
            {/* Direct Marketer Card */}
            <div className="p-6 bg-gradient-to-b from-slate-900 to-emerald-950/40 border-2 border-emerald-500/50 rounded-3xl space-y-3 print:bg-slate-50 print:border-slate-300">
              <span className="text-3xl block">👤</span>
              <h3 className="text-base font-black text-white print:text-slate-900">
                عمولة المسوّق المباشر (Komisi Pemasar Langsung)
              </h3>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono print:text-emerald-800">
                Rp 500.000,-
              </div>
              <p className="text-xs text-slate-300 print:text-slate-700">
                تُستحق فوراً عن كل معتمر يسجل ويؤكد حجزه بالدفعة المقدمة من خلال رابط المسوق المباشر.
              </p>
              <div className="text-[11px] bg-emerald-500/20 text-emerald-300 py-1 px-3 rounded-full font-bold print:bg-emerald-100 print:text-emerald-900">
                مثال: 20 معتمر = 10,000,000 روبية ربح صافي
              </div>
            </div>

            {/* Sub-Marketer Supervisory Bonus */}
            <div className="p-6 bg-gradient-to-b from-slate-900 to-amber-950/40 border-2 border-amber-500/50 rounded-3xl space-y-3 print:bg-slate-50 print:border-slate-300">
              <span className="text-3xl block">👥</span>
              <h3 className="text-base font-black text-white print:text-slate-900">
                مكافأة الإشراف وتطوير الفريق (Bonus Supervisi Tim)
              </h3>
              <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono print:text-amber-800">
                Rp 150.000,-
              </div>
              <p className="text-xs text-slate-300 print:text-slate-700">
                تُصرف للمسوّق الرئيسي كعائد إشرافي ومكافأة قيادة عن كل معتمر يأتي عن طريق مسوقيه الفرعيين.
              </p>
              <div className="text-[11px] bg-amber-500/20 text-amber-300 py-1 px-3 rounded-full font-bold print:bg-amber-100 print:text-amber-900">
                حافز لبناء وتدريب شبكة تسويق عريضة تغطي مدن إندونيسيا
              </div>
            </div>
          </div>

          {/* Workflow Sequence */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3 print:bg-slate-50 print:border-slate-200 text-xs">
            <span className="font-black text-white block print:text-slate-900">
              🔄 دورة المعاملة من الزيارة حتى صرف الأرباح:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-slate-300 print:text-slate-800">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:bg-white print:border-slate-300">
                <span className="font-bold text-amber-400 block mb-1">1. مشاركة الرابط</span>
                ينشر المسوق رابطه الحصري أو كود QR عبر واتساب وشبكات التواصل.
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:bg-white print:border-slate-300">
                <span className="font-bold text-amber-400 block mb-1">2. استشارة وحجز</span>
                يدخل العميل ويختار الباقة المناسبة ويرسل استمارة الحجز.
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:bg-white print:border-slate-300">
                <span className="font-bold text-amber-400 block mb-1">3. السداد البنكي</span>
                يسدد المعتمر الدفعة المقدمة بحساب الشركة الرسمي المعتمد.
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 print:bg-white print:border-slate-300">
                <span className="font-bold text-amber-400 block mb-1">4. نزول العمولة</span>
                يتحول الرصيد تلقائياً لمحفظة المسوق ويصبح متاحاً للسحب الفوري.
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 6: LEGAL COMPLIANCE & PRIVACY (الامتثال القانوني والشرعي) */}
        {/* ========================================================= */}
        <section className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl print:border-slate-200 print:bg-white print:text-slate-900 print:page-break-after-always">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <span className="text-2xl p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ⚖️
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white print:text-slate-950">
                المظلة النظامية والامتثال للقوانين الإندونيسية
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Aspek Legalitas, Perlindungan Data Pribadi (UU PDP) & Regulasi PPIU
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-200">
              <span className="text-lg">📜</span>
              <h4 className="font-black text-amber-400 print:text-amber-800">شراكة حرة مستقلة (KUHPerdata)</h4>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                تخضع العلاقة للمادتين 1320 و 1338 من القانون المدني الإندونيسي (Kemitraan Mandiri)، مما يمنح المسوق حرية تامة ويحمي المنشأة من أعباء الرواتب الدائمة أو تعويضات نهاية الخدمة.
              </p>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-200">
              <span className="text-lg">🔒</span>
              <h4 className="font-black text-emerald-400 print:text-emerald-800">حماية البيانات (UU PDP No. 27/2022)</h4>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                التزام صارم بنظام حماية البيانات الشخصية الإندونيسي؛ كافة وثائق وجوازات سفر المعتمرين مشفرة ومحمية من التداول أو التسريب غير النظامي.
              </p>
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 print:bg-slate-50 print:border-slate-200">
              <span className="text-lg">🕋</span>
              <h4 className="font-black text-amber-400 print:text-amber-800">معايير وزارة الشؤون الدينية (5 Pasti)</h4>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                التزام تام بضوابط وزارة الشؤون الدينية الإندونيسية: (تأكيد الترخيص، تأكيد الرحلة، تأكيد الفندق، تأكيد التأشيرة، وتأكيد باقة الأسعار الرسمية).
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 7: VALUE IMPACT & CONCLUSION (الأثر المتوقع والخاتمة) */}
        {/* ========================================================= */}
        <section className="bg-gradient-to-r from-emerald-950/80 via-slate-950 to-amber-950/80 border-2 border-amber-500/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl print:bg-white print:border-slate-300 print:text-slate-900">
          <h2 className="text-2xl sm:text-3xl font-black text-white print:text-slate-950">
            خاتمة وتوصية للإدارة العليا • Rekomendasi Manajemen
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto print:text-slate-700">
            تمثل منصة UBK Umrah النموذج المستقبلي الأكثر أماناً وقوة لنمو أعمال العمرة في إندونيسيا. بالاعتماد على التكنولوجيا الحديثة والحوكمة المالية الذكية، تحقق المنصة التوازن المثالي بين راحة المعتمر، وأرباح الشركاء، وحصانة المؤسسة القانونية والتجارية.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-300 print:text-slate-700">
            <span>📞 تواصل الإدارة: +62 851-1053-9752</span>
            <span>•</span>
            <span>🌐 الموقع الرسمي: ubk-umrah.vercel.app</span>
            <span>•</span>
            <span>📍 بوغور، جمهورية إندونيسيا</span>
          </div>

          <div className="pt-6 print:hidden">
            <button
              onClick={handlePrint}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <span>📄</span>
              <span>تحميل أو طباعة هذا الملف بصيغة PDF فوراً</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 print:hidden">
        © 2026 UMAR BIN AL-KHATTAB FOR UMRAH (UBK). كافة الحقوق محفوظة لمنظومة عمر بن الخطاب للعمرة.
      </footer>
    </div>
  );
}
