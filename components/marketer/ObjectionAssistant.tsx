"use client";

import React, { useState } from "react";
import {
  Bot,
  Check,
  Copy,
  HelpCircle,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface ObjectionAssistantProps {
  marketerName: string;
  marketerPhone?: string | null;
  personalLandingUrl: string;
}

interface QuickObjection {
  id: string;
  chipLabel: string;
  chipLabelAr: string;
  icon: string;
  category: string;
  questionPreview: string;
  scriptTemplate: (ctx: { name: string; url: string }) => string;
}

const QUICK_OBJECTIONS: QuickObjection[] = [
  {
    id: "price-expensive",
    chipLabel: "Harga Terasa Mahal",
    chipLabelAr: "السعر يبدو مرتفعاً",
    icon: "💰",
    category: "Komparasi Nilai",
    questionPreview: '"Paket 30,9 Jt & 31,5 Jt kok kelihatan lebih mahal ya dibanding travel lain?"',
    scriptTemplate: ({ name, url }) =>
      `Assalamu'alaikum Bapak/Ibu, terima kasih atas pertanyaannya. 🙏\n\n` +
      `Sangat wajar jika membandingkan harga. Namun izin kami jelaskan mengapa paket UBK Umrah ini bernilai tinggi (All-In Realistis):\n\n` +
      `1️⃣ *Hotel Tanpa Shuttle (Walking Distance):*\n` +
      `Di Makkah (Jada Ajyad / Kayan Raya 4 Malam) & Madinah (Andalus Salam / Nada Salam 3 Malam) jamaah cukup *jalan kaki santai* ke Masjid. Sangat aman dan nyaman untuk orang tua/lansia, tanpa perlu lelah berdesakan antre bus shuttle.\n\n` +
      `2️⃣ *Penerbangan Premium Qatar Airways:*\n` +
      `Maskapai bintang lima dunia, kenyamanan bagasi dan ketepatan jadwal terjamin.\n\n` +
      `3️⃣ *Gratis Kuliner Khas Albaik & Fasilitas Lengkap:*\n` +
      `Sudah include makan 3x sehari fullboard, welcome drink Zam-zam, visa resmi Siskopatuh Kemenag, dan ziarah lengkap.\n\n` +
      `4️⃣ *Cukup DP Rp 5.000.000:*\n` +
      `Bapak/Ibu tidak perlu melunasi sekarang! Cukup amankan seat dengan DP 5 Juta, sisa pembayaran bisa diangsur fleksibel.\n\n` +
      `Boleh dicek rincian fasilitas resminya di sini ya:\n` +
      `${url}\n\n` +
      `Insya Allah fasilitas yang didapat jauh melebihi selisih harganya. Kapan ada waktu luang untuk kami bantu kuncikan seat-nya? 😊`,
  },
  {
    id: "legal-trust",
    chipLabel: "Legalitas & Keamanan Travel",
    chipLabelAr: "الترخيص والأمان",
    icon: "🛡️",
    category: "Kepercayaan Jamaah",
    questionPreview: '"Apakah travel ini resmi berizin Kemenag? Kantor fisiknya ada di mana?"',
    scriptTemplate: ({ name, url }) =>
      `Assalamu'alaikum Bapak/Ibu. Keamanan dan kepastian ibadah adalah hak utama setiap jamaah. 🕋\n\n` +
      `Alhamdulillah, UBK Umrah (Umar Bin Alkhattab for Umrah) beroperasi dengan legalitas resmi pemerintah:\n\n` +
      `✅ *Izin Resmi Kemenag RI:*\n` +
      `Izin PPIU No. U-271 Tahun 2021 (a.n PT Asma Cipta Wisata / Asma Tour).\n\n` +
      `🏢 *Kantor Operasional Fisik:*\n` +
      `Jl. Citeko No. 86, Cisarua, Bogor, Jawa Barat. Pintu kantor kami selalu terbuka bagi jamaah yang ingin bersilaturahmi atau verifikasi langsung.\n\n` +
      `🎙️ *Pembimbing Ibadah Berpengalaman:*\n` +
      `Khusus periode Desember 2026 dibimbing langsung oleh *Sheikh Dr. Hassan Bugis* bersama *Ummi Nurlaila* sesuai Sunnah Nabi ﷺ.\n\n` +
      `Prinsip kami memegang teguh *5 Pasti Umrah*: Pasti Izinnya, Pasti Jadwalnya, Pasti Terbangnya, Pasti Hotelnya, dan Pasti Visanya.\n\n` +
      `Bapak/Ibu dapat memverifikasi profil kemitraan resmi saya di sini:\n` +
      `${url}\n\n` +
      `Mari kami bantu pendampingan ibadah terbaik untuk keluarga Anda. 🙏`,
  },
  {
    id: "no-full-funds",
    chipLabel: "Belum Ada Dana Lunas",
    chipLabelAr: "لا تتوفر السيولة الكاملة الآن",
    icon: "💳",
    category: "Solusi Finansial",
    questionPreview: '"Saya mau daftar tapi tabungan belum cukup untuk bayar lunas saat ini..."',
    scriptTemplate: ({ name, url }) =>
      `Assalamu'alaikum Bapak/Ibu. Niat baik menuju Baitullah insya Allah selalu dimudahkan jalannya. ✨\n\n` +
      `Kabar baiknya, di UBK Umrah *tidak diwajibkan bayar lunas langsung* saat mendaftar:\n\n` +
      `🔹 *Cukup DP Rp 5.000.000 (Kunci Seat):*\n` +
      `Dengan DP 5 Juta per jamaah, seat penerbangan Qatar Airways dan kamar hotel langsung terkunci atas nama Bapak/Ibu hari ini.\n\n` +
      `🔹 *Garansi Kurs Maksimal (Aman dari Inflasi):*\n` +
      `Kami memberikan garansi kurs maksimal (18.000 USD & 4.800 SAR). Jadi kenaikan kurs mata uang asing di kemudian hari tidak membebani jamaah.\n\n` +
      `🔹 *Program Angsuran Ringan:*\n` +
      `Sisa pembayaran dapat dicicil per bulan hingga 1 bulan sebelum jadwal keberangkatan.\n\n` +
      `Bapak/Ibu bisa coba simulasi hitungan tabungan bulanan mandiri di tautan resmi saya ini:\n` +
      `${url}#simulasi-tabungan\n\n` +
      `Bagaimana kalau kita amankan kuota seat-nya dulu hari ini dengan DP 5 Juta? Kuota promo kamar terbatas ya Bapak/Ibu. 😊`,
  },
];

export function ObjectionAssistant({
  marketerName,
  marketerPhone,
  personalLandingUrl,
}: ObjectionAssistantProps) {
  const { isArabic } = useLanguage();

  const [activeObjectionId, setActiveObjectionId] = useState<string>("price-expensive");
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [generatedScript, setGeneratedScript] = useState<string>(() =>
    QUICK_OBJECTIONS[0].scriptTemplate({
      name: marketerName,
      url: personalLandingUrl || "https://ubk-umrah.vercel.app",
    })
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Handle selecting a predefined objection chip
  const handleSelectChip = (obj: QuickObjection) => {
    setActiveObjectionId(obj.id);
    setCustomQuestion("");
    const script = obj.scriptTemplate({
      name: marketerName,
      url: personalLandingUrl || "https://ubk-umrah.vercel.app",
    });
    setGeneratedScript(script);
  };

  // Generate tailored script for custom input
  const handleGenerateCustom = () => {
    if (!customQuestion.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      const closingCustom =
        `Assalamu'alaikum Bapak/Ibu. Izin menanggapi pertanyaan Anda: "${customQuestion.trim()}" 🙏\n\n` +
        `Alhamdulillah di UBK Umrah, seluruh kebutuhan ibadah Anda telah kami rancang dengan standar tertinggi All-In:\n` +
        `• Bimbingan ibadah terpercaya sesuai Sunnah\n` +
        `• Hotel Makkah & Madinah jalan kaki tanpa shuttle bus\n` +
        `• Maskapai berkelas dunia Qatar Airways PP\n` +
        `• Cukup DP Rp 5.000.000 untuk amankan seat hari ini\n\n` +
        `Bapak/Ibu dapat meninjau detail legalitas resmi (PPIU No. U-271 Tahun 2021) dan jadwal lengkap di laman kemitraan saya:\n` +
        `${personalLandingUrl || "https://ubk-umrah.vercel.app"}\n\n` +
        `Jika berkenan, boleh saya bantu reservasikan seat-nya sebelum kuota kamar hotel dekat Masjid habis? Terima kasih banyak. 😊`;

      setGeneratedScript(closingCustom);
      setIsGenerating(false);
    }, 400);
  };

  const handleCopy = async () => {
    if (!generatedScript) return;
    try {
      await navigator.clipboard.writeText(generatedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Clipboard copy error:", e);
    }
  };

  const activeObjection = QUICK_OBJECTIONS.find((o) => o.id === activeObjectionId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-400/30">
              <Bot className="w-3.5 h-3.5" />
              <span>{isArabic ? "المساعد الذكي للردود الإقناعية" : "1-CLICK OBJECTION HANDLER & CLOSING SCRIPT"}</span>
            </div>
            <h3 className="text-xl font-black text-white">
              {isArabic ? "مساعد الردود الذكية وتخطي الاعتراضات" : "Asisten Cerdas Penjawab Ragu Jamaah"}
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              {isArabic
                ? "حدد اعتراض العميل بنقرة واحدة لتحصل على نص رد احترافي ومقنع يبرز طيران قطر وفنادق المشي والترخيص وDP 5 مليون روبية."
                : "Pilih keraguan calon jamaah di bawah ini untuk menghasilkan skrip jawaban profesional, meyakinkan, dan siap kirim ke WhatsApp."}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              <span>Auto-Closing Ready</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Objection Chips */}
      <div className="space-y-2.5">
        <label className="text-xs font-black uppercase tracking-wider text-slate-500 block">
          {isArabic ? "اختر نوع اعتراض العميل الشائع:" : "Pilih Keraguan / Keberatan Jamaah:"}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {QUICK_OBJECTIONS.map((obj) => {
            const isSelected = activeObjectionId === obj.id && !customQuestion;
            return (
              <button
                key={obj.id}
                type="button"
                onClick={() => handleSelectChip(obj)}
                className={`p-4 rounded-2xl border text-start transition cursor-pointer active:scale-98 ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/25 ring-2 ring-indigo-400/50"
                    : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{obj.icon}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {obj.category}
                  </span>
                </div>
                <h4 className="font-extrabold text-xs">{isArabic ? obj.chipLabelAr : obj.chipLabel}</h4>
                <p
                  className={`text-[11px] mt-1 line-clamp-1 italic ${
                    isSelected ? "text-indigo-100" : "text-slate-400"
                  }`}
                >
                  {obj.questionPreview}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Situation Input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              {isArabic
                ? "أو الصق سؤال/موقف العميل المخصص هنا:"
                : "Atau Paste Pertanyaan Khusus Jamaah dari Chat WhatsApp:"}
            </span>
          </span>
          <span className="text-[10px] text-slate-400">Custom Generator</span>
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder='Contoh: "Bisa gak sekamar berdua sama ibu saya tapi harganya paket hemat?"'
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          <button
            type="button"
            onClick={handleGenerateCustom}
            disabled={!customQuestion.trim() || isGenerating}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? "Menyusun..." : "Susun Skrip"}</span>
          </button>
        </div>
      </div>

      {/* Generated Response Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-300">
              Skrip Jawaban Siap Kirim (Closing Script)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{isArabic ? "تم النسخ!" : "Tersalin!"}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isArabic ? "نسخ النص" : "Salin Skrip"}</span>
                </>
              )}
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(generatedScript)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Buka di WA</span>
            </a>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50">
          <pre
            className="text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed select-all bg-white p-5 rounded-2xl border border-slate-200 shadow-inner"
            dir={isArabic ? "rtl" : "ltr"}
          >
            {generatedScript}
          </pre>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Didukung Izin Resmi Kemenag RI (PPIU No. U-271 Tahun 2021)</span>
            </span>
            <span className="font-mono text-emerald-700 font-bold">
              Kunci Seat: Cukup DP Rp 5.000.000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
