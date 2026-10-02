"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { IslamicPattern } from "@/components/IslamicPattern";
import { normalizeImageUrl } from "@/lib/imageUtils";

export interface PilgrimPhotoItem {
  id: number;
  title: string;
  titleAr?: string | null;
  category: string;
  categoryAr?: string | null;
  imageUrl: string;
  location?: string | null;
  year: number;
}

const INITIAL_FALLBACK_PHOTOS: PilgrimPhotoItem[] = [
  {
    id: 1,
    title: "Jamaah UBK Tawaf di Pelataran Ka'bah Makkah",
    titleAr: "طواف معتمرينا في صحن الكعبة المشرفة",
    category: "MAKKAH",
    categoryAr: "مكة المكرمة",
    imageUrl: "/images/landmarks/makkah-clock.jpg",
    location: "Masjidil Haram, Makkah",
    year: 2025,
  },
  {
    id: 2,
    title: "Kekhusyukan Jamaah di Pelataran Masjid Nabawi Madinah",
    titleAr: "خشوع وسكينة في رحاب المسجد النبوي الشريف",
    category: "MADINAH",
    categoryAr: "المدينة المنورة",
    imageUrl: "/images/landmarks/madinah-nabawi.jpg",
    location: "Al-Masjid An-Nabawi, Madinah",
    year: 2025,
  },
  {
    id: 3,
    title: "Perjalanan Nyaman Jamaah dengan Kereta Cepat Haramain",
    titleAr: "تجربة تنقل ميسرة عبر قطار الحرمين السريع",
    category: "ZIARAH",
    categoryAr: "المزارات والنقل",
    imageUrl: "/images/landmarks/haramain-train.jpg",
    location: "Haramain High Speed Railway",
    year: 2025,
  },
  {
    id: 4,
    title: "Wisata Religi & Alam Teleferik Kereta Gantung Al Hada Taif",
    titleAr: "رحلة هوائية بانورامية في تلفريك الهدا بالطائف",
    category: "ZIARAH",
    categoryAr: "مزارات الطائف",
    imageUrl: "/images/landmarks/taif-cablecar.png",
    location: "Al Hada, Taif",
    year: 2025,
  },
];

export function PilgrimMarqueeGallery() {
  const { isArabic } = useLanguage();
  const [photos, setPhotos] = useState<PilgrimPhotoItem[]>(INITIAL_FALLBACK_PHOTOS);
  const [activeZoomPhoto, setActiveZoomPhoto] = useState<PilgrimPhotoItem | null>(null);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const res = await fetch("/api/gallery");
        const data = await res.json();
        if (res.ok && data.photos && data.photos.length > 0) {
          setPhotos(data.photos);
        }
      } catch (err) {
        console.error("Failed to load pilgrim gallery:", err);
      }
    }
    fetchPhotos();
  }, []);

  if (photos.length === 0) {
    return null;
  }

  // Duplicate items for infinite seamless scroll
  const marqueeItems = [...photos, ...photos, ...photos];

  return (
    <section className="relative py-16 bg-slate-950 text-white overflow-hidden border-t border-amber-500/20 select-none">
      {/* Islamic Background Arabesque Texture */}
      <IslamicPattern opacity={0.07} color="#fbbf24" scale={72} />

      <div className="max-w-7xl mx-auto px-6 mb-8 text-center relative z-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-black tracking-wider uppercase backdrop-blur-md">
          <span>📸</span>
          <span>{isArabic ? "لحظات إيمانية موثقة لضيوف الرحمن" : "DOKUMENTASI JAMAAH UBK UMRAH"}</span>
          <span>📸</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          {isArabic ? (
            <>
              مشاهد حية من رحلات معتمرينا إلى <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-300">أطهر بقاع الأرض</span>
            </>
          ) : (
            <>
              Potret Kebahagiaan & Kekhusyukan <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-300">Jamaah UBK</span>
            </>
          )}
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          {isArabic
            ? "نشارككم فيضاً من مشاعر الخشوع والفرحة لوفود وأفواج معتمرينا السابقة في مكة المكرمة والمدينة المنورة."
            : "Ribuan jamaah telah merasakan kekhusyukan dan kenyamanan ibadah bersama Umar Bin Alkhattab for Umrah."}
        </p>
      </div>

      {/* Infinite Horizontal Scrolling Ribbon Container */}
      <div className="relative w-full overflow-hidden group">
        {/* Soft edge fade masks */}
        <div className="absolute inset-y-0 start-0 w-16 sm:w-32 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 end-0 w-16 sm:w-32 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent z-20 pointer-events-none" />

        {/* Marquee Track (Smooth Infinite CSS Keyframe Animation) */}
        <div className="flex gap-6 w-max animate-[marquee_45s_linear_infinite] group-hover:[animation-play-state:paused] py-4 px-2">
          {marqueeItems.map((photo, index) => {
            const displayTitle = isArabic && photo.titleAr ? photo.titleAr : photo.title;
            const displayCategory = isArabic && photo.categoryAr ? photo.categoryAr : photo.category;

            return (
              <div
                key={`${photo.id}-${index}`}
                onClick={() => setActiveZoomPhoto(photo)}
                className="w-72 sm:w-80 h-96 shrink-0 relative rounded-3xl overflow-hidden border border-amber-500/30 bg-slate-900 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-103 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/20 cursor-pointer"
              >
                {/* Background Islamic Watermark */}
                <IslamicPattern opacity={0.06} color="#d97706" scale={48} />

                {/* Photo Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={normalizeImageUrl(photo.imageUrl)}
                  alt={displayTitle}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.tried) {
                      target.dataset.tried = "true";
                      const match = photo.imageUrl.match(/([a-zA-Z0-9_-]{25,})/);
                      if (match) {
                        target.src = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600`;
                        return;
                      }
                    }
                    target.src = "/images/landmarks/madinah-nabawi.jpg";
                  }}
                />

                {/* Multi-layered Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

                {/* Top Year & Category Badges */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-md">
                    {displayCategory}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600/90 text-white backdrop-blur-md shadow-md">
                    {photo.year}
                  </span>
                </div>

                {/* Zoom Hover Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 z-10 pointer-events-none">
                  <span className="w-12 h-12 rounded-full bg-amber-500/80 text-slate-950 font-bold flex items-center justify-center text-lg shadow-xl backdrop-blur-sm transform scale-75 group-hover:scale-100 transition duration-300">
                    🔍
                  </span>
                </div>

                {/* Bottom Caption Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-5 z-10 space-y-1 text-start">
                  {photo.location && (
                    <div className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                      <span>📍</span>
                      <span className="truncate">{photo.location}</span>
                    </div>
                  )}
                  <h3 className="text-sm font-black text-white leading-snug line-clamp-2">
                    {displayTitle}
                  </h3>
                  <div className="text-[10px] text-slate-400 pt-0.5">
                    {isArabic ? "عمر بن الخطاب للعمرة (UBK)" : "UBK Official Documentation"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {activeZoomPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setActiveZoomPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
            dir={isArabic ? "rtl" : "ltr"}
          >
            {/* Modal Pattern */}
            <IslamicPattern opacity={0.06} color="#fbbf24" scale={56} />

            <div className="relative max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={normalizeImageUrl(activeZoomPhoto.imageUrl)}
                alt={isArabic && activeZoomPhoto.titleAr ? activeZoomPhoto.titleAr : activeZoomPhoto.title}
                className="w-full h-auto max-h-[70vh] object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  const match = activeZoomPhoto.imageUrl.match(/([a-zA-Z0-9_-]{25,})/);
                  if (match && !target.dataset.tried) {
                    target.dataset.tried = "true";
                    target.src = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600`;
                  }
                }}
              />

              <button
                onClick={() => setActiveZoomPhoto(null)}
                className="absolute top-4 end-4 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/95 text-white flex items-center gap-1.5 font-bold text-xs transition border border-white/20 backdrop-blur-md shadow-lg"
              >
                <span>{isArabic ? "العودة / إغلاق" : "Kembali / Tutup"}</span>
                <span>✕</span>
              </button>
            </div>

            <div className="p-6 sm:p-7 space-y-3 bg-slate-900 text-start">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {isArabic && activeZoomPhoto.categoryAr ? activeZoomPhoto.categoryAr : activeZoomPhoto.category} • {activeZoomPhoto.year}
                </span>
                {activeZoomPhoto.location && (
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    📍 {activeZoomPhoto.location}
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {isArabic && activeZoomPhoto.titleAr ? activeZoomPhoto.titleAr : activeZoomPhoto.title}
              </h3>
              <p className="text-xs text-emerald-400 font-semibold pt-1">
                {isArabic
                  ? "توثيق رسمي معتمد لرحلات وأفواج عمر بن الخطاب للعمرة (UBK)"
                  : "Dokumentasi Resmi Keberangkatan Jamaah Umar Bin Alkhattab for Umrah (UBK)"}
              </p>

              <div className="pt-2 flex justify-end border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveZoomPhoto(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span>←</span>
                  <span>{isArabic ? "العودة للمعرض" : "Kembali ke Galeri"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
