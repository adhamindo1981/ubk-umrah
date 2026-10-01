"use client";

import { useState, useEffect, FormEvent } from "react";
import { useLanguage } from "@/lib/LanguageContext";

interface GeneralBookingFormProps {
  initialPackage?: string;
}

export function GeneralBookingForm({ initialPackage }: GeneralBookingFormProps = {}) {
  const { t, isArabic } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [packageChoice, setPackageChoice] = useState(initialPackage || "UMRAH TAYSIR PROGRAM 9 HARI 2026");
  const [dynamicPackages, setDynamicPackages] = useState<Array<{ id: number; title: string; titleAr?: string | null; priceQuad: number; programDays: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; orderId?: number; error?: string } | null>(null);

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
    setResult(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          referralCode: referralCode.trim() || undefined,
          package: packageChoice,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setResult({ success: true, orderId: data.orderId });
      } else {
        setResult({ success: false, error: data.error || (isArabic ? "تعذر إرسال الطلب" : "Gagal mengirimkan formulir") });
      }
    } catch (err) {
      setLoading(false);
      setResult({ success: false, error: isArabic ? "تعذر الاتصال بالخادم" : "Gangguan koneksi jaringan" });
    }
  }

  if (result?.success) {
    const companyWaNumber = "6285110539752";
    const waBookingMsg = `Assalamu'alaikum Warahmatullahi Wabarakatuh,
Saya telah mendaftar layanan ibadah Umrah di UBK Umrah (Umar Bin Alkhattab for Umrah):
• No. Registrasi: #${result.orderId}
• Nama Jamaah: ${name}
• No. WhatsApp: ${phone}
• Pilihan Program: ${packageChoice}${referralCode ? `\n• Kode Konsultan/Referral: ${referralCode}` : ""}

Mohon konfirmasi pendaftaran dan informasi jadwal serta persiapan selanjutnya. Terima kasih.

----------------------------------------

السلام عليكم ورحمة الله وبركاته،
لقد قمت بتقديم طلب تسجيل حجز عمرة لدى عمر بن الخطاب للعمرة (UBK):
• رقم الحجز: #${result.orderId}
• اسم المعتمر: ${name}
• رقم الواتساب: ${phone}
• البرنامج المختار: ${packageChoice}${referralCode ? `\n• كود المسوق: ${referralCode}` : ""}

أرجو تأكيد استلام الحجز وموافاتي بالخطوات ومواعيد السفر القادمة. بارك الله فيكم.`;

    const waHref = `https://wa.me/${companyWaNumber}?text=${encodeURIComponent(waBookingMsg)}`;

    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          ✓
        </div>
        <h3 className="text-xl font-black text-slate-900">
          {t("bookingSuccessTitle")}
        </h3>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          {t("bookingSuccessMsg", { orderId: result.orderId || 0 })}
        </p>

        {/* WhatsApp Instant Confirmation Button */}
        <div className="pt-2 pb-1 space-y-2 max-w-sm mx-auto">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition"
          >
            <span>💬</span>
            <span>{t("sendWaConfirmation")}</span>
          </a>
          <p className="text-[11px] text-slate-400">
            {t("waConfirmationSubtext")}
          </p>
        </div>

        <div>
          <button
            onClick={() => {
              setResult(null);
              setName("");
              setEmail("");
              setPhone("");
              setReferralCode("");
            }}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2 rounded-xl transition"
          >
            {t("registerAnother")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {result?.error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
          {result.error}
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

      <div>
        <label className="block text-xs font-bold text-slate-400 mb-1.5">
          {t("refCodeLabel")}
        </label>
        <input
          type="text"
          placeholder="UBK-XXXXX"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="w-full px-4 py-3.5 text-sm bg-slate-900/90 border border-slate-700 text-amber-300 placeholder:text-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 font-mono transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 text-sm font-black text-white bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-2xl shadow-xl shadow-emerald-700/25 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 relative overflow-hidden before:absolute before:inset-0 before:bg-white/20 before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700"
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
