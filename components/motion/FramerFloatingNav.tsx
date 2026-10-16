"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { UbkLogo } from "@/components/UbkLogo";
import { Sparkles, Lock, ArrowUpRight, MessageCircle, Menu, X } from "lucide-react";

interface FramerFloatingNavProps {
  companyWaLink: string;
}

/**
 * شريط تنقل عائم ذكي بتأثيرات حركة زجاجية انسيابية بنمط Framer
 */
export function FramerFloatingNav({ companyWaLink }: FramerFloatingNavProps) {
  const { t, isArabic } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "py-2 sm:py-3 bg-slate-950/85 backdrop-blur-xl border-b border-amber-500/30 shadow-2xl shadow-black/80"
            : "py-3 sm:py-4 bg-slate-950/40 backdrop-blur-md border-b border-white/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo Brand with Framer Hover */}
          <Link href="/" className="group flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <UbkLogo size="sm" variant="dark" showSubtitle={false} animated={true} />
            </motion.div>
          </Link>

          {/* Quick Announcement Pill on Scrolled (Desktop) */}
          <motion.div
            animate={{ opacity: scrolled ? 1 : 0.8, scale: scrolled ? 0.95 : 1 }}
            className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-amber-400/30 text-amber-300 text-xs font-bold backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>
              {isArabic
                ? "مواسم العمرة 1446-1447هـ | حجوزات مباشرة وموثقة"
                : "Musim Umrah 1446-1447 H | Terpercaya & Sesuai Sunnah"}
            </span>
          </motion.div>

          {/* Desktop Navigation Actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />

            {/* Partner Login Button */}
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/auth/signin"
                className="text-xs font-bold text-slate-200 hover:text-amber-400 transition-colors px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 inline-flex items-center gap-2 shadow-xs"
                title={t("loginPartner")}
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t("loginPartner")}</span>
              </Link>
            </motion.div>

            {/* Direct Booking CTA Button */}
            <motion.a
              href="#form-booking"
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="relative group text-xs font-black px-5 py-2.5 rounded-xl overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 shadow-lg shadow-emerald-950/60 transition-all duration-300 flex items-center gap-2"
            >
              <span className="relative z-10 font-bold">{t("ctaRegister")}</span>
              <ArrowUpRight className="w-4 h-4 text-slate-950 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </motion.a>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex md:hidden items-center">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-xl bg-slate-900/90 border border-amber-500/30 text-amber-300 flex items-center justify-center shadow-lg"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Dropdown Animated Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-amber-500/20 bg-slate-950/98 backdrop-blur-2xl px-5 py-6 space-y-4 shadow-2xl overflow-hidden"
            >
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
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/50 active:scale-95 transition-transform"
              >
                <span>🕋</span>
                <span>{t("ctaRegister")}</span>
              </a>

              {/* Marketer Portal Login Button */}
              <Link
                href="/auth/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-slate-850 active:scale-95 transition"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t("loginPartner")}</span>
              </Link>

              {/* Join as Marketer Portal */}
              <Link
                href="/mitra"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-amber-400/40 text-amber-300 font-bold text-xs hover:bg-slate-850 active:scale-95 transition"
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
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-bold text-xs hover:bg-emerald-900 active:scale-95 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t("consultantWa")}</span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
