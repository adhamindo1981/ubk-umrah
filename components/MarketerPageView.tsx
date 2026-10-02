"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MarketerBookingForm } from "@/app/m/[code]/MarketerBookingForm";
import { UmrahPackagesSection } from "@/components/UmrahPackagesSection";
import { IslamicPattern } from "@/components/IslamicPattern";
import { UbkLogo } from "@/components/UbkLogo";
import { HeroBackgroundSlider } from "@/components/HeroBackgroundSlider";
import { AnimatedHeroLogo } from "@/components/AnimatedHeroLogo";
import { PilgrimMarqueeGallery } from "@/components/PilgrimMarqueeGallery";
import { OfficialAccreditationSection } from "@/components/OfficialAccreditationSection";
import { SocialMediaIcons } from "@/components/SocialMediaIcons";
import { ProtectedPosterModal } from "@/components/ProtectedPosterModal";
import Link from "next/link";

interface FeaturedPoster {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  licenseKey: string;
}

interface MarketerPageViewProps {
  marketer: {
    username: string;
    referralCode: string;
    whatsapp: string | null;
    featuredPosters?: FeaturedPoster[];
  };
}

export function MarketerPageView({ marketer }: MarketerPageViewProps) {
  const { t, isArabic } = useLanguage();
  const [activeZoomPoster, setActiveZoomPoster] = useState<FeaturedPoster | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Format WhatsApp Link for Consultant
  const rawPhone = marketer.whatsapp || "6281234567890";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const waNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.substring(1) : cleanPhone;
  const waText = encodeURIComponent(
    `Assalamu'alaikum Bapak/Ibu ${marketer.username}, saya ingin konsultasi mengenai program dan paket perjalanan ibadah Umrah melalui halaman resmi Anda.\n\n----------------------------------------\n\nالسلام عليكم أ/ ${marketer.username}، أود الاستفسار عن باقات وبرامج رحلات العمرة لدى UBK من خلال صفحتك المعتمدة.`
  );
  const waLink = `https://wa.me/${waNumber}?text=${waText}`;

  // Pre-filled WhatsApp message for joining as a Sub-Marketer under this marketer's team
  const joinSubMarketerWaText = encodeURIComponent(
    isArabic
      ? `السلام عليكم ورحمة الله وبركاته أ/ ${marketer.username}، اطلعت على صفحتك التسويقية لدى UBK للعمرة وأرغب في الانضمام ضمن فريقك كمسوّق فرعي تحت إشرافك (كود الإحالة: ${marketer.referralCode}). يرجى تزويدي برابط ورقم الدعوة للتسجيل.`
      : `Assalamu'alaikum Bapak/Ibu ${marketer.username}, saya tertarik dan ingin bergabung menjadi bagian dari tim pemasaran Anda sebagai Sub-Marketer UBK Umrah (Kode Referal: ${marketer.referralCode}). Mohon dikirimkan tautan undangannya. Terima kasih.`
  );
  const joinSubMarketerWaLink = `https://wa.me/${waNumber}?text=${joinSubMarketerWaText}`;

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 font-sans transition-all selection:bg-amber-400 selection:text-slate-950"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Isolated Luxury Header (No links to main website to preserve marketer attribution) */}
      <header className="border-b border-amber-500/20 bg-slate-950/95 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 select-none cursor-default shrink-0">
            <UbkLogo size="sm" variant="dark" showSubtitle={false} animated={true} />
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-400/30">
              <span>🛡️</span>
              <span>{t("officialPartner")}:</span>
              <strong className="text-white">{marketer.username}</strong>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 text-sm shrink-0">
            <LanguageSwitcher />

            {/* Marketer Dashboard Login Entrance */}
            <Link
              href="/auth/signin"
              className="text-xs font-bold text-amber-300/90 hover:text-amber-200 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 px-3.5 py-2 rounded-xl transition inline-flex items-center gap-1.5 shadow-sm shrink-0"
              title={isArabic ? "دخول المسوق إلى لوحة التحكم" : "Masuk ke Dasbor Mitra"}
            >
              <span>🔐</span>
              <span>{isArabic ? "دخول المسوق" : "Masuk Mitra"}</span>
            </Link>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/50 transition-all duration-300 transform active:scale-95 inline-flex items-center gap-1.5 shrink-0"
            >
              <span>💬</span>
              <span>{t("consultantWa")}</span>
            </a>
          </div>

          {/* Mobile Hamburger Button (3 Bars) */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 flex flex-col items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
              aria-label="Toggle Mobile Menu"
            >
              <span className={`w-5 h-0.5 bg-amber-400 rounded-full transition-transform duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`w-5 h-0.5 bg-amber-400 rounded-full transition-opacity duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`w-5 h-0.5 bg-amber-400 rounded-full transition-transform duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-amber-500/20 bg-slate-950/98 backdrop-blur-xl px-4 py-5 space-y-3.5 animate-fadeIn shadow-2xl">
            {/* Marketer Attribution Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>🛡️</span>
                <span>{marketer.username}</span>
                <span className="text-slate-400 font-mono text-[10px]">({marketer.referralCode})</span>
              </span>
              <LanguageSwitcher />
            </div>

            {/* Direct WhatsApp Consultation */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/50 transition active:scale-95"
            >
              <span>💬</span>
              <span>{t("consultantWa")}</span>
            </a>

            {/* Direct Booking Scroll */}
            <a
              href="#form-booking"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 font-black text-xs hover:bg-slate-850 transition"
            >
              <span>🕋</span>
              <span>{t("ctaRegister")}</span>
            </a>

            {/* Join Sub-Marketer Team WhatsApp */}
            <a
              href={joinSubMarketerWaLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-amber-400/40 text-amber-300 font-bold text-xs hover:bg-slate-850 transition"
            >
              <span>🤝</span>
              <span>{t("ctaJoinSubMarketer")}</span>
            </a>

            {/* Marketer Portal Login Button */}
            <Link
              href="/auth/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-slate-850 transition"
            >
              <span>🔐</span>
              <span>{isArabic ? "دخول المسوق إلى حسابه" : "Login ke Dasbor Mitra"}</span>
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section: Majestic 10-Second Transitioning Background + Animated UBK Emblem + Marketer VIP Card */}
      <section className="relative min-h-[85dvh] sm:min-h-[90vh] flex flex-col justify-center items-center pt-16 sm:pt-24 pb-14 sm:pb-20 px-4 sm:px-6 text-center overflow-hidden">
        {/* Dynamic 10-Second Transitioning Landmarks & Composite Panorama Background */}
        <HeroBackgroundSlider intervalSeconds={10} />

        {/* Central Content Box */}
        <div className="max-w-4xl mx-auto relative z-10 space-y-6 pt-2">
          {/* Animated UBK Emblem with Rotating Islamic Star Halo */}
          <AnimatedHeroLogo className="mb-2" />

          {/* Top Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-black text-amber-300 bg-slate-950/60 rounded-full border border-amber-400/30 shadow-lg backdrop-blur-md uppercase tracking-wider">
            <span>✨</span>
            <span>{isArabic ? "بوابة الحجز المعتمدة لضيوف الرحمن" : "PORTAL RESMI PENDAFTARAN JAMAAH"}</span>
            <span>✨</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.2] tracking-tight drop-shadow-2xl">
            {t("heroTitle")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-300 drop-shadow-lg">
              UBK Umrah
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-200 leading-relaxed max-w-2xl mx-auto font-normal drop-shadow-md bg-slate-950/40 p-3.5 rounded-2xl backdrop-blur-xs border border-white/5">
            {t("heroSubtitle")}
          </p>

          {/* Marketer Executive VIP Consultant Card */}
          <div className="bg-slate-950/85 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-amber-500/40 shadow-2xl max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-5 text-start relative overflow-hidden group hover:border-amber-400/60 transition-all duration-300">
            {/* Corner Arabesque Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-4 relative z-10 w-full sm:w-auto">
              {/* Consultant Avatar Badge */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 border-2 border-amber-300/40 shrink-0">
                {marketer.username.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                  <span>⭐</span>
                  <span>{t("yourConsultant")}</span>
                </div>
                <div className="text-base sm:text-lg font-black text-white tracking-tight">
                  {marketer.username}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300 font-bold">
                    <span>🏷️ {t("partnerCode")}:</span>
                    <span className="tracking-wider">{marketer.referralCode}</span>
                  </div>
                  <Link
                    href="/auth/signin"
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 transition py-0.5 px-1.5 rounded hover:bg-slate-900"
                    title={isArabic ? "تسجيل الدخول للوحة التحكم الخاصة بك" : "Masuk ke dasbor Anda"}
                  >
                    <span>🔐</span>
                    <span className="underline decoration-slate-600 hover:decoration-amber-300">
                      {isArabic ? "دخول المسوق" : "Login Mitra"}
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-amber-200 text-xs font-bold px-4 py-3 rounded-2xl transition border border-amber-500/40 shrink-0 text-center flex items-center justify-center gap-2 shadow-md"
            >
              <span>💬</span>
              <span>{t("contactWa")}</span>
            </a>
          </div>

          {/* Quick CTA to Form & Join Team */}
          <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href="#form-booking"
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 px-8 py-4 rounded-2xl font-black text-sm shadow-2xl shadow-emerald-500/20 transition-all duration-300 transform active:scale-95 relative overflow-hidden before:absolute before:inset-0 before:bg-white/30 before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 font-black">
                <span>{t("ctaRegister")}</span>
                <span>🕋</span>
              </span>
            </a>

            <a
              href={joinSubMarketerWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-slate-900/90 hover:bg-slate-900 border-2 border-amber-400/50 hover:border-amber-400 text-amber-300 hover:text-amber-200 px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t("ctaJoinSubMarketer")}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Dynamic Pilgrim Showcase: Live Moving Ribbon / Infinite Marquee Gallery */}
      <PilgrimMarqueeGallery />

      {/* Official Partnership, Asma Tour Accreditation & 5 Pasti Umrah Guarantee */}
      <OfficialAccreditationSection />

      {/* Featured Branded Posters Gallery (If marketer has featured posters) */}
      {marketer.featuredPosters && marketer.featuredPosters.length > 0 && (
        <section className="relative py-16 px-6 bg-slate-900 border-t border-amber-500/20 overflow-hidden">
          <IslamicPattern opacity={0.05} color="#fbbf24" scale={64} />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-10 space-y-2">
              <span className="inline-block text-[10px] font-black text-amber-400 tracking-wider uppercase bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/30">
                {isArabic ? "بروشورات وتصاميم معتمدة" : "BROSUR & POSTER RESMI"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {isArabic ? "ملصقات وبروشورات برامج العمرة" : "Katalog Brosur Program Umrah"}
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {isArabic
                  ? `بروشورات رسمية مرخصة ومعتمدة لمستشارك (${marketer.username})`
                  : `Brosur promosi resmi terlisensi milik konsultan Anda (${marketer.username})`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {marketer.featuredPosters.map((poster) => (
                <div
                  key={poster.id}
                  className="bg-slate-950 rounded-2xl border border-amber-500/20 hover:border-amber-400/60 overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 cursor-pointer group flex flex-col"
                  onClick={() => setActiveZoomPoster(poster)}
                >
                  <div className="relative overflow-hidden aspect-square bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={poster.imageUrl}
                      alt={poster.title}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <span className="bg-amber-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-lg">
                        🔍 {isArabic ? "تكبير واستعراض" : "Perbesar Gambar"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-1 bg-slate-950/80 border-t border-slate-800">
                    <h3 className="text-xs font-bold text-white truncate">{poster.title}</h3>
                    <div className="text-[10px] text-amber-400 font-mono font-semibold">
                      Lisensi: {poster.licenseKey}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Umrah Packages Section with Islamic Mihrab Arches & Arabesque Cards */}
      <UmrahPackagesSection onSelectPackage={setSelectedPackage} />

      {/* Booking Form Section */}
      <section id="form-booking" className="relative py-16 sm:py-24 px-4 sm:px-6 bg-slate-900 border-t border-amber-500/20 overflow-hidden">
        {/* Islamic Subtle Watermark */}
        <IslamicPattern opacity={0.08} color="#d97706" scale={64} />

        <div className="max-w-xl mx-auto bg-slate-950/90 backdrop-blur-md p-5 sm:p-10 rounded-3xl shadow-2xl border border-amber-500/30 relative z-10">
          <div className="text-center mb-6 sm:mb-8 space-y-2">
            <span className="inline-block px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/30">
              {isArabic ? `حجز مباشر عبر المستشار: ${marketer.username}` : `KONSULTASI & DAFTAR VIA ${marketer.username}`}
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white">
              {t("formTitle")}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t("formSubtitle")}
            </p>
          </div>

          <MarketerBookingForm
            referralCode={marketer.referralCode}
            marketerName={marketer.username}
            marketerWhatsapp={marketer.whatsapp}
            initialPackage={selectedPackage}
          />
        </div>
      </section>

      {/* Floating WhatsApp Button for Consultant */}
      <div className={`fixed bottom-safe ${isArabic ? "left-4 sm:left-6" : "right-4 sm:right-6"} z-40`}>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl shadow-emerald-700/50 transition-all duration-300 transform hover:scale-105 active:scale-95 border border-emerald-400/40"
        >
          <span className="text-lg sm:text-xl animate-bounce">💬</span>
          <span className="tracking-wide font-black">
            {isArabic ? `تواصل مع أ/ ${marketer.username}` : `Chat ${marketer.username}`}
          </span>
        </a>
      </div>

      {/* Isolated Luxury Footer with Dual Agency Branding, Accreditations & Consultant Direct Contact */}
      <footer className="relative py-12 sm:py-16 bg-slate-950 text-slate-400 text-xs border-t border-slate-900 overflow-hidden">
        {/* Subtle Gold Pattern */}
        <IslamicPattern opacity={0.06} color="#f59e0b" scale={88} />

        <div className="max-w-7xl mx-auto px-6 space-y-10 relative z-10">
          {/* Top Row: Dual Agency Branding & Accreditation Badges */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-slate-900">
            {/* Dual Logos: UBK + Asma Tour */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
              <UbkLogo size="md" variant="dark" animated={true} />
              
              <div className="h-10 w-[1px] bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-3 bg-white/95 p-2.5 rounded-2xl shadow-md max-w-[210px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/asma-tour-logo.png"
                  alt="Asma Tour - PT. Sembilan Sembilan Wisata"
                  className="h-9 w-auto object-contain"
                />
              </div>
            </div>

            {/* Official Agency Credentials + Marketer Identification */}
            <div className="text-center md:text-end space-y-1">
              <div className="inline-block text-[11px] font-black uppercase text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                {isArabic ? "وكيل رسمي معتمد - فرع ولاية بوقور" : "Kepala Cabang Wilayah BOGOR"}
              </div>
              <div className="text-sm font-black text-white font-mono">
                Kode Agen: <span className="text-amber-300">EGWASDOB</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-mono font-bold">
                Izin Kemenag: PPUI No. U- 271 Tahun 2021
              </div>
              <div className="pt-1 flex items-center justify-center md:justify-end gap-2 text-xs text-amber-400 font-bold">
                <span>🛡️ {t("officialPartner")}:</span>
                <span className="text-white font-semibold">{marketer.username}</span>
                <span className="text-slate-500 font-mono">({marketer.referralCode})</span>
              </div>
            </div>
          </div>

          {/* Middle Row: Office Address, Marketer Personal Contact & Social Media */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-start">
            {/* Col 1: Headquarters Address */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                {isArabic ? "📍 مقر الفرع الرسمي (إندونيسيا)" : "📍 Kantor Cabang Resmi"}
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Jl. Citeko No.86, Cisarua, Bogor, Jawa Barat
              </p>
              <p className="text-[11px] text-slate-500">
                Indonesia
              </p>
            </div>

            {/* Col 2: Marketer Direct Contact (Strictly marketer's own WhatsApp!) */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                {isArabic ? "📞 التواصل المباشر مع المستشار" : "📞 Kontak Konsultan Resmi"}
              </h4>
              <div className="space-y-1 text-xs">
                <div>
                  <a
                    href="mailto:ubkumrah@gmail.com"
                    className="text-slate-300 hover:text-amber-300 transition flex items-center justify-center md:justify-start gap-2"
                  >
                    <span>✉️</span>
                    <span>ubkumrah@gmail.com</span>
                  </a>
                </div>
                <div>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-mono font-bold transition flex items-center justify-center md:justify-start gap-2"
                    title={isArabic ? "تواصل مباشرة مع المستشار عبر واتساب" : "Chat langsung dengan konsultan via WhatsApp"}
                  >
                    <span>💬</span>
                    <span>{marketer.whatsapp || (isArabic ? "واتساب المستشار المعتمد" : "Chat WhatsApp Konsultan")}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Col 3: Social Media Accounts */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                {isArabic ? "🌐 منصات التواصل الاجتماعي" : "🌐 Media Sosial Resmi"}
              </h4>
              <SocialMediaIcons className="justify-center md:justify-start" />
            </div>
          </div>

          {/* Accreditations Ribbon Logo Strip */}
          <div className="p-4 bg-white/95 rounded-2xl shadow-inner flex items-center justify-center overflow-x-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/official-accreditations.png"
              alt="Kemenag RI, IATA, 5 Pasti Umrah, SISKOPATUH, KAN, Wonderful Indonesia"
              className="max-h-11 w-auto object-contain min-w-[320px]"
            />
          </div>

          {/* Bottom Copyright & Credits Bar */}
          <div className="pt-6 border-t border-slate-900 flex flex-col items-center justify-center gap-3.5 text-center">
            {/* Centered 3-Line Copyright & Creator Credits with matching font and size */}
            <div className="flex flex-col items-center justify-center space-y-1 text-[11px] text-slate-500 font-normal">
              <div>
                © {new Date().getFullYear()} UMAR BIN AL-KHATTAB FOR UMRAH (UBK). {t("footerRights")}
              </div>
              <div className="text-slate-400">
                {t("designerCredit")}
              </div>
              <div>
                <a
                  href="mailto:adhamino1981@gmail.com"
                  className="text-slate-400 hover:text-amber-400 transition underline underline-offset-2 decoration-slate-800 hover:decoration-amber-400"
                  title={isArabic ? "إرسال بريد إلكتروني إلى المصمم" : "Kirim email ke perancang"}
                >
                  adhamino1981@gmail.com
                </a>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <Link href="/auth/signin" className="hover:text-amber-400 transition">
                {isArabic ? "بوابة دخول المسوقين" : "Portal Masuk Mitra"}
              </Link>
              <span>•</span>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition font-bold">
                {isArabic ? `واتساب ${marketer.username}` : `WhatsApp ${marketer.username}`}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Protected DRM Lightbox Modal for Gallery Posters */}
      {activeZoomPoster && (
        <ProtectedPosterModal
          poster={{
            title: activeZoomPoster.title,
            imageUrl: activeZoomPoster.imageUrl,
            licenseKey: activeZoomPoster.licenseKey,
            badge: isArabic ? "بروشور معتمد" : "POSTER RESMI",
          }}
          onClose={() => setActiveZoomPoster(null)}
          onBookNow={() => {
            setActiveZoomPoster(null);
            const formEl = document.getElementById("form-booking");
            if (formEl) {
              formEl.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />
      )}
    </div>
  );
}
