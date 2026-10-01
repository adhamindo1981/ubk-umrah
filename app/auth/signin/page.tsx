"use client";

import { useState, FormEvent, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BackButton } from "@/components/BackButton";
import { IslamicPattern } from "@/components/IslamicPattern";
import { UbkLogo } from "@/components/UbkLogo";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { t, isArabic } = useLanguage();

  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const isAdminRedirect = callbackUrl === "/admin";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error.includes("موافقة") || result.error.includes("persetujuan")) {
        setError(t("unapprovedError"));
      } else {
        setError(result.error !== "CredentialsSignin" ? result.error : t("invalidCreds"));
      }
    } else {
      // Fetch user session to determine role-based destination
      const session = await getSession();
      const userRole = (session?.user as any)?.role;

      if (userRole === "ADMIN") {
        router.push("/admin");
      } else if (callbackUrl && callbackUrl !== "/admin") {
        router.push(callbackUrl);
      } else {
        router.push("/dashboard");
      }
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans transition-all selection:bg-amber-400 selection:text-slate-950 overflow-hidden"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Islamic Background Arabesque Texture */}
      <IslamicPattern opacity={0.06} color="#fbbf24" scale={72} />

      <div className="w-full max-w-md rounded-3xl bg-slate-900/90 backdrop-blur-md p-8 sm:p-9 shadow-2xl border border-amber-500/30 relative z-10">
        {/* Top Control Bar with Back Button and Language Switcher */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <BackButton fallbackUrl="/" />
          <LanguageSwitcher />
        </div>

        {/* Brand / Logo */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Link href="/" className="hover:opacity-95 transition mb-3">
            <UbkLogo size="md" variant="dark" animated={true} />
          </Link>
          <h2 className="text-2xl font-black text-white">
            {t("signInTitle")}
          </h2>
        </div>

        {isAdminRedirect ? (
          <div className="mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 text-center text-xs text-amber-300 font-semibold leading-relaxed">
            {t("signInAdminRequired")}
          </div>
        ) : (
          <p className="mb-6 text-center text-xs text-slate-400">
            {t("signInSubtitle")}
          </p>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-rose-950/80 border border-rose-500/50 p-4 text-xs text-rose-200 leading-relaxed font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-xs font-bold text-amber-300/90 mb-1.5">
              {t("usernameOrEmail")}
            </label>
            <input
              id="identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3.5 text-sm bg-slate-950/90 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
              placeholder={t("usernamePlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-amber-300/90 mb-1.5">
              {t("passwordLabel")}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 text-sm bg-slate-950/90 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 rounded-2xl shadow-xl shadow-emerald-950/60 transition-all duration-300 transform active:scale-95 disabled:opacity-50 relative overflow-hidden"
          >
            {loading ? t("signingIn") : t("signInBtn")}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400 space-y-1">
          <div>{t("noAccountText")}</div>
          <Link
            href="/auth/signup"
            className="inline-block font-extrabold text-amber-400 hover:text-amber-300 transition"
          >
            {t("invitationNoticeLink")} →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
          Loading...
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
