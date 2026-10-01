"use client";

import { useState, FormEvent } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";

interface InviteMarketerModalProps {
  isAdmin?: boolean;
}

interface CreatedMarketerInfo {
  id: number;
  username: string;
  email: string;
  whatsapp?: string;
  tempPassword: string;
  referralCode: string;
  personalPageUrl: string;
  loginUrl: string;
}

export function InviteMarketerModal({ isAdmin = false }: InviteMarketerModalProps) {
  const router = useRouter();
  const { t, isArabic } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [subMarketerShare, setSubMarketerShare] = useState(350000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [createdInfo, setCreatedInfo] = useState<CreatedMarketerInfo | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch("/api/marketer/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          subMarketerShare: Number(subMarketerShare),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.marketer) {
        setCreatedInfo(data.marketer);
      } else {
        setError(data.error || (isArabic ? "فشل إنشاء حساب المسوق." : "Gagal membuat akun mitra."));
      }
    } catch (err) {
      setLoading(false);
      setError(isArabic ? "تعذر الاتصال بالخادم." : "Terjadi gangguan koneksi jaringan.");
    }
  }

  // Generate standardized onboarding message
  const rawWa = createdInfo?.whatsapp || "";
  const cleanWaNumber = rawWa.replace(/\D/g, "");
  const waTarget = cleanWaNumber.startsWith("0") ? "62" + cleanWaNumber.substring(1) : cleanWaNumber;

  const fullMessage = createdInfo
    ? `Assalamu'alaikum wr. wb. Bapak/Ibu ${createdInfo.username},
Selamat, Anda telah resmi terdaftar sebagai Mitra Pemasar resmi UBK Umrah (Umar Bin Alkhattab for Umrah).

📋 *Informasi Akses Dasbor Kemitraan:*
• Link Login: ${createdInfo.loginUrl}
• Username: ${createdInfo.username}
• Kata Sandi Sementara: ${createdInfo.tempPassword}

🌐 *Link Halaman Pemasaran Khusus Anda:*
${createdInfo.personalPageUrl}

⚠️ *Catatan Penting:* Saat pertama kali login, sistem akan mewajibkan penggantian kata sandi dengan kata sandi rahasia permanen Anda.

----------------------------------------

السلام عليكم ورحمة الله وبركاته أ/ ${createdInfo.username}،
تهانينا، تم تسجيلك واعتمادك رسمياً كمسوق معتمد لبرامج العمرة لدى عمر بن الخطاب للعمرة (UBK).

📋 *بيانات الدخول للوحة التحكم الخاصة بك:*
• رابط الدخول: ${createdInfo.loginUrl}
• اسم المستخدم: ${createdInfo.username}
• كلمة المرور المؤقتة: ${createdInfo.tempPassword}

🌐 *رابط صفحتك التسويقية المعتمدة لاستقبال الحجوزات:*
${createdInfo.personalPageUrl}

⚠️ *ملاحظة هامة:* عند تسجيل الدخول لأول مرة، سيطلب منك النظام إجبارياً تعيين كلمة مرور جديدة وسرية لحسابك.

نسأل الله لكم التوفيق والبركة.`
    : "";

  const shareWaHref = createdInfo
    ? `https://wa.me/${waTarget}?text=${encodeURIComponent(fullMessage)}`
    : "";

  async function handleCopy() {
    if (!fullMessage) return;
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (_) {
      // Fallback
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setCreatedInfo(null);
          setError(null);
          setCopied(false);
        }}
        className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-950/40 inline-flex items-center gap-1.5"
      >
        <span>➕</span>
        <span>{isAdmin ? (isArabic ? "إنشاء مسوق جديد" : "Tambah Mitra Baru") : t("addTeamMember")}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all"
          dir={isArabic ? "rtl" : "ltr"}
        >
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-amber-500/30 text-start relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤝</span>
                <h3 className="text-base font-black text-white">
                  {isAdmin
                    ? (isArabic ? "إنشاء وتفعيل حساب مسوق جديد" : "Registrasi Akun Mitra Baru")
                    : t("inviteTitle")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (createdInfo) router.refresh();
                }}
                className="text-slate-400 hover:text-white font-bold p-1 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {createdInfo ? (
              <div className="space-y-5">
                {/* Success Accreditation Card */}
                <div className="p-5 bg-slate-950/90 border border-emerald-500/40 rounded-2xl space-y-3 relative overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center">
                      ✓
                    </span>
                    <span className="text-xs font-black text-emerald-300">
                      {isArabic ? "تم إنشاء وتفعيل حساب المسوق وصفحته بنجاح!" : "Akun Mitra & Halaman Resmi Berhasil Dibuat!"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{isArabic ? "اسم المسوق:" : "Username:"}</div>
                      <div className="text-sm font-black text-white">{createdInfo.username}</div>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{isArabic ? "كود الإحالة الرسمي:" : "Kode Referral:"}</div>
                      <div className="text-sm font-mono font-black text-amber-300">{createdInfo.referralCode}</div>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-amber-500/30 sm:col-span-2">
                      <div className="text-[10px] text-amber-400 font-bold uppercase">{isArabic ? "كلمة المرور المؤقتة (لأول دخول):" : "Kata Sandi Sementara:"}</div>
                      <div className="text-base font-mono font-black text-emerald-400 tracking-wider select-all">{createdInfo.tempPassword}</div>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 sm:col-span-2 space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{isArabic ? "رابط صفحته الشخصية المباشر:" : "Link Halaman Pribadi:"}</div>
                      <a
                        href={createdInfo.personalPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono font-bold text-amber-300 hover:underline break-all block"
                      >
                        {createdInfo.personalPageUrl} ↗
                      </a>
                    </div>
                  </div>

                  {/* Mandatory Password Change Reminder */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2">
                    <span>🔒</span>
                    <span>
                      {isArabic
                        ? "سيتعين على المسوق إجبارياً تعيين كلمة مرور جديدة سرية ودائمة بمجرد تسجيل دخوله لأول مرة."
                        : "Mitra akan diwajibkan mengganti kata sandi secara permanen saat pertama kali login ke dasbor."}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition shadow-sm flex items-center justify-center gap-2"
                    >
                      <span>📋</span>
                      <span>{copied ? (isArabic ? "تم النسخ بنجاح! ✓" : "Tersalin! ✓") : (isArabic ? "نسخ رسالة البيانات" : "Salin Format Info")}</span>
                    </button>

                    <a
                      href={shareWaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2"
                    >
                      <span>💬</span>
                      <span>{isArabic ? "إرسال عبر واتساب" : "Kirim via WhatsApp"}</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.refresh();
                    }}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition border border-slate-800"
                  >
                    {isArabic ? "إغلاق وتحديث القائمة" : "Tutup & Muat Ulang"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isAdmin
                    ? (isArabic
                        ? "أدخل بيانات المسوق الجديد ليقوم النظام بإنشاء كلمة مرور مؤقتة وتوليد رابط صفحته التسويقية فوراً لتزويده بها."
                        : "Masukkan data calon mitra untuk otomatis men-generate kata sandi sementara dan link halaman resminya.")
                    : t("inviteSubtitle")}
                </p>

                {error && (
                  <div className="p-3 bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-semibold rounded-xl">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-amber-300/90 mb-1.5">
                    {t("marketerUsername")}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ahmad_umrah"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 text-xs bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 font-mono transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300/90 mb-1.5">
                    {t("marketerEmail")}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ahmad@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 text-xs bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300/90 mb-1.5">
                    {t("marketerWa")}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-3 text-xs bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 font-mono transition"
                  />
                </div>

                {!isAdmin && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-300">
                        {t("subMarketerShareLabel")}
                      </label>
                      <span className="text-xs font-black text-amber-400 font-mono">
                        Rp {Number(subMarketerShare).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={100000}
                      max={450000}
                      step={25000}
                      value={subMarketerShare}
                      onChange={(e) => setSubMarketerShare(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>Rp 100.000</span>
                      <span>Rp 450.000</span>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 rounded-xl shadow-xl shadow-emerald-950/50 transition-all duration-300 transform active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (isArabic ? "جاري الإنشاء وتوليد الروابط..." : "Membuat Akun & Link...") : (isArabic ? "إنشاء الحساب وتوليد الرابط الآن 🚀" : "Buat Akun & Terbitkan Link 🚀")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
