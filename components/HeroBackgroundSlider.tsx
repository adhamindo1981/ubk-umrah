"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { IslamicPattern } from "@/components/IslamicPattern";

interface Slide {
  id: string;
  image: string;
  titleAr: string;
  titleId: string;
}

interface HeroBackgroundSliderProps {
  intervalSeconds?: number;
  className?: string;
}

export function HeroBackgroundSlider({
  intervalSeconds = 10,
  className = "",
}: HeroBackgroundSliderProps) {
  const { isArabic } = useLanguage();

  const slides: Slide[] = [
    {
      id: "composite",
      image: "/images/hero-composite-panorama.jpg",
      titleAr: "بانوراما معالم الحرمين الشريفين وقطار الحرمين وتلفريك الهدا",
      titleId: "Panorama Harmoni Dua Kota Suci, Kereta Cepat & Taif",
    },
    {
      id: "makkah",
      image: "/images/landmarks/makkah-clock.jpg",
      titleAr: "المسجد الحرام والكعبة المشرفة وبرج الساعة الملكي",
      titleId: "Masjidil Haram, Ka'bah & Makkah Royal Clock Tower",
    },
    {
      id: "madinah",
      image: "/images/landmarks/madinah-nabawi.jpg",
      titleAr: "المسجد النبوي الشريف والقبة الخضراء والمظلات",
      titleId: "Al-Masjid An-Nabawi, Kubah Hijau & Payung Pelataran",
    },
    {
      id: "train",
      image: "/images/landmarks/haramain-train.jpg",
      titleAr: "قطار الحرمين السريع فائق السرعة بين مكة والمدينة",
      titleId: "Kereta Cepat Haramain (High-Speed Train 300 km/jam)",
    },
    {
      id: "taif",
      image: "/images/landmarks/taif-cablecar.png",
      titleAr: "تلفريك الهدا في مرتفعات الطائف وجبال السروات",
      titleId: "Teleferik Kereta Gantung Al Hada Taif Pegunungan Hijaz",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [intervalSeconds, slides.length]);

  function nextSlide() {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }

  function prevSlide() {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-auto select-none ${className}`}>
      {/* Slides Stack with Crossfade & Ken Burns Zoom */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt={isArabic ? slide.titleAr : slide.titleId}
              className={`w-full h-full object-cover object-center filter brightness-95 contrast-105 transition-transform duration-[10000ms] ease-out ${
                isActive ? "scale-105" : "scale-100"
              }`}
            />
          </div>
        );
      })}

      {/* Layered Islamic Arabesque Pattern Blend with Transparency */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <IslamicPattern opacity={0.12} color="#f59e0b" scale={72} />
      </div>

      {/* Luxury Atmospheric Dark Vignette & Golden Ambient Aura */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-slate-950/75 via-slate-950/55 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 z-20 bg-radial from-transparent via-slate-950/50 to-slate-950 pointer-events-none" />

      {/* Slide Controls & Active Landmark Title Badge */}
      <div className="absolute bottom-6 inset-x-0 z-30 flex flex-col sm:flex-row items-center justify-between px-6 sm:px-10 gap-3 pointer-events-auto">
        {/* Active Slide Info Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-amber-400/30 text-amber-300 text-[11px] font-bold backdrop-blur-md shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span className="truncate max-w-[280px] sm:max-w-md">
            {isArabic ? currentSlide.titleAr : currentSlide.titleId}
          </span>
        </div>

        {/* Carousel Indicators & Controls */}
        <div className="flex items-center gap-2">
          {/* Previous Arrow */}
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="w-7 h-7 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 hover:border-amber-400 text-xs flex items-center justify-center transition backdrop-blur-md shadow-md"
          >
            {isArabic ? "→" : "←"}
          </button>

          {/* Dots Indicator with Progress */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-500 rounded-full ${
                  idx === currentIndex
                    ? "w-6 h-2 bg-gradient-to-r from-amber-400 to-amber-500 shadow-xs shadow-amber-400"
                    : "w-2 h-2 bg-slate-600 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>

          {/* Next Arrow */}
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="w-7 h-7 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 hover:border-amber-400 text-xs flex items-center justify-center transition backdrop-blur-md shadow-md"
          >
            {isArabic ? "←" : "→"}
          </button>
        </div>
      </div>
    </div>
  );
}
