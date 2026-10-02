"use client";

import { useState, useEffect, FormEvent } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { AntiFraudInlineBox, AntiFraudConfirmationModal } from "@/components/AntiFraudPaymentNotice";
import { OFFICIAL_BANK_CONFIG } from "@/lib/bankConfig";

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
  const [hasAgreedBankPolicy, setHasAgreedBankPolicy] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
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

  // Intercept submit to show the mandatory modal
  function handlePreSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      return;
    }
    if (!hasAgreedBankPolicy) {
      alert(
        isArabic
          ? "يُرجى الموافقة على إقرار وتنبيه التحويل إلى الحساب الرسمي للشركة للمتابعة."
          : "Mohon centang persetujuan pembayaran hanya ke rekening resmi PT. UBK untuk melanjutkan."
      );
      return;
    }
    setShowConfirmModal(true);
  }

  async function executeSubmitOrder() {
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
      setShowConfirmModal(false);

      if (res.ok) {
        setResult({ success: true, orderId: data.orderId });
      } else {
        setResult({ success: false, error: data.error || (isArabic ? "تعذر إرسال الطلب" : "Gagal mengirimkan formulir") });
      }
    } catch (err) {
      setLoading(false);
      setShowConfirmModal(false);
      setResult({ success: false, error: isArabic ? "تعذر الاتصال بالخادم" : "Gangguan koneksi jaringan" });
    }
  }

  const handleCopyBank = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(OFFICIAL_BANK_CONFIG.accountNumber);
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2500);
    }
  };

  if (result?.success) {
    const companyWaNumber = "6285110539752";
    const waBookingMsg = `Assalamu'alaikum Warahmatullahi Wabarakatuh,
Saya telah mendaftar layanan ibadah Umrah di UBK Umrah (Umar Bin Alkhattab for Umrah):
• No. Registrasi: #${result.orderId}
• Nama Jamaah: ${name}
• No. WhatsApp: ${phone}
• Pilihan Program: ${packageChoice}${referralCode ? `\n• Kode Konsultan/Referral: ${referralCode}` : ""}

*Catatan:* Saya memahami pembayaran DP resmi dilakukan ke rekening PT. UBK (${OFFICIAL_BANK_CONFIG.bankName}: ${OFFICIAL_BANK_CONFIG.accountNumber}). Mohon konfirmasi jadwal dan persiapan. Terima kasih.

----------------------------------------

السلام عليكم ورحمة الله وبركاته،
لقد قمت بتقديم طلب تسجيل حجز عمرة لدى عمر بن الخطاب للعمرة (UBK):
• رقم الحجز: #${result.orderId}
• اسم المعتمر: ${name}
• رقم الواتساب: ${phone}
• البرنامج المختار: ${packageChoice}${referralCode ? `\n• كود المسوق: ${referralCode}` : ""}

ملاحظة أمنية: تم الاطلاع على التنبيه وسداد الدفعة المقدمة سيكون لحساب شركة PT. UBK الرسمي (${OFFICIAL_BANK_CONFIG.bankName}: ${OFFICIAL_BANK_CONFIG.accountNumber}). أرجو تأكيد الاستلام.`;

    const waHref = `https://wa.me/${companyWaNumber}?text=${encodeURIComponent(waBookingMsg)}`;

    return (
      <div className="text-center py-6 space-y-6">
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-amber-400 text-slate-950 rounded-full flex items-center justify-center mx-auto text-2xl font-black shadow-xl shadow-emerald-500/20">
          ✓
        </div>
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {t("bookingSuccessTitle")}
          </h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
            {t("bookingSuccessMsg", { orderId: result.orderId || 0 })}
          </p>
        </div>

        {/* Bank Details Reminder Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border-2 border-amber-500/60 text-start space-y-2.5 max-w-md mx-auto shadow-xl">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <span>💳 {isArabic ? "الحساب البنكي الرسمي لسداد الدفعة المقدمة" : "Rekening Resmi Pembayaran DP Umrah"}</span>
            <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-bold">
              {isArabic ? "حظر السداد النقدي" : "Dilarang Tunai"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold">{OFFICIAL_BANK_CONFIG.bankName}</div>
              <div className="text-base font-black text-white font-mono tracking-wider">
                {OFFICIAL_BANK_CONFIG.accountNumber}
              </div>
              <div className="text-[10px] text-emerald-400">a.n. {OFFICIAL_BANK_CONFIG.accountHolder}</div>
            </div>

            <button
              type="button"
              onClick={handleCopyBank}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>{copiedBank ? "✓" : "📋"}</span>
              <span>{copiedBank ? (isArabic ? "تم النسخ" : "Tersalin") : (isArabic ? "نسخ" : "Salin")}</span>
            </button>
          </div>

          <p className="text-[10.5px] text-slate-400 leading-relaxed">
            {isArabic
              ? "يرجى الاحتفاظ بإشعار التحويل البنكي وإرساله لإدارة الشركة عبر الواتساب لتأكيد الحجز."
              : "Simpan bukti transfer bank dan kirimkan ke customer service via WhatsApp untuk validasi pemesanan."}
          </p>
        </div>

        {/* WhatsApp Instant Confirmation Button */}
        <div className="pt-2 pb-1 space-y-2 max-w-sm mx-auto">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-4 px-5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-950/60 transition-all duration-300 transform active:scale-95"
          >
            <span className="text-lg">💬</span>
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
              setHasAgreedBankPolicy(false);
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
    <>
      <form onSubmit={handlePreSubmit} className="space-y-4 text-start">
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

        {/* PROMINENT ANTI-FRAUD INLINE CARD WITH OFFICIAL BANK DETAILS */}
        <AntiFraudInlineBox isArabic={isArabic} />

        {/* MANDATORY CHECKBOX DECLARATION */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-amber-500/50 cursor-pointer transition select-none">
          <input
            type="checkbox"
            required
            checked={hasAgreedBankPolicy}
            onChange={(e) => setHasAgreedBankPolicy(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-600 bg-slate-800 shrink-0 cursor-pointer"
          />
          <span className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
            {isArabic ? (
              <>
                <strong className="text-amber-400 font-bold">إقرار أمني إلزامي: </strong>
                أقر بأنني اطلعت على التنبيه، وأتعهد بأن أي سداد للدفعة المقدمة أو الرسوم سيكون حصراً عبر التحويل المباشر لحساب شركة <strong className="text-white">PT. UMAR BIN AL-KHATTAB FOR UMRAH</strong> الرسمي، ولن أقوم بتسليم أي مبالغ للمسوق نقداً أو لحساب شخصي، والشركة غير مسؤولة عن خلاف ذلك.
              </>
            ) : (
              <>
                <strong className="text-amber-400 font-bold">Pernyataan Wajib: </strong>
                Saya menyatakan telah membaca peringatan dan berkomitmen bahwa seluruh pembayaran uang muka (DP) hanya akan ditransfer ke rekening giro resmi <strong className="text-white">PT. UMAR BIN AL-KHATTAB FOR UMRAH</strong>, serta tidak akan menyerahkan uang tunai/transfer ke rekening pribadi mitra pemasar.
              </>
            )}
          </span>
        </label>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 rounded-2xl shadow-xl shadow-emerald-950/60 transition-all duration-300 transform active:scale-95 disabled:opacity-50 relative overflow-hidden cursor-pointer"
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

      {/* MANDATORY PRE-CONFIRMATION MODAL */}
      <AntiFraudConfirmationModal
        isOpen={showConfirmModal}
        isArabic={isArabic}
        onConfirm={executeSubmitOrder}
        onCancel={() => setShowConfirmModal(false)}
        loading={loading}
      />
    </>
  );
}
