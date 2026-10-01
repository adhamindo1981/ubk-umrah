"use client";

import { useState, FormEvent } from "react";
import { useLanguage } from "@/lib/LanguageContext";

interface MarketerActionsProps {
  availableIDR: number;
  initialBankName: string;
  initialBankAccountNumber: string;
  initialBankAccountName: string;
  initialIdNumber: string;
  initialWhatsapp: string;
  initialSubMarketerShare: number;
}

export function MarketerActions({
  availableIDR,
  initialBankName,
  initialBankAccountNumber,
  initialBankAccountName,
  initialIdNumber,
  initialWhatsapp,
  initialSubMarketerShare,
}: MarketerActionsProps) {
  const { t, isArabic } = useLanguage();
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Maximum multiple of Rp 500.000
  const maxMultipleOf500k = Math.floor(availableIDR / 500000) * 500000;

  // Payout Form state
  const [amountToWithdraw, setAmountToWithdraw] = useState<number>(
    maxMultipleOf500k >= 500000 ? maxMultipleOf500k : 500000
  );
  const [bankInfo, setBankInfo] = useState(
    initialBankAccountNumber
      ? `${initialBankName || 'Bank'} - ${initialBankAccountNumber} (a.n. ${initialBankAccountName || '-'})`
      : ""
  );
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null);

  // Profile Form state
  const [whatsapp, setWhatsapp] = useState(initialWhatsapp || "");
  const [bankName, setBankName] = useState(initialBankName || "BCA");
  const [bankAccountNumber, setBankAccountNumber] = useState(initialBankAccountNumber || "");
  const [bankAccountName, setBankAccountName] = useState(initialBankAccountName || "");
  const [idNumber, setIdNumber] = useState(initialIdNumber || "");
  const [subMarketerShare, setSubMarketerShare] = useState<number>(initialSubMarketerShare || 350000);
  const [newPassword, setNewPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Submit Payout Request in IDR
  async function handlePayoutSubmit(e: FormEvent) {
    e.preventDefault();
    setPayoutLoading(true);
    setPayoutMsg(null);

    if (amountToWithdraw < 500000 || amountToWithdraw % 500000 !== 0) {
      setPayoutLoading(false);
      setPayoutMsg(
        isArabic
          ? "يجب أن يكون السحب بمبلغ 500,000 روبية على الأقل وبمضاعفات الـ 500,000 (مثل: 500 ألف، 1 مليون، 1.5 مليون... إلخ)."
          : "Penarikan harus minimal Rp 500.000 dan dalam kelipatan Rp 500.000 (contoh: 500.000, 1.000.000, 1.500.000, dst)."
      );
      return;
    }

    if (amountToWithdraw > availableIDR) {
      setPayoutLoading(false);
      setPayoutMsg(
        isArabic
          ? `رصيدك المتاح حالياً هو Rp ${availableIDR.toLocaleString("id-ID")} فقط.`
          : `Saldo aktif Anda hanya sebesar Rp ${availableIDR.toLocaleString("id-ID")}`
      );
      return;
    }

    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountToWithdraw, bankInfo }),
      });

      const data = await res.json();
      setPayoutLoading(false);

      if (!res.ok) {
        setPayoutMsg(data.error || (isArabic ? "فشل إرسال طلب السحب." : "Gagal mengajukan penarikan dana."));
      } else {
        setPayoutMsg(
          isArabic
            ? "تم تقديم طلب السحب بنجاح وجاري مراجعته من قبل القسم المالي في UBK."
            : "Permintaan penarikan komisi berhasil diajukan dan sedang diproses tim keuangan UBK."
        );
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      setPayoutLoading(false);
      setPayoutMsg(isArabic ? "تعذر الاتصال بالخادم." : "Terjadi gangguan koneksi ke server.");
    }
  }

  // Submit Profile Update
  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);

    try {
      const res = await fetch("/api/marketer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsapp: whatsapp.trim(),
          bankName,
          bankAccountNumber: bankAccountNumber.trim(),
          bankAccountName: bankAccountName.trim(),
          idNumber: idNumber.trim(),
          subMarketerShare: Number(subMarketerShare),
          newPassword: newPassword ? newPassword : undefined,
        }),
      });

      const data = await res.json();
      setProfileLoading(false);

      if (!res.ok) {
        setProfileMsg(data.error || (isArabic ? "فشل حفظ البيانات." : "Gagal menyimpan pengaturan profil."));
      } else {
        setProfileMsg(isArabic ? "تم تحديث البيانات والإعدادات بنجاح!" : "Data profil dan rekening berhasil diperbarui!");
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      setProfileLoading(false);
      setProfileMsg(isArabic ? "تعذر الاتصال بالخادم." : "Terjadi gangguan koneksi ke server.");
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={() => setShowPayoutModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition inline-flex items-center gap-2"
        >
          {t("withdrawFunds")}
        </button>

        <button
          onClick={() => setShowProfileModal(true)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition border border-slate-300 inline-flex items-center gap-2"
        >
          {t("settingsBank")}
        </button>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
          dir={isArabic ? "rtl" : "ltr"}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 text-start">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {isArabic ? "طلب سحب رصيد المكافآت (روبية)" : "Penarikan Saldo Komisi (IDR)"}
            </h3>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mb-4 text-xs text-amber-900 leading-relaxed font-semibold">
              {isArabic
                ? "⚠️ شروط السحب: الحد الأدنى 500,000 روبية وبمضاعفات الـ 500,000 (500 ألف، 1 مليون، 1.5 مليون... إلخ)."
                : "⚠️ Ketentuan Penarikan: Minimal Rp 500.000 dan dalam kelipatan Rp 500.000 (Rp 500rb, 1jt, 1.5jt, dst)."}
            </div>

            <p className="text-xs text-slate-500 mb-4">
              {isArabic ? "الرصيد المتاح للسحب:" : "Saldo aktif yang siap ditarik:"}{" "}
              <strong className="text-emerald-700 font-bold font-mono">Rp {availableIDR.toLocaleString("id-ID")}</strong>
            </p>

            {payoutMsg && (
              <div className="mb-4 text-xs font-semibold p-3 rounded-xl bg-slate-100 text-slate-800 border border-slate-300">
                {payoutMsg}
              </div>
            )}

            {availableIDR < 500000 ? (
              <div className="text-center py-4">
                <p className="text-sm font-bold text-rose-600 mb-2">
                  {isArabic ? "الرصيد غير كافٍ للسحب" : "Saldo Belum Mencukupi"}
                </p>
                <p className="text-xs text-slate-500">
                  {isArabic
                    ? "يتطلب السحب رصيداً لا يقل عن 500,000 روبية. يمكنك تحصيل المكافآت بدعوة معتمرين جدد أو توسيع فريقك التسويقي!"
                    : "Anda memerlukan minimal Rp 500.000 untuk melakukan penarikan. Dapatkan komisi dengan mengajak jamaah umrah atau memperluas tim kemitraan Anda!"}
                </p>
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="mt-4 px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  {isArabic ? "إغلاق" : "Tutup"}
                </button>
              </div>
            ) : (
              <form onSubmit={handlePayoutSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isArabic ? "مبلغ السحب (مضاعفات 500,000 روبية)" : "Nominal Penarikan (Kelipatan Rp 500.000)"}
                  </label>
                  <input
                    type="number"
                    step={500000}
                    min={500000}
                    max={maxMultipleOf500k}
                    value={amountToWithdraw}
                    onChange={(e) => setAmountToWithdraw(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                    required
                  />
                  <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                    {isArabic ? "إجمالي المبلغ:" : "Total Diterima:"} Rp {amountToWithdraw.toLocaleString("id-ID")}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isArabic ? "بيانات الحساب البنكي / المحفظة ورقم الحساب" : "Tujuan Transfer (Bank / E-Wallet & No Rekening)"}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={
                      isArabic
                        ? "مثال: BCA - 1234567890 باسم محمد فكري أو محفظة GoPay: 08123456789"
                        : "Contoh: BCA - 1234567890 a.n Muhammad Fikri atau GoPay: 08123456789"
                    }
                    value={bankInfo}
                    onChange={(e) => setBankInfo(e.target.value)}
                    className="w-full px-4 py-2 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    {isArabic ? "إلغاء" : "Batal"}
                  </button>
                  <button
                    type="submit"
                    disabled={payoutLoading}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
                  >
                    {payoutLoading
                      ? (isArabic ? "جاري الإرسال..." : "Mengirim...")
                      : (isArabic ? "إرسال طلب السحب" : "Kirim Permintaan Tarik Dana")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Profile & Team Settings Modal */}
      {showProfileModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
          dir={isArabic ? "rtl" : "ltr"}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-start">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {isArabic ? "الملف الشخصي وإعدادات الفريق" : "Profil & Pengaturan Kemitraan"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {isArabic
                ? "أدخل بيانات حسابك البنكي في إندونيسيا وحدد نسبة المكافأة لأعضاء فريقك التسويقي."
                : "Lengkapi data rekening bank Anda di Indonesia dan atur rasio bagi hasil untuk tim mitra di bawah Anda."}
            </p>

            {profileMsg && (
              <div className="mb-4 text-xs font-semibold p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isArabic ? "رقم الواتساب النشط (إندونيسيا)" : "Nomor WhatsApp Aktif (Indonesia)"}
                </label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isArabic ? "اسم البنك / المحفظة الإلكترونية" : "Nama Bank / E-Wallet"}
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="BCA">BCA (Bank Central Asia)</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="BRI">Bank BRI</option>
                    <option value="BNI">Bank BNI</option>
                    <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                    <option value="GoPay">GoPay</option>
                    <option value="OVO">OVO</option>
                    <option value="DANA">DANA</option>
                    <option value="Lainnya">{isArabic ? "بنك آخر" : "Bank Lainnya"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isArabic ? "رقم الحساب / رقم المحفظة" : "Nomor Rekening / No. HP E-Wallet"}
                  </label>
                  <input
                    type="text"
                    placeholder="Nomor Rekening"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isArabic ? "اسم صاحب الحساب (كما في الحساب البنكي)" : "Nama Pemilik Rekening (Sesuai Buku Tabungan)"}
                </label>
                <input
                  type="text"
                  placeholder="Nama Lengkap Pemilik"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isArabic ? "رقم الهوية الوطنية / NIK (إندونيسيا)" : "Nomor KTP / NIK"}
                </label>
                <input
                  type="text"
                  placeholder="16 Digit NIK KTP"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                  dir="ltr"
                />
              </div>

              {/* Commission Share for Sub-Marketers in Tree */}
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-2">
                <label className="block text-xs font-extrabold text-emerald-950">
                  {isArabic ? "توزيع أرباح الفريق التسويقي (Sub-Marketer Share)" : "Bagi Hasil Tim Mitra Binaan (Sub-Marketer Share)"}
                </label>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {isArabic
                    ? "من إجمالي العمولة المخصصة (500,000 روبية) لكل معتمر، حدد مقدار المكافأة المخصصة للمسوق التابع لك:"
                    : "Dari total Rp 500.000 yang diberikan UBK per jamaah, tentukan berapa komisi yang Anda berikan kepada mitra di bawah jaringan Anda:"}
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step={10000}
                    min={100000}
                    max={500000}
                    value={subMarketerShare}
                    onChange={(e) => setSubMarketerShare(Number(e.target.value))}
                    className="w-36 px-3 py-2 text-sm border border-emerald-300 rounded-xl outline-none font-mono font-bold"
                  />
                  <div className="text-xs text-emerald-900 font-semibold">
                    <div>
                      {isArabic ? "مكافأة المسوّق التابع لك:" : "Mitra Anda dapat:"}{" "}
                      <strong className="font-mono">Rp {subMarketerShare.toLocaleString("id-ID")}</strong>
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      {isArabic ? "مكافأة الإشراف لك:" : "Bonus Sponsor Anda:"}{" "}
                      <strong className="font-mono">Rp {(500000 - subMarketerShare).toLocaleString("id-ID")}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isArabic ? "تغيير كلمة المرور (اختياري)" : "Ganti Kata Sandi / Password Baru (Opsional)"}
                </label>
                <input
                  type="password"
                  placeholder={isArabic ? "اتركه فارغاً إذا كنت لا ترغب بالتغيير" : "Kosongkan jika tidak ingin mengubah"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  {isArabic ? "إلغاء" : "Batal"}
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition"
                >
                  {profileLoading
                    ? (isArabic ? "جاري الحفظ..." : "Menyimpan…")
                    : (isArabic ? "حفظ التغييرات" : "Simpan Pengaturan")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
