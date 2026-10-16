"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  PenTool,
  Image as ImageIcon,
  Copy,
  Check,
  RefreshCw,
  Send,
  Download,
  AlertCircle,
  HelpCircle,
  Clock,
  Zap,
  Sliders,
  ChevronRight,
  Flame,
  FileText,
  ShieldCheck,
  Share2,
  Globe,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface AiStudioViewProps {
  marketerName?: string;
  referralCode?: string;
  personalLandingUrl?: string;
}

interface ImageQuotaState {
  usedCount: number;
  maxQuota: number;
  remaining: number;
  isExhausted: boolean;
}

export function AiStudioView({
  marketerName = "Konsultan UBK",
  referralCode = "",
  personalLandingUrl = "",
}: AiStudioViewProps) {
  const { lang, isArabic } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<"copywriting" | "image">("copywriting");

  // ==========================================
  // COPYWRITING STATE
  // ==========================================
  const [copyTopic, setCopyTopic] = useState("");
  const [copyFormat, setCopyFormat] = useState("WHATSAPP");
  const [copyTone, setCopyTone] = useState("ISLAMI_SANTUN");
  const [copyAudience, setCopyAudience] = useState("KELUARGA");
  const [outputLanguage, setOutputLanguage] = useState<"id" | "ar">(isArabic ? "ar" : "id");
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState("");
  const [copyProvider, setCopyProvider] = useState("");
  const [copiedText, setCopiedText] = useState(false);

  // Iterative Revision Box
  const [revisionNote, setRevisionNote] = useState("");
  const [isRevisingCopy, setIsRevisingCopy] = useState(false);
  const [revisionHistory, setRevisionHistory] = useState<string[]>([]);

  // Update output language automatically when site language changes if not touched
  useEffect(() => {
    setOutputLanguage(isArabic ? "ar" : "id");
  }, [isArabic]);

  // ==========================================
  // IMAGE STUDIO STATE
  // ==========================================
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState("realistic");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const [imageProvider, setImageProvider] = useState("");
  const [quota, setQuota] = useState<ImageQuotaState>({
    usedCount: 0,
    maxQuota: 3,
    remaining: 3,
    isExhausted: false,
  });
  const [quotaError, setQuotaError] = useState<string | null>(null);

  // Fetch Image Quota on mount
  const fetchImageQuota = async () => {
    try {
      const res = await fetch("/api/ai-studio/image/quota");
      if (res.ok) {
        const data = await res.json();
        setQuota({
          usedCount: data.usedCount || 0,
          maxQuota: data.maxQuota || 3,
          remaining: data.remaining ?? 3,
          isExhausted: Boolean(data.isExhausted),
        });
      }
    } catch (err) {
      console.error("Failed to fetch AI image quota:", err);
    }
  };

  useEffect(() => {
    fetchImageQuota();
  }, []);

  // Quick Copywriting Presets (Bilingual)
  const copyPresets = isArabic
    ? [
        {
          title: "دفعة أولى 5 مليون روبية",
          prompt: "تسهيلات الحجز المبكر بدفعة أولى ميسرة فقط (DP 5 Juta) لتأكيد المقعد وتذاكر الطيران لبرنامج عمرة 2026",
          format: "WHATSAPP",
        },
        {
          title: "فنادق قريبة بدون باص تردد",
          prompt: "ميزة السكن في فنادق قريبة جداً مشياً على الأقدام لساحات الحرم المكي والمسجد النبوي دون الحاجة لانتظار باصات التردد لكبار السن",
          format: "INSTAGRAM",
        },
        {
          title: "طيران القطرية 5 نجوم",
          prompt: "راحة السفر على متن الخطوط الجوية القطرية المصنفة 5 نجوم عالمياً مع وزن أمتعة ممتاز وخدمات متميزة",
          format: "TIKTOK",
        },
        {
          title: "وجبة البيك مجاناً",
          prompt: "ضيافة خاصة للمعتمرين بتذوق وجبة البيك الشهيرة في مكة المكرمة مجاناً ضمن باقة البرنامج",
          format: "WHATSAPP",
        },
      ]
    : [
        {
          title: "Cukup DP 5 Juta",
          prompt: "Kemudahan reservasi awal cukup bayar DP Rp 5.000.000 untuk amankan tiket penerbangan dan kuota seat 2026",
          format: "WHATSAPP",
        },
        {
          title: "Hotel Tanpa Shuttle Bus",
          prompt: "Keunggulan hotel dekat Masjidil Haram dan Nabawi, jalan kaki santai tanpa perlu antre bus shuttle bagi orang tua",
          format: "INSTAGRAM",
        },
        {
          title: "Penerbangan Qatar Airways",
          prompt: "Kenyamanan penerbangan bintang lima maskapai Qatar Airways kelas dunia dengan bagasi luas dan pelayanan prima",
          format: "TIKTOK",
        },
        {
          title: "Gratis Albaik di Makkah",
          prompt: "Sensasi nikmat mencicipi hidangan kuliner legendaris khas Arab Saudi (Free Albaik) yang sudah termasuk dalam paket",
          format: "WHATSAPP",
        },
      ];

  // Quick Image Presets (Bilingual)
  const imagePresets = isArabic
    ? [
        "عائلة إندونيسية مبتسمة في ساحة الحرم المكي الشريف وخلفها الكعبة المشرفة مع إشراقة شمس ذهبية ساحرة",
        "معتمرون من كبار السن والشباب يمشون براحة وسعادة خارجين من فندق راقٍ قريب جداً من أبواب المسجد النبوي",
        "طائرة الخطوط الجوية القطرية مع حقائب سفر فاخرة وتذاكر سفر أنيقة تحمل شعار رحلات العمرة",
        "مجموعة معتمرين يجلسون معاً في قاعة طعام راقية يستمتعون بوجبة البيك الشهيرة في مكة المكرمة",
      ]
    : [
        "Keluarga Indonesia tersenyum bahagia di pelataran Masjidil Haram dengan latar belakang Ka'bah megah saat matahari terbit",
        "Jamaah lansia dan anak muda berjalan santai keluar hotel mewah yang sangat dekat dengan gerbang Masjid Nabawi Madinah",
        "Pramugari dan pesawat Qatar Airways dengan elemen koper umrah premium dan tiket penerbangan resmi",
        "Momen kebersamaan jamaah umrah menikmati hidangan lezat Albaik di ruang makan hotel Makkah",
      ];

  // Generate Copywriting
  const handleGenerateCopy = async (isRevision = false) => {
    const topicToUse = isRevision ? copyTopic : copyTopic.trim();
    if (!topicToUse && !isRevision) return;

    if (isRevision) {
      if (!revisionNote.trim() || !generatedCopy) return;
      setIsRevisingCopy(true);
    } else {
      setIsGeneratingCopy(true);
    }

    try {
      const res = await fetch("/api/ai-studio/copywriting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: topicToUse,
          format: copyFormat,
          tone: copyTone,
          targetAudience: copyAudience,
          outputLanguage,
          previousContent: isRevision ? generatedCopy : undefined,
          revisionInstructions: isRevision ? revisionNote.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.copywriting) {
        if (isRevision && generatedCopy) {
          setRevisionHistory((prev) => [generatedCopy, ...prev]);
          setRevisionNote("");
        }
        setGeneratedCopy(data.copywriting);
        setCopyProvider(data.provider || "Groq AI");
      } else {
        alert(data.error || (isArabic ? "تعذر توليد النص الإعلاني." : "Gagal menghasilkan teks copywriting."));
      }
    } catch (err) {
      console.error(err);
      alert(isArabic ? "حدث خطأ في الاتصال باستوديو الذكاء الاصطناعي." : "Terjadi kendala jaringan saat menghubungi AI Studio.");
    } finally {
      setIsGeneratingCopy(false);
      setIsRevisingCopy(false);
    }
  };

  // Generate Image
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    if (quota.isExhausted || quota.remaining <= 0) {
      setQuotaError(
        isArabic
          ? "عذراً، لقد استنفدت حصتك المجانية اليومية لتوليد الصور (الحد الأقصى 3 صور يومياً). سيتم إعادة ضبط الحصة تلقائياً الساعة 00:00 بتوقيت جاكرتا."
          : "Maaf, batas kuota AI Image gratis Anda hari ini sudah habis. Kuota harian Anda adalah maksimal 3 gambar per hari dan akan direset otomatis pada pukul 00:00 WIB esok hari."
      );
      return;
    }

    setIsGeneratingImage(true);
    setQuotaError(null);

    try {
      const res = await fetch("/api/ai-studio/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          style: imageStyle,
        }),
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setImageProvider(data.provider || "Hugging Face AI");
        if (data.quota) {
          setQuota(data.quota);
        }
      } else if (res.status === 429) {
        setQuotaError(
          data.error ||
            (isArabic
              ? "عذراً، لقد استنفدت حصتك المجانية اليومية لتوليد الصور (الحد الأقصى 3 صور يومياً)."
              : "Maaf, batas kuota AI Image gratis Anda hari ini sudah habis. Kuota harian Anda adalah maksimal 3 gambar per hari dan akan direset otomatis pada pukul 00:00 WIB esok hari.")
        );
        fetchImageQuota();
      } else {
        alert(data.error || (isArabic ? "فشل إنشاء الصورة." : "Gagal membuat gambar AI."));
      }
    } catch (err) {
      console.error(err);
      alert(isArabic ? "حدث خطأ أثناء إنشاء الصورة بالذكاء الاصطناعي." : "Terjadi kesalahan jaringan saat membuat gambar AI.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopyText = () => {
    if (!generatedCopy) return;
    navigator.clipboard.writeText(generatedCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadImage = () => {
    if (!generatedImageUrl) return;

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, 1080, 1080);
          const pngUrl = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = pngUrl;
          a.download = `UBK-Umrah-Poster-${referralCode || "resmi"}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      };
      img.src = generatedImageUrl;
    } catch (err) {
      // Fallback direct download
      const a = document.createElement("a");
      a.href = generatedImageUrl;
      a.download = `UBK-Umrah-Poster-${referralCode || "resmi"}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleShareToWhatsApp = () => {
    if (!generatedCopy) return;
    const url = `https://wa.me/?text=${encodeURIComponent(generatedCopy)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      {/* Studio Header & Intro Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 border border-emerald-800/60 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <span>
                {isArabic
                  ? "استوديو الذكاء الاصطناعي لصناعة المحتوى والتصاميم"
                  : "Studio Konten & Kreator Visual AI"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isArabic ? "استوديو التسويق الذكي UBK Studio" : "AI Marketing Studio UBK"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isArabic
                ? "مساعد إبداعي متكامل لصياغة نصوص إعلانية وتسويقية مقنعة باللغتين العربية والإندونيسية وتوليد صور مرئية إسلامية حصرية لتعزيز مبيعات رحلات العمرة."
                : "Asisten kecerdasan buatan terpadu untuk memproduksi naskah promosi (Copywriting) berkualitas tinggi dan ilustrasi visual Islami eksklusif untuk mendongkrak penjualan Umrah Anda."}
            </p>
          </div>

          {/* Sub-Tab Navigation Switcher & Inline Language Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
            {/* Quick Language Toggle Button inside Studio */}
            <div className="self-end sm:self-center">
              <LanguageSwitcher />
            </div>

            <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700/80 flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveSubTab("copywriting")}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  activeSubTab === "copywriting"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>{isArabic ? "✍️ كاتب النصوص الإعلانية" : "Penulis Naskah AI"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSubTab("image");
                  fetchImageQuota();
                }}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                  activeSubTab === "image"
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-400/20 font-black"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>{isArabic ? "🎨 مصمم الصور المرئية" : "Gambar Visual AI"}</span>
                <span className="px-1.5 py-0.2 bg-slate-900/80 text-[10px] rounded-md font-mono text-amber-300 border border-amber-400/30">
                  {quota.remaining}/3
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: COPYWRITING STUDIO (GROQ AI + ITERATIVE REVISION BOX)
      ========================================================================== */}
      {activeSubTab === "copywriting" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form & Controls */}
          <div className="lg:col-span-5 space-y-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>{isArabic ? "إعدادات صياغة النص الإعلاني" : "Parameter Naskah"}</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Llama-3.3 70B Engine
              </span>
            </div>

            {/* Language Selection for Output */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isArabic ? "لغة النص الإعلاني المطلوب:" : "Bahasa Naskah yang Dihasilkan:"}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOutputLanguage("id")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    outputLanguage === "id"
                      ? "bg-slate-900 text-emerald-400 shadow-xs font-black"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>🇮🇩 Bahasa Indonesia</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOutputLanguage("ar")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    outputLanguage === "ar"
                      ? "bg-slate-900 text-emerald-400 shadow-xs font-black"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>🇸🇦 اللغة العربية</span>
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {isArabic ? "💡 أفكار سريعة للمزايا التنافسية (USPs):" : "💡 Ide Cepat Nilai Jual (USPs):"}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {copyPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCopyTopic(preset.prompt);
                      setCopyFormat(preset.format);
                    }}
                    className="text-[11px] font-bold bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 hover:border-emerald-300 rounded-xl px-2.5 py-1.5 transition text-start cursor-pointer active:scale-95"
                  >
                    + {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {isArabic ? "فكرة الحملة أو الرسالة التي تريد كتابتها:" : "Topik Promosi / Pesan yang Ingin Disampaikan:"}
              </label>
              <textarea
                value={copyTopic}
                onChange={(e) => setCopyTopic(e.target.value)}
                placeholder={
                  isArabic
                    ? "مثال: دعوة المعتمرين للتسجيل في برنامج ديسمبر 2026 للاستفادة من دفعة 5 ملايين وفنادق قريبة مشياً بدون باص..."
                    : "Contoh: Ajak jamaah daftar Umrah Desember 2026 karena ada promo DP 5 Juta dan hotel dekat tanpa shuttle..."
                }
                rows={3}
                className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Format */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  {isArabic ? "منصة النشر والتنسيق:" : "Format Media:"}
                </label>
                <select
                  value={copyFormat}
                  onChange={(e) => setCopyFormat(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 outline-none focus:border-emerald-500"
                >
                  <option value="WHATSAPP">
                    {isArabic ? "📲 رسالة واتساب للإغلاق والمتابعة" : "📲 WhatsApp Closing / Follow-Up"}
                  </option>
                  <option value="INSTAGRAM">
                    {isArabic ? "📸 كابشن وبوست إنستغرام" : "📸 Instagram Caption & Feed"}
                  </option>
                  <option value="TIKTOK">
                    {isArabic ? "🎬 سيناريو وهوك فيديو تيك توك / ريلز" : "🎬 Script Hook Video TikTok/Reels"}
                  </option>
                  <option value="FACEBOOK">
                    {isArabic ? "👥 منشور وقصة فيسبوك" : "👥 Facebook Story & Post"}
                  </option>
                </select>
              </div>

              {/* Tone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  {isArabic ? "نبرة وأسلوب الحديث:" : "Gaya Bahasa (Tone):"}
                </label>
                <select
                  value={copyTone}
                  onChange={(e) => setCopyTone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 outline-none focus:border-emerald-500"
                >
                  <option value="ISLAMI_SANTUN">
                    {isArabic ? "🌙 إسلامية مهذبة ودافئة" : "🌙 Islami Santun & Hangat"}
                  </option>
                  <option value="PERSUASIF_MENDESAK">
                    {isArabic ? "🔥 إقناعية لحجز المقاعد المحدودة" : "🔥 Persuasif & Kuota Terbatas"}
                  </option>
                  <option value="EDUKATIF_INSPIRATIF">
                    {isArabic ? "📖 تعليمية ملهمة ومحفزة" : "📖 Edukatif & Berpahala"}
                  </option>
                  <option value="SANTAI_AKRAB">
                    {isArabic ? "☕ ودية وسلسة للأصدقاء" : "☕ Santai & Bersahabat"}
                  </option>
                </select>
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">
                {isArabic ? "الجمهور المستهدف:" : "Target Audiens:"}
              </label>
              <select
                value={copyAudience}
                onChange={(e) => setCopyAudience(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 outline-none focus:border-emerald-500"
              >
                <option value="KELUARGA">
                  {isArabic ? "👨‍👩‍👧‍👦 العائلات وبرامج الادخار المشترك" : "👨‍👩‍👧‍👦 Keluarga & Tabungan Bersama"}
                </option>
                <option value="LANSIA">
                  {isArabic ? "👴👵 كبار السن (حاجة للفنادق القريبة مشياً)" : "👴👵 Jamaah Sepuh (Butuh Hotel Dekat Jalan Kaki)"}
                </option>
                <option value="MILENIAL">
                  {isArabic ? "💼 الشباب والموظفون ورجال الأعمال" : "💼 Pekerja Muda / Eksekutif"}
                </option>
                <option value="PENGAJIAN">
                  {isArabic ? "🧕 حلقات الذكر ومجموعات المساجد والندوات" : "🧕 Komunitas Pengajian & Majelis Taklim"}
                </option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              disabled={isGeneratingCopy || !copyTopic.trim()}
              onClick={() => handleGenerateCopy(false)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition active:scale-98 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGeneratingCopy ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isArabic ? "جاري صياغة النص الإعلاني..." : "Meracik Naskah AI..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {isArabic ? "توليد النص الإعلاني الذكي ✨" : "Generate Naskah Copywriting ✨"}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Output & Iterative Revision Box */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-slate-800">
                    {isArabic ? "النص الإعلاني المولّد" : "Hasil Naskah Promosi"}
                  </span>
                  {copyProvider && (
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {copyProvider}
                    </span>
                  )}
                </div>

                {generatedCopy && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">{isArabic ? "تم النسخ!" : "Tersalin!"}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-600" />
                          <span>{isArabic ? "نسخ النص" : "Salin Teks"}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleShareToWhatsApp}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{isArabic ? "إرسال إلى واتساب" : "Kirim ke WA"}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Text Output Body */}
              <div className="p-5 min-h-[260px] bg-white">
                {generatedCopy ? (
                  <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans select-text">
                    {generatedCopy}
                  </div>
                ) : (
                  <div className="h-full py-16 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <PenTool className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-600 text-xs">
                        {isArabic ? "لم يتم توليد أي نص بعد" : "Belum ada naskah yang dibuat"}
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-sm">
                        {isArabic
                          ? "اختر فكرة سريعة أو اكتب موضوع الإعلان من الجانب، ثم اضغط على زر توليد النص الإعلاني."
                          : "Pilih ide cepat atau ketikkan pesan promosi di sebelah kiri, lalu tekan tombol Generate Naskah Copywriting."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* ITERATIVE REVISION BOX */}
              {generatedCopy && (
                <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-50 to-slate-100 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {isArabic
                          ? "صندوق المراجعة والتنقيح التكراري (Iterative Revision Box)"
                          : "Kotak Revisi & Penyesuaian Interaktif (Iterative Box)"}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {isArabic
                        ? "اكتب تعديلاتك لتحديث النص مباشرة"
                        : "Beri masukan jika ingin mengubah gaya atau panjang teks"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={revisionNote}
                      onChange={(e) => setRevisionNote(e.target.value)}
                      placeholder={
                        isArabic
                          ? "مثال: 'اجعله أقصر في فقرتين فقط' أو 'أضف تأكيداً على ميزة طيران القطرية'..."
                          : "Contoh: 'Tolong buat lebih singkat 2 paragraf saja' atau 'Tambahkan penegasan tiket Qatar Airways'..."
                      }
                      className="flex-1 text-xs p-3 rounded-xl border border-slate-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition placeholder:text-slate-400"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleGenerateCopy(true);
                        }
                      }}
                    />

                    <button
                      type="button"
                      disabled={isRevisingCopy || !revisionNote.trim()}
                      onClick={() => handleGenerateCopy(true)}
                      className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {isRevisingCopy ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{isArabic ? "تنقيح النص" : "Perbarui Naskah"}</span>
                    </button>
                  </div>

                  {/* Previous Revision history peek */}
                  {revisionHistory.length > 0 && (
                    <div className="pt-2 text-[10px] text-slate-500">
                      <span>
                        {isArabic
                          ? `سجل المراجعات: تم إجراء ${revisionHistory.length} تعديلات في هذه الجلسة.`
                          : `Riwayat versi: ${revisionHistory.length} revisi tersimpan dalam sesi ini.`}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: IMAGE STUDIO (HUGGING FACE API + DAILY QUOTA 3/3)
      ========================================================================== */}
      {activeSubTab === "image" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Image Controls & Quota Indicator */}
          <div className="lg:col-span-5 space-y-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            {/* Daily Quota Card Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>{isArabic ? "نظام الحصة اليومية للصور المجانية" : "Sistem Kuota Gambar Harian"}</span>
                </span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 font-mono">
                  {quota.remaining} / {quota.maxQuota} {isArabic ? "متبقي" : "Tersisa"}
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    quota.remaining === 0
                      ? "bg-rose-500"
                      : quota.remaining === 1
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${(quota.remaining / quota.maxQuota) * 100}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-600 leading-tight">
                {isArabic
                  ? "يحصل كل مسوق ومسؤول على حصة مجانية تصل إلى 3 صور بالذكاء الاصطناعي يومياً. يتم تجديد الحصة تلقائياً في منتصف الليل (00:00 بتوقيت جاكرتا)."
                  : "Setiap pemasar UBK mendapatkan kuota gratis 3 gambar AI per hari untuk kebutuhan promosi. Kuota diperbarui otomatis setiap tengah malam (00:00 WIB)."}
              </p>
            </div>

            {/* Quota Exhaustion Alert */}
            {quotaError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="font-black text-xs">
                      {isArabic ? "تم استنفاد الحصة اليومية" : "Batas Kuota Hari Ini Tercapai"}
                    </h5>
                    <p className="text-[11px] leading-relaxed text-rose-700">{quotaError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Inspiration Prompts */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {isArabic ? "💡 أفكار ملهمة لتوليد الصور:" : "💡 Inspirasi Prompt Visual Islami:"}
              </label>
              <div className="space-y-1.5">
                {imagePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImagePrompt(preset)}
                    className="w-full text-start text-[11px] p-2 rounded-xl bg-slate-50 hover:bg-amber-50 hover:text-amber-900 text-slate-700 border border-slate-200 hover:border-amber-300 transition cursor-pointer active:scale-98"
                  >
                    "{preset}"
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {isArabic ? "وصف وتفاصيل الصورة المطلوبة (Prompt):" : "Deskripsi Gambar yang Diinginkan (Prompt):"}
              </label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder={
                  isArabic
                    ? "مثال: عائلة معتمرين في ساحة الحرم المكي مع إضاءة ذهبية سينمائية عالية الجودة..."
                    : "Contoh: Jamaah keluarga Indonesia tersenyum di pelataran Masjidil Haram Makkah dengan pencahayaan golden hour..."
                }
                rows={3}
                className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Style Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">
                {isArabic ? "الأسلوب الفني:" : "Gaya Visual:"}
              </label>
              <select
                value={imageStyle}
                onChange={(e) => setImageStyle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 outline-none focus:border-amber-500"
              >
                <option value="realistic">
                  {isArabic ? "📸 تصوير فوتوغرافي واقعي (Realistic 8K)" : "📸 Fotografi Nyata (Realistic 8K Hyper-Detail)"}
                </option>
                <option value="poster">
                  {isArabic ? "🎨 بوستر تسويقي فاخر (Gold & Emerald)" : "🎨 Desain Poster Brosur Mewah (Gold & Emerald)"}
                </option>
                <option value="cinematic">
                  {isArabic ? "🌅 إضاءة ذهبية وسينمائية مؤثرة" : "🌅 Golden Hour Sinematik Khusyuk"}
                </option>
              </select>
            </div>

            {/* Generate Image Button */}
            <button
              type="button"
              disabled={isGeneratingImage || !imagePrompt.trim() || quota.remaining <= 0}
              onClick={handleGenerateImage}
              className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                quota.remaining <= 0
                  ? "bg-slate-200 text-slate-400 pointer-events-none"
                  : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20"
              }`}
            >
              {isGeneratingImage ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>{isArabic ? "جاري رسم وتوليد الصورة..." : "Sedang Merender Gambar AI..."}</span>
                </>
              ) : quota.remaining <= 0 ? (
                <>
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{isArabic ? "استنفدت حصة اليوم (تتجدد غداً)" : "Kuota Hari Ini Habis (Reset Esok)"}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>
                    {isArabic
                      ? `توليد الصورة بالذكاء الاصطناعي (المتبقي ${quota.remaining}) 🎨`
                      : `Generate Gambar AI (Sisa ${quota.remaining}) 🎨`}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Image Preview Canvas & Actions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black text-slate-800">
                    {isArabic ? "معاينة الصورة المولدة" : "Pratinjau Hasil Gambar AI"}
                  </span>
                  {imageProvider && (
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                      {imageProvider}
                    </span>
                  )}
                </div>

                {generatedImageUrl && (
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isArabic ? "تحميل البوستر بالباركود (HD)" : "Download HD + Barcode"}</span>
                  </button>
                )}
              </div>

              {/* Image Display Area */}
              <div className="p-6 min-h-[380px] flex items-center justify-center bg-slate-950 relative overflow-hidden">
                {generatedImageUrl ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative max-w-md w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generatedImageUrl}
                      alt="AI Generated Umrah Visual"
                      className="w-full h-auto object-cover aspect-square"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-4 flex flex-col justify-end">
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                        UBK AI Studio Master
                      </span>
                      <p className="text-xs text-white line-clamp-2">{imagePrompt}</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-20 text-center text-slate-500 space-y-3">
                    <div className="w-16 h-16 rounded-3xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto border border-slate-800">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <p className="font-black text-slate-300 text-xs">
                        {isArabic ? "مساحة عرض الصورة جاهزة" : "Kanvas Gambar Siap"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {isArabic
                          ? "اكتب وصف المشهد أو اختر أحد الاقتراحات السريعة على الجانب، ثم اضغط على زر توليد الصورة."
                          : "Ketikkan deskripsi pemandangan atau pilih salah satu inspirasi prompt di sebelah kiri untuk menghasilkan gambar resolusi tinggi."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Image Info Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isArabic
                      ? "جميع الصور حصرية وخالية من حقوق النشر للاستخدام في الحملات التسويقية المعتمدة لـ UBK Umrah."
                      : "Bebas hak cipta untuk promosi kemitraan resmi UBK Umrah."}
                  </span>
                </div>
                <span className="font-mono text-slate-400">
                  {isArabic ? "الحد الأقصى 3 صور مجانية يومياً" : "Maksimal 3 render gratis / hari"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
