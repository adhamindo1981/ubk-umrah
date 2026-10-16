"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { GeneralBookingForm } from "@/components/GeneralBookingForm";
import { UmrahPackagesSection } from "@/components/UmrahPackagesSection";
import { IslamicPattern } from "@/components/IslamicPattern";
import { IslamicIntro } from "@/components/IslamicIntro";
import { HeroBackgroundSlider } from "@/components/HeroBackgroundSlider";
import { PilgrimMarqueeGallery } from "@/components/PilgrimMarqueeGallery";
import { OfficialAccreditationSection } from "@/components/OfficialAccreditationSection";
import { UbkLogo } from "@/components/UbkLogo";
import { SocialMediaIcons } from "@/components/SocialMediaIcons";
import { FramerFloatingNav } from "@/components/motion/FramerFloatingNav";
import { FramerHeroInteractive } from "@/components/motion/FramerHeroInteractive";
import { FramerStatsCounter } from "@/components/motion/FramerStatsCounter";
import { MotionFadeIn } from "@/components/motion/MotionFadeIn";

export function HomePageView() {
  const { t, isArabic } = useLanguage();
  const [selectedPackage, setSelectedPackage] = useState<string>("");

  // If visitor previously opened a marketer's link, automatically redirect to marketer page
  // (Exempts logged-in Admins/Marketers so they can freely browse the homepage)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const hasSession = document.cookie.includes("session-token");
        if (hasSession) return;

        const savedCode = localStorage.getItem("ubk_pilgrim_marketer");
        if (savedCode && savedCode.trim() !== "") {
          window.location.replace(`/m/${savedCode.trim()}`);
        }
      } catch (_) {}
    }
  }, []);

  const homeWaText = encodeURIComponent(
    `Assalamu'alaikum UBK Umrah, saya ingin konsultasi mengenai program dan paket perjalanan ibadah Umrah.\n\n----------------------------------------\n\nالسلام عليكم، أود الاستفسار عن باقات وبرامج رحلات العمرة لدى UBK.`
  );
  const companyWaLink = `https://wa.me/6285110539752?text=${homeWaText}`;

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 font-sans transition-all selection:bg-amber-400 selection:text-slate-950"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Animated UBK Intro Splash */}
      <IslamicIntro />

      {/* Modern Interactive Framer Floating Navbar */}
      <FramerFloatingNav companyWaLink={companyWaLink} />

      {/* Hero Section: Majestic Composite Panorama + Islamic Arabesque Overlay */}
      <section className="relative min-h-[92dvh] sm:min-h-[95vh] flex flex-col justify-center items-center pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 text-center overflow-hidden">
        {/* Dynamic 10-Second Transitioning Landmarks & Composite Panorama Background */}
        <HeroBackgroundSlider intervalSeconds={10} />

        {/* Central Interactive Content with Framer Motion Staggered Physics */}
        <FramerHeroInteractive />
      </section>

      {/* Interactive Live Numbers & Accreditation Stats Bar */}
      <FramerStatsCounter />

      {/* Dynamic Pilgrim Showcase: Live Infinite Marquee Gallery */}
      <MotionFadeIn direction="up">
        <PilgrimMarqueeGallery />
      </MotionFadeIn>

      {/* Official Government Accreditation & Asma Tour Agency Section */}
      <OfficialAccreditationSection />

      {/* Umrah Packages Section with Islamic Mihrab Arches & Arabesque Cards */}
      <section id="packages" className="scroll-mt-20">
        <MotionFadeIn direction="up">
          <UmrahPackagesSection onSelectPackage={setSelectedPackage} />
        </MotionFadeIn>
      </section>

      {/* Booking Form Section */}
      <section id="form-booking" className="relative py-16 sm:py-24 px-4 sm:px-6 bg-slate-900 border-t border-amber-500/20 overflow-hidden">
        {/* Islamic Subtle Watermark */}
        <IslamicPattern opacity={0.08} color="#d97706" scale={64} />

        <MotionFadeIn direction="up">
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
        </MotionFadeIn>
      </section>

      {/* Floating WhatsApp Button with Framer Micro-Interactions */}
      <div className={`fixed bottom-safe ${isArabic ? "left-4 sm:left-6" : "right-4 sm:right-6"} z-40`}>
        <motion.div
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <a
            href={companyWaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl shadow-emerald-700/50 transition-all duration-300 border border-emerald-400/40"
          >
            <span className="text-lg sm:text-xl animate-bounce">💬</span>
            <span className="tracking-wide font-black">{t("consultantWa")}</span>
          </a>
        </motion.div>
      </div>

      {/* Comprehensive Official Accreditation & Contacts Footer */}
      <MotionFadeIn direction="up">
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
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[11px] text-slate-500">
                <Link href="/deck" target="_blank" className="hover:text-amber-400 transition text-emerald-400/90 font-medium">
                  {isArabic ? "📄 الملف التعريفي والتقرير التنفيذي (Deck & PDF)" : "📄 Executive Deck & Profile (PDF)"}
                </Link>
                <span>•</span>
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
      </MotionFadeIn>
    </div>
  );
}
