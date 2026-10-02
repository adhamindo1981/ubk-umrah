"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { GeneralBookingForm } from "@/components/GeneralBookingForm";
import { UmrahPackagesSection } from "@/components/UmrahPackagesSection";
import { IslamicPattern } from "@/components/IslamicPattern";
import { IslamicIntro } from "@/components/IslamicIntro";
import { AnimatedHeroLogo } from "@/components/AnimatedHeroLogo";
import { HeroBackgroundSlider } from "@/components/HeroBackgroundSlider";
import { PilgrimMarqueeGallery } from "@/components/PilgrimMarqueeGallery";
import { OfficialAccreditationSection } from "@/components/OfficialAccreditationSection";
import { UbkLogo } from "@/components/UbkLogo";
import { SocialMediaIcons } from "@/components/SocialMediaIcons";

export function HomePageView() {
  const { t, isArabic } = useLanguage();
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const homeWaText = encodeURIComponent(
    `Assalamu'alaikum UBK Umrah, saya ingin konsultasi mengenai program dan paket perjalanan ibadah Umrah.\n\n----------------------------------------\n\nالسلام عليكم، أود الاستفسار عن باقات وبرامج رحلات العمرة لدى UBK.`
  );
  const companyWaLink = `https://wa.me/6285110539752?text=${homeWaText}`;

  const joinDirectMarketerWaText = encodeURIComponent(
    `Assalamu'alaikum wr. wb., Saya tertarik dan ingin mendaftar sebagai Mitra Pemasar Langsung (Marketer Resmi) di UBK Umrah. Mohon informasi dan tautan undangan pendaftarannya. Terima kasih.\n\n----------------------------------------\n\nالسلام عليكم ورحمة الله وبركاته، أرغب في الانضمام كمسوّق مباشر معتمد لدى شركة عمر بن الخطاب للعمرة (UBK). يرجى التكرم بتزويدي برابط ورقم الدعوة للتسجيل في النظام.`
  );
  const joinDirectMarketerWaLink = `https://wa.me/6285110539752?text=${joinDirectMarketerWaText}`;

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 font-sans transition-all selection:bg-amber-400 selection:text-slate-950"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Animated UBK Intro Splash */}
      <IslamicIntro />

      {/* Navigation Bar */}
      <header className="border-b border-amber-500/20 bg-slate-950/95 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="hover:opacity-95 transition group shrink-0">
            <UbkLogo size="sm" variant="dark" showSubtitle={false} animated={true} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />

            <Link
              href="/auth/signin"
              className="text-xs font-bold text-slate-300 hover:text-amber-400 transition px-3 py-2 rounded-xl hover:bg-slate-900 border border-slate-800 inline-flex items-center gap-1.5 shrink-0"
              title={t("loginPartner")}
            >
              <span>🔐</span>
              <span>{t("loginPartner")}</span>
            </Link>

            <a
              href="#form-booking"
              className="text-xs font-black bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950/50 transition-all duration-300 transform active:scale-95 shrink-0"
            >
              <span className="relative z-10 font-bold">{t("ctaRegister")}</span>
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
            {/* Language Switcher Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400">
                {isArabic ? "لغة الموقع" : "Bahasa Halaman"}
              </span>
              <LanguageSwitcher />
            </div>

            {/* Direct CTA Registration Button */}
            <a
              href="#form-booking"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/50 transition active:scale-95"
            >
              <span>🕋</span>
              <span>{t("ctaRegister")}</span>
            </a>

            {/* Marketer Portal Login Button */}
            <Link
              href="/auth/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-slate-850 transition"
            >
              <span>🔐</span>
              <span>{t("loginPartner")}</span>
            </Link>

            {/* Join as Direct Marketer WhatsApp */}
            {/* Join as Marketer Portal */}
            <Link
              href="/mitra"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-amber-400/40 text-amber-300 font-bold text-xs hover:bg-slate-850 transition"
            >
              <span>🤝</span>
              <span>{t("ctaPartner")}</span>
            </Link>

            {/* Direct Company WhatsApp Chat */}
            <a
              href={companyWaLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-bold text-xs hover:bg-emerald-900 transition"
            >
              <span>💬</span>
              <span>{t("consultantWa")}</span>
            </a>
          </div>
        )}
      </header>

      {/* Hero Section: Majestic Composite Panorama + Islamic Arabesque Overlay */}
      <section className="relative min-h-[85dvh] sm:min-h-[90vh] flex flex-col justify-center items-center pt-16 sm:pt-24 pb-14 sm:pb-20 px-4 sm:px-6 text-center overflow-hidden">
        {/* Dynamic 10-Second Transitioning Landmarks & Composite Panorama Background */}
        <HeroBackgroundSlider intervalSeconds={10} />

        {/* Central Content Box */}
        <div className="max-w-4xl mx-auto relative z-10 space-y-6 pt-2">
          {/* Prominent Animated UBK Emblem with Rotating Islamic Star Halo */}
          <AnimatedHeroLogo className="mb-2" />

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

          {/* Action CTAs with Micro-Interactions */}
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

            <Link
              href="/mitra"
              className="w-full sm:w-auto bg-slate-900/90 hover:bg-slate-900 border-2 border-amber-400/50 hover:border-amber-400 text-amber-300 hover:text-amber-200 px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t("ctaPartner")}</span>
            </Link>
          </div>
        </div>
      </section>
 
      {/* Dynamic Pilgrim Showcase: Live Infinite Marquee Gallery */}
      <PilgrimMarqueeGallery />

      {/* Official Government Accreditation & Asma Tour Agency Section */}
      <OfficialAccreditationSection />

      {/* Umrah Packages Section with Islamic Mihrab Arches & Arabesque Cards */}
      <UmrahPackagesSection onSelectPackage={setSelectedPackage} />

      {/* Booking Form Section */}
      <section id="form-booking" className="relative py-16 sm:py-24 px-4 sm:px-6 bg-slate-900 border-t border-amber-500/20 overflow-hidden">
        {/* Islamic Subtle Watermark */}
        <IslamicPattern opacity={0.08} color="#d97706" scale={64} />

        <div className="max-w-xl mx-auto bg-slate-950/90 backdrop-blur-md p-5 sm:p-10 rounded-3xl shadow-2xl border border-amber-500/30 relative z-10">
          <div className="text-center mb-6 sm:mb-8 space-y-2">
            <span className="inline-block px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/30">
              {isArabic ? "خدمة العملاء والحجز المباشر" : "PENDAFTARAN & KONSULTASI"}
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white">
              {t("formTitle")}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t("formSubtitle")}
            </p>
          </div>

          <GeneralBookingForm initialPackage={selectedPackage} />
        </div>
      </section>

      {/* Floating WhatsApp Button with Safe Area Adaptation */}
      <div className={`fixed bottom-safe ${isArabic ? "left-4 sm:left-6" : "right-4 sm:right-6"} z-40`}>
        <a
          href={companyWaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl shadow-emerald-700/50 transition-all duration-300 transform hover:scale-105 active:scale-95 border border-emerald-400/40"
        >
          <span className="text-lg sm:text-xl animate-bounce">💬</span>
          <span className="tracking-wide font-black">{t("consultantWa")}</span>
        </a>
      </div>

      {/* Comprehensive Official Accreditation & Contacts Footer */}
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

            {/* Official Agency Credentials */}
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
            </div>
          </div>

          {/* Middle Row: Office Address, Direct Contacts & Social Media */}
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

            {/* Col 2: Direct Contact Channels */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                {isArabic ? "📞 قنوات التواصل المباشر" : "📞 Kontak Resmi"}
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
                    href="https://wa.me/6285110539752"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-mono font-bold transition flex items-center justify-center md:justify-start gap-2"
                  >
                    <span>💬</span>
                    <span>+62 851-1053-9752</span>
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
                {isArabic ? "بوابة المسوقين" : "Portal Mitra"}
              </Link>
              <span>•</span>
              <a href="https://wa.me/6285110539752" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition">
                {isArabic ? "خدمة العملاء" : "Customer Care"}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
