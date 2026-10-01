"use client";

import { useState, FormEvent } from "react";
import { useLanguage } from "@/lib/LanguageContext";

interface FirstTimePasswordModalProps {
  isOpen: boolean;
  username: string;
}

export function FirstTimePasswordModal({
  isOpen,
  username,
}: FirstTimePasswordModalProps) {
  const { t, isArabic } = useLanguage();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activatedCode, setActivatedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError(t("pwdMinLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("pwdMismatch"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/first-time-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setActivatedCode(data.referralCode);
      } else {
        setError(data.error || (isArabic ? "فشل تفعيل الحساب." : "Gagal mengaktifkan akun."));
      }
    } catch (err) {
      setLoading(false);
      setError(isArabic ? "تعذر الاتصال بالخادم." : "Gangguan koneksi server.");
    }
  }

  return (
    <div
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-amber-500/40 text-start relative overflow-hidden">
        {activatedCode ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-amber-400 text-slate-950 rounded-full flex items-center justify-center mx-auto text-3xl font-black shadow-xl shadow-emerald-500/20">
              ✓
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white">
                {t("activationSuccessTitle")}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                {t("activationSuccessDesc")}
              </p>
            </div>

            <div className="p-4 bg-slate-950/90 border border-amber-500/30 rounded-2xl space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">{isArabic ? "كود المسوق الدائم:" : "Kode Referral Permanen:"}</div>
              <div className="font-mono font-black text-amber-300 text-xl tracking-wider">
                {activatedCode}
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xl shadow-emerald-950/60 transition-all duration-300 transform active:scale-95"
            >
              {t("goToMyDashboard")} 🚀
            </button>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6 space-y-2">
              <span className="inline-block text-[10px] font-black text-amber-400 tracking-wider uppercase bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/30">
                {isArabic ? "تفعيل إجباري لكلمة المرور" : t("firstTimeBadge")}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {isArabic ? `مرحباً بك أ/ ${username}` : t("firstTimeTitle", { username })}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                {isArabic
                  ? "لأسباب أمنية، يرجى تعيين كلمة مرور دائمة وسرية خاصة بك للمتابعة إلى لوحة التحكم."
                  : t("firstTimeDesc")}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-semibold rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-300/90 mb-1.5">
                  {t("newPasswordLabel")}
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300/90 mb-1.5">
                  {t("confirmPasswordLabel")}
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 rounded-xl shadow-xl shadow-emerald-950/60 transition-all duration-300 transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? (isArabic ? "جاري الحفظ والتفعيل..." : t("activating")) : (isArabic ? "حفظ كلمة المرور والدخول للوحة التحكم 🚀" : t("activateBtn"))}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
