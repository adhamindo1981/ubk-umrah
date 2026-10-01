"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { IslamicPattern } from "@/components/IslamicPattern";

interface Landmark {
  id: string;
  titleAr: string;
  titleId: string;
  subtitleAr: string;
  subtitleId: string;
  badgeAr: string;
  badgeId: string;
  descAr: string;
  descId: string;
  image: string;
  span?: string;
}

export function LandmarksShowcase() {
  const { isArabic } = useLanguage();
  const [activeModalLandmark, setActiveModalLandmark] = useState<Landmark | null>(null);

  const landmarks: Landmark[] = [
    {
      id: "makkah-clock",
      titleAr: "المسجد الحرام وبرج الساعة الملكي",
      titleId: "Masjidil Haram & Makkah Clock Tower",
      subtitleAr: "مكة المكرمة • جوار الكعبة المشرفة",
      subtitleId: "Makkah Al-Mukarramah • Pelataran Ka'bah",
      badgeAr: "🕋 مهوى الأفئدة",
      badgeId: "🕋 Pusat Ibadah Dunia",
      descAr: "طواف حول الكعبة المشرفة وأداء مناسك العمرة في رحاب المسجد الحرام، مع إطلالة الصرح المعماري الفريد لبرج الساعة وفنادق وقف الملك عبدالعزيز المجاورة.",
      descId: "Thawaf mengelilingi Ka'bah dan ibadah khusyuk di Masjidil Haram, berdampingan dengan kemegahan Makkah Royal Clock Tower dan hotel-hotel pelataran terbaik.",
      image: "/images/landmarks/makkah-clock.jpg",
      span: "lg:col-span-2 lg:row-span-2",
    },
    {
      id: "madinah-nabawi",
      titleAr: "المسجد النبوي الشريف والقبة الخضراء",
      titleId: "Al-Masjid An-Nabawi & Kubah Hijau",
      subtitleAr: "المدينة المنورة • طيبة الطيبة",
      subtitleId: "Madinah Al-Munawwarah • Kota Rasulullah ﷺ",
      badgeAr: "🕊️ روضة من رياض الجنة",
      badgeId: "🕊️ Raudhah & Payung Raksasa",
      descAr: "الصلاة في روضة الجنة والسلام على رسول الله ﷺ، والاستظلال بمظلات ساحات الحرم النبوي الشريف في أجواء روحانية وسكينة لا تضاهى.",
      descId: "Ziarah ke makam Rasulullah ﷺ, shalat khusyuk di Raudhah asy-Syarifah, serta menikmati keteduhan payung hidrolik raksasa di pelataran Nabawi.",
      image: "/images/landmarks/madinah-nabawi.jpg",
      span: "lg:col-span-1 lg:row-span-2",
    },
    {
      id: "haramain-train",
      titleAr: "قطار الحرمين السريع فائق السرعة",
      titleId: "Kereta Cepat Haramain (High-Speed Train)",
      subtitleAr: "الربط فائق السرعة بين مكة والمدينة (300 كم/س)",
      subtitleId: "Konektivitas Cepat Makkah - Madinah (300 km/jam)",
      badgeAr: "⚡ راحة ورفاهية عالمية",
      badgeId: "⚡ Transportasi Modern VIP",
      descAr: "تنقل سريع ومريح بين مكة والمدينة المنورة في غضون ساعتين فقط على متن أحدث وأسرع قطارات الشرق الأوسط بمقاعد وثيرة وخدمات ضيافة متطورة.",
      descId: "Perjalanan super nyaman dan efisien antara Makkah dan Madinah hanya dalam waktu 2 jam dengan armada kereta cepat tercanggih berkecepatan 300 km/jam.",
      image: "/images/landmarks/haramain-train.jpg",
      span: "lg:col-span-2",
    },
    {
      id: "taif-cablecar",
      titleAr: "تلفريك الهدا في مرتفعات الطائف",
      titleId: "Teleferik Kereta Gantung Al Hada Taif",
      subtitleAr: "عروس المصايف • جبال السروات الشاهقة",
      subtitleId: "Pegunungan Al Hada • Wisata Sejarah & Alam",
      badgeAr: "🚠 سياحة وإطلالة ساحرة",
      badgeId: "🚠 Wisata Pegunungan Eksotis",
      descAr: "رحلة هوائية فوق منحدرات وجبال الهدا التاريخية بالطائف، للاستمتاع بالأجواء المعتدلة والنسيم العليل والإطلالات البانورامية الخلابة لمرتفعات الحجاز.",
      descId: "Pengalaman terbang di atas tebing megah dan jalan berkelok bersejarah pegunungan Al Hada, Taif, menghirup udara sejuk pegunungan serta panorama alam Hijaz.",
      image: "/images/landmarks/taif-cablecar.jpg",
      span: "lg:col-span-1",
    },
  ];

  return (
    <section className="relative py-20 px-6 bg-radial from-slate-900 via-slate-950 to-slate-950 text-white overflow-hidden border-t border-slate-800">
      {/* Islamic Background Arabesque with Warm Gold Glow */}
      <IslamicPattern opacity={0.06} color="#fbbf24" scale={72} />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black tracking-wider uppercase backdrop-blur-md">
            <span>✨</span>
            <span>{isArabic ? "محطات ومعالم الرحلة المباركة" : "IKON & DESTINASI PERJALANAN IBADAH"}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {isArabic ? (
              <>
                عِش روحانية الحرمين وعجائب <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">أرض الحرمين</span>
              </>
            ) : (
              <>
                Kesejukan Ibadah di Dua Kota Suci & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">Destinasi Bersejarah</span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {isArabic
              ? "نأخذكم في رحلة إيمانية متكاملة تجمع بين خشوع المشاعر المقدسة بمكة والمدينة، رفاهية قطار الحرمين، وسحر جولات مرتفعات الطائف وتلفريك الهدا."
              : "Menghadirkan perjalanan ibadah istimewa: kekhusyukan Thawaf di Ka'bah, kedamaian Raudhah Madinah, kecepatan Kereta Haramain, hingga keindahan panorama Teleferik Taif."}
          </p>
        </div>

        {/* Landmarks Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {landmarks.map((landmark) => (
            <div
              key={landmark.id}
              onClick={() => setActiveModalLandmark(landmark)}
              className={`group relative rounded-3xl overflow-hidden border border-slate-700/60 bg-slate-900/80 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-amber-400/60 hover:shadow-amber-500/10 cursor-pointer ${
                landmark.span || ""
              }`}
            >
              {/* Background Islamic Watermark within Card */}
              <IslamicPattern opacity={0.04} color="#f59e0b" scale={48} />

              {/* Image Container with Smooth Parallax Zoom */}
              <div className="relative h-64 sm:h-80 lg:h-full min-h-[300px] w-full overflow-hidden bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={landmark.image}
                  alt={isArabic ? landmark.titleAr : landmark.titleId}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />

                {/* Multi-layered cinematic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-90 group-hover:opacity-85 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-4 start-4 z-10">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-900/80 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-lg shadow-black/40">
                    {isArabic ? landmark.badgeAr : landmark.badgeId}
                  </span>
                </div>

                {/* Quick Zoom Indicator */}
                <div className="absolute top-4 end-4 z-10 opacity-0 group-hover:opacity-100 transition duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-sm border border-white/30 shadow-md">
                    🔍
                  </span>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 z-10 flex flex-col justify-end space-y-2">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                    {isArabic ? landmark.subtitleAr : landmark.subtitleId}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-amber-300 transition duration-300">
                    {isArabic ? landmark.titleAr : landmark.titleId}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed opacity-90">
                    {isArabic ? landmark.descAr : landmark.descId}
                  </p>
                  
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:text-amber-300">
                    <span>{isArabic ? "عرض التفاصيل والصور" : "Lihat Selengkapnya"}</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Details Modal */}
      {activeModalLandmark && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setActiveModalLandmark(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Islamic Pattern within Modal */}
            <IslamicPattern opacity={0.05} color="#fbbf24" scale={56} />

            {/* Modal Image */}
            <div className="relative h-72 sm:h-96 w-full bg-black overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeModalLandmark.image}
                alt={isArabic ? activeModalLandmark.titleAr : activeModalLandmark.titleId}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              
              <button
                onClick={() => setActiveModalLandmark(null)}
                className="absolute top-4 end-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center font-bold text-base transition border border-white/20 backdrop-blur-md"
              >
                ✕
              </button>

              <div className="absolute bottom-4 start-6">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 font-mono shadow-md">
                  {isArabic ? activeModalLandmark.badgeAr : activeModalLandmark.badgeId}
                </span>
              </div>
            </div>

            {/* Modal Info */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {isArabic ? activeModalLandmark.subtitleAr : activeModalLandmark.subtitleId}
                </span>
                <h3 className="text-2xl font-black text-white">
                  {isArabic ? activeModalLandmark.titleAr : activeModalLandmark.titleId}
                </h3>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {isArabic ? activeModalLandmark.descAr : activeModalLandmark.descId}
              </p>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  {isArabic
                    ? "✨ مشمول ضمن البرامج والزيارات المعتمدة لدى UBK للعمرة"
                    : "✨ Termasuk dalam agenda ziarah & fasilitas program resmi UBK Umrah"}
                </div>
                <a
                  href="#form-booking"
                  onClick={() => setActiveModalLandmark(null)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-emerald-600/30"
                >
                  {isArabic ? "حجز رحلة الآن 🕋" : "Daftar Paket Sekarang 🕋"}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
