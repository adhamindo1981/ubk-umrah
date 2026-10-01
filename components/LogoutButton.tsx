"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/lib/LanguageContext";

export interface LogoutButtonProps {
  /** Visual variant tailored for dark navbar (admin) or light navbar (dashboard) */
  variant?: "dark" | "light";
  /** Optional custom redirection path after logout */
  callbackUrl?: string;
  /** Whether to hide the text label on very small mobile screens */
  compactOnMobile?: boolean;
}

/**
 * Reusable Logout Button component.
 * Safely invalidates NextAuth session and redirects to sign-in or home.
 */
export function LogoutButton({
  variant = "light",
  callbackUrl = "/auth/signin",
  compactOnMobile = false,
}: LogoutButtonProps) {
  const { t, isArabic } = useLanguage();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignOut = async () => {
    if (isLoading) return;
    setIsLoading(true);
    await signOut({ callbackUrl });
  };

  const styleClasses =
    variant === "dark"
      ? "text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900/80 border-rose-800/80"
      : "text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border-rose-200";

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      title={isArabic ? "تسجيل الخروج من الحساب" : "Keluar dari akun"}
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 ${styleClasses}`}
    >
      <span className="text-sm">🚪</span>
      <span className={compactOnMobile ? "hidden sm:inline" : "inline"}>
        {isLoading
          ? isArabic
            ? "جاري الخروج..."
            : "Keluar..."
          : t("logout")}
      </span>
    </button>
  );
}
