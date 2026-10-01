"use client";

import { useState, useEffect, FormEvent } from "react";
import { useLanguage } from "@/lib/LanguageContext";

interface MarketerBookingFormProps {
  referralCode: string;
  marketerName: string;
  marketerWhatsapp?: string | null;
  initialPackage?: string;
}

export function MarketerBookingForm({
  referralCode,
  marketerName,
  marketerWhatsapp,
  initialPackage,
}: MarketerBookingFormProps) {
  const { t, isArabic } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [packageChoice, setPackageChoice] = useState(initialPackage || "UMRAH TAYSIR PROGRAM 9 HARI 2026");
  const [dynamicPackages, setDynamicPackages] = useState<Array<{ id: number; title: string; titleAr?: string | null; priceQuad: number; programDays: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    success: boolean;
    orderId?: number;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (initialPackage) {
      setPackageChoice(initialPackage);
    }
  }, [initialPackage]);

  useEffect(() => {
    async function fetchDynamicPackages() {
      try {
        const res = await fetch("/api/packages");
        const data = await res.json();
        if (res.ok && data.packages && data.packages.length > 0) {
          setDynamicPackages(data.packages);
          if (!initialPackage) {
            const first = data.packages[0];
            setPackageChoice(isArabic && first.titleAr ? first.titleAr : first.title);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchDynamicPackages();
  }, [initialPackage, isArabic]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOrderResult(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          referralCode: referralCode,
          package: packageChoice,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setOrderResult({ success: true, orderId: data.orderId });
      } else {
        setOrderResult({
          success: false,
          error: data.error || (isArabic ? "تعذر إرسال الطلب" : "Gagal mengirimkan formulir pendaftaran."),
        });
      }
    } catch (err) {
      setLoading(false);
      setOrderResult({
        success: false,
        error: isArabic ? "تعذر الاتصال بالخادم" : "Terjadi kesalahan jaringan. Silakan coba kembali.",
      });
    }
  }

  if (orderResult?.success) {
    const rawTargetPhone = (marketerWhatsapp || "6281234567890").replace(/\D/g, "");
    const cleanWaNumber = rawTargetPhone.startsWith("0") ? "62" + rawTargetPhone.substring(1) : rawTargetPhone;
    
    const waBookingMsg = `Assalamu'alaikum Bapak/Ibu ${marketerName},
Saya telah mendaftar layanan ibadah Umrah melalui halaman resmi kemitraan Anda:
• No. Registrasi: #${orderResult.orderId}
• Nama Jamaah: ${name}
• No. WhatsApp: ${phone}
• Pilihan Paket: ${packageChoice}
• Kode Referral: ${referralCode}

Mohon konfirmasi pendaftaran dan panduan tahapan selanjutnya. Terima kasih.

----------------------------------------

السلام عليكم أ/ ${marketerName}،
لقد قمت بحجز رحلة العمرة عبر صفحتك المعتمدة:
• رقم الحجز: #${orderResult.orderId}
• اسم المعتمر: ${name}
• رقم الواتساب: ${phone}
• الباقة المختارة: ${packageChoice}
• كود الإحالة: ${referralCode}

أرجو تأكيد استلام الحجز وموافاتي بالخطوات ومواعيد السفر القادمة. شكراً لك وبارك الله فيك.`;

    const waHref = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(waBookingMsg)}`;

    return (
      <div className="text-center py-6 space-y-5">
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-amber-400 text-slate-950 rounded-full flex items-center justify-center mx-auto text-2xl font-black shadow-xl shadow-emerald-500/20">
          ✓
        </div>
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {t("bookingSuccessTitle")}
          </h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
            {t("bookingSuccessMsg", { orderId: orderResult.orderId || 0 })}
          </p>
        </div>

        {/* Instant WhatsApp confirmation to Marketer */}
        <div className="pt-2 pb-1 space-y-2 max-w-sm mx-auto">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-4 px-5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-950/60 transition-all duration-300 transform active:scale-95"
          >
            <span className="text-lg">💬</span>
            <span>{t("sendWaToConsultant")}</span>
          </a>
          <p className="text-[11px] text-slate-400">
            {t("waConfirmationSubtext")}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setOrderResult(null);
              setName("");
              setEmail("");
              setPhone("");
            }}
            className="text-xs font-bold text-amber-300 hover:text-amber-200 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 px-5 py-2.5 rounded-xl transition"
          >
            {t("registerAnother")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-start">
      {orderResult?.error && (
        <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-semibold rounded-xl">
          {orderResult.error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-amber-300/90 mb-1.5">
          {t("fullName")}
        </label>
        <input
          type="text"
          required
          placeholder={t("fullNamePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3.5 text-sm bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-amber-300/90 mb-1.5">
            {t("waNumber")}
          </label>
          <input
            type="tel"
            required
            placeholder="081234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3.5 text-sm bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 font-mono transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-amber-300/90 mb-1.5">
            {t("emailAddress")}
          </label>
          <input
            type="email"
            required
            placeholder="nama@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 text-sm bg-slate-900/90 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-amber-300/90 mb-1.5">
          {t("selectPackage")}
        </label>
        <select
          value={packageChoice}
          onChange={(e) => setPackageChoice(e.target.value)}
          className="w-full px-4 py-3.5 text-sm bg-slate-900/90 border border-slate-700 text-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
        >
          {dynamicPackages.length > 0 ? (
            dynamicPackages.map((p) => {
              const label = isArabic && p.titleAr ? p.titleAr : p.title;
              return (
                <option key={p.id} value={label} className="bg-slate-900 text-white">
                  {label} ({p.programDays} {isArabic ? "أيام" : "Hari"} • Rp {Math.round(p.priceQuad / 1000000)} JT)
                </option>
              );
            })
          ) : (
            <>
              <option value="Paket Reguler 9 Hari" className="bg-slate-900 text-white">{t("pkg1Title")} ({t("pkg1Price")})</option>
              <option value="Paket VIP 12 Hari" className="bg-slate-900 text-white">{t("pkg2Title")} ({t("pkg2Price")})</option>
              <option value="Paket Plus Turki / Dubai" className="bg-slate-900 text-white">{t("pkg3Title")} ({t("pkg3Price")})</option>
            </>
          )}
        </select>
      </div>

      {/* Locked Marketer Referral Attribution Badge */}
      <div>
        <label className="block text-xs font-bold text-slate-400 mb-1.5">
          {t("refCodeLocked")}
        </label>
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 px-4 py-3 rounded-xl text-xs font-mono font-bold text-amber-300 shadow-inner">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span className="tracking-wider">{referralCode}</span>
          </div>
          <span className="text-[11px] font-sans font-normal text-slate-400">
            {t("officialPartner")}: <strong className="text-amber-300 font-bold">{marketerName}</strong>
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 rounded-2xl shadow-xl shadow-emerald-950/60 transition-all duration-300 transform active:scale-95 disabled:opacity-50 relative overflow-hidden before:absolute before:inset-0 before:bg-white/30 before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <span>{loading ? t("submitting") : t("submitBooking")}</span>
          <span>🕋</span>
        </span>
      </button>

      <p className="text-[11px] text-center text-slate-400">
        {t("dataProtected")}
      </p>
    </form>
  );
}
