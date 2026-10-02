"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BackButton } from "@/components/BackButton";
import { FirstTimePasswordModal } from "@/components/FirstTimePasswordModal";
import { InviteMarketerModal } from "@/components/InviteMarketerModal";
import { PosterMarketplaceModal } from "@/components/PosterMarketplaceModal";
import { MarketerActions } from "@/app/dashboard/MarketerActions";
import { UbkLogo } from "@/components/UbkLogo";
import { LogoutButton } from "@/components/LogoutButton";
import Link from "next/link";

export interface DashboardPageViewProps {
  user: {
    id: number;
    username: string;
    role: string;
    referralCode: string | null;
    mustChangePassword: boolean;
    bankName: string | null;
    bankAccountNumber: string | null;
    bankAccountName: string | null;
    idNumber: string | null;
    whatsapp: string | null;
    subMarketerShare: number | null;
    orders: Array<{
      id: number;
      status: string;
      createdAt: string | Date;
      client: { name: string; phone: string | null };
    }>;
    rewards: Array<{
      id: number;
      amount: number | null;
      points: number;
      createdAt: string | Date;
    }>;
    payoutRequests: Array<{
      id: number;
      amount: number;
      bankInfo: string;
      status: string;
      receiptImageUrl?: string | null;
      notes?: string | null;
      createdAt: string | Date;
    }>;
    subMarketers: Array<{
      id: number;
      username: string;
      whatsapp: string | null;
      referralCode: string | null;
      mustChangePassword: boolean;
      createdAt: string | Date;
      orders: Array<any>;
    }>;
  };
  totalEarnedIDR: number;
  totalRedeemedIDR: number;
  availableIDR: number;
  personalPageUrl: string;
  waLink: string;
  qrCodeDataUrl: string;
}

export function DashboardPageView({
  user,
  totalEarnedIDR,
  totalRedeemedIDR,
  availableIDR,
  personalPageUrl,
  waLink,
  qrCodeDataUrl,
}: DashboardPageViewProps) {
  const { t, isArabic } = useLanguage();
  const [activeReceiptPayout, setActiveReceiptPayout] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeUrl, setActiveUrl] = useState<string>(personalPageUrl);
  const [activeWaLink, setActiveWaLink] = useState<string>(waLink);
  const [activeQrCode, setActiveQrCode] = useState<string>(qrCodeDataUrl);

  useEffect(() => {
    if (typeof window !== "undefined" && user.referralCode) {
      const origin = window.location.origin;
      const clientUrl = `${origin}/m/${user.referralCode}`;
      setActiveUrl(clientUrl);
      const text = encodeURIComponent(
        `Assalamu'alaikum wr. wb.,\nDaftarkan ibadah Umrah Anda bersama UBK Umrah (Umar Bin Alkhattab for Umrah) melalui halaman resmi kemitraan saya:\n${clientUrl}\n\n----------------------------------------\n\nالسلام عليكم ورحمة الله وبركاته،\nيمكنكم الاطلاع على تفاصيل برامج العمرة وطلب الحجز المباشر عبر صفحتي المعتمدة لدى عمر بن الخطاب للعمرة (UBK):\n${clientUrl}`
      );
      setActiveWaLink(`https://wa.me/?text=${text}`);

      QRCode.toDataURL(clientUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#047857",
          light: "#FFFFFF",
        },
      })
        .then((url) => setActiveQrCode(url))
        .catch((err) => console.error("Client QR generation error:", err));
    }
  }, [user.referralCode]);

  const handleCopyLink = async () => {
    if (!activeUrl) return;
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Clipboard copy error:", err);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 font-sans transition-all"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Mandatory First Time Password Setup Modal */}
      <FirstTimePasswordModal isOpen={user.mustChangePassword} username={user.username} />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <BackButton fallbackUrl="/" />
              <Link href="/" className="hover:opacity-90 transition">
                <UbkLogo size="sm" showSubtitle={false} />
              </Link>
              <span className="text-[11px] sm:text-xs bg-emerald-100 text-emerald-800 font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-200">
                {t("marketerBadge")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm shrink-0">
              <LanguageSwitcher />

              <span className="text-slate-600 text-xs hidden lg:inline-block font-semibold">
                {t("helloUser", { name: user.username })}
              </span>

              <LogoutButton variant="light" compactOnMobile={true} />
            </div>
          </div>

          {/* Quick Actions Bar (Horizontal Scrollable on Mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2.5 pb-0.5 border-t border-slate-100 mt-2 text-xs">
            {user.referralCode && (
              <Link
                href={`/m/${user.referralCode}`}
                target="_blank"
                className="shrink-0 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1.5 shadow-2xs"
              >
                <span>🌐</span>
                <span>{t("viewMyPage")}</span>
              </Link>
            )}

            <div className="shrink-0">
              <InviteMarketerModal />
            </div>

            <div className="shrink-0">
              <PosterMarketplaceModal />
            </div>

            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="shrink-0 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 shadow-xs"
              >
                <span>🛡️</span>
                <span>{t("adminBadge")}</span>
              </Link>
            )}

            <div className="shrink-0 sm:hidden">
              <LogoutButton variant="light" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Top Promotional & Personal Page Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Saldo Komisi Rupiah */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t("activeBalance")}
                </span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  IDR
                </span>
              </div>
              <div className="text-3xl font-black text-emerald-700 font-mono">
                Rp {availableIDR.toLocaleString("id-ID")}
              </div>
              <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                <div>{t("totalEarned")}: Rp {totalEarnedIDR.toLocaleString("id-ID")}</div>
                <div>{t("totalWithdrawn")}: Rp {totalRedeemedIDR.toLocaleString("id-ID")}</div>
              </div>
            </div>

            <MarketerActions
              availableIDR={availableIDR}
              initialBankName={user.bankName || ""}
              initialBankAccountNumber={user.bankAccountNumber || ""}
              initialBankAccountName={user.bankAccountName || ""}
              initialIdNumber={user.idNumber || ""}
              initialWhatsapp={user.whatsapp || ""}
              initialSubMarketerShare={user.subMarketerShare || 350000}
            />
          </div>

          {/* Card 2: Kode & Halaman Landing Pribadi */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                {t("personalPageTitle")}
              </span>
              {personalPageUrl ? (
                <>
                  <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 break-all mb-3 font-semibold flex items-center justify-between gap-2" dir="ltr">
                    <span className="truncate">{activeUrl}</span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 transition shadow-2xs cursor-pointer active:scale-95"
                    >
                      {copied ? (isArabic ? "✅ تم النسخ!" : "✅ Tersalin!") : (isArabic ? "📋 نسخ" : "📋 Salin")}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <Link
                      href={`/m/${user.referralCode}`}
                      target="_blank"
                      className="col-span-1 text-center text-xs font-bold py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition inline-flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <span>🌐</span>
                      <span>{t("visitWebPage")}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="col-span-1 text-center text-xs font-bold py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl transition inline-flex items-center justify-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                    >
                      <span>{copied ? "✅" : "📋"}</span>
                      <span>{copied ? (isArabic ? "تم النسخ!" : "Tersalin!") : (isArabic ? "نسخ الرابط" : "Salin")}</span>
                    </button>
                    <a
                      href={activeWaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="col-span-2 sm:col-span-1 text-center text-xs font-bold py-2.5 bg-emerald-950 hover:bg-slate-900 text-emerald-300 border border-emerald-800 rounded-xl transition inline-flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <span>💬</span>
                      <span>{t("shareWa")}</span>
                    </a>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
                  {isArabic ? "أكمل تفعيل كلمة المرور لإصدار صفحتك التسويقية." : "Selesaikan aktivasi kata sandi untuk menerbitkan halaman web Anda."}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              {isArabic
                ? "صفحتك التسويقية معزولة بالكامل ومستقلة، بحيث يبقى عملاؤك مسجلين تحت كودك حصرياً."
                : "Halaman ini berdiri sendiri (Standalone), tidak terhubung ke halaman umum, sehingga jamaah tetap terkunci di bawah akun Anda."}
            </div>
          </div>

          {/* Card 3: Rekrut Tim Kemitraan (Jaringan Pohon) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t("teamNetworkTitle")}
                </span>
                <span className="text-[11px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  Tree
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                {t("teamNetworkDesc")}
              </p>
            </div>

            <div className="space-y-2">
              <InviteMarketerModal />
              <div className="text-[11px] text-slate-400 text-center">
                {t("totalTeamMembers")}: <strong>{user.subMarketers.length}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Section: QR Code & Marketing Assets */}
        {activeQrCode && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeQrCode} alt="QR Code" className="w-36 h-36 rounded-xl" />
            </div>
            <div className="space-y-2 text-start">
              <h3 className="text-base font-bold text-slate-900">{t("qrTitle")}</h3>
              <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                {t("qrDesc")}
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <a
                  href={activeQrCode}
                  download={`QR-UBK-${user.referralCode}.png`}
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
                >
                  <span>⬇️</span>
                  <span>{t("downloadQr")}</span>
                </a>
                <span className="text-[11px] text-slate-400 font-mono" dir="ltr">
                  {activeUrl}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Section: Poster Marketplace & Marketing Assets */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-900/50">
          <div className="space-y-2 text-start max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full">
              {isArabic ? "سوق بوستات وتصاميم العمرة الحصرية" : "MARKETPLACE DESAIN & POSTER RESMI"}
            </span>
            <h3 className="text-xl font-black text-white">
              {t("marketplaceTitle")}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t("marketplaceSubtitle")}
            </p>
          </div>

          <div className="shrink-0">
            <PosterMarketplaceModal />
          </div>
        </div>

        {/* Section: Tim Binaan Mitra (Downline Tree Section) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t("myTeamList")}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t("myTeamListDesc")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                {user.subMarketers.length} {t("activeStatus")}
              </span>
              <InviteMarketerModal />
            </div>
          </div>

          {user.subMarketers.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              {t("noData")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">{t("colPartnerName")}</th>
                    <th className="px-6 py-3.5">{t("colPartnerWa")}</th>
                    <th className="px-6 py-3.5">{t("colPartnerCode")}</th>
                    <th className="px-6 py-3.5">{t("colActivation")}</th>
                    <th className="px-6 py-3.5">{t("colTotalOrders")}</th>
                    <th className="px-6 py-3.5">{t("colJoinDate")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {user.subMarketers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{sub.username}</td>
                      <td className="px-6 py-4 font-mono text-slate-600" dir="ltr">{sub.whatsapp || "-"}</td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-700">
                        {sub.referralCode || t("waitingActivation")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            !sub.mustChangePassword
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {!sub.mustChangePassword ? t("activeStatus") : t("waitingActivation")}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{sub.orders.length}</td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(sub.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section: Riwayat Booking Jamaah */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t("clientList")}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t("clientListDesc")}
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full">
              {user.orders.length}
            </span>
          </div>

          {user.orders.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              {t("noData")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">{t("colId")}</th>
                    <th className="px-6 py-3.5">{t("colClient")}</th>
                    <th className="px-6 py-3.5">{t("colStatus")}</th>
                    <th className="px-6 py-3.5">{t("colCommission")}</th>
                    <th className="px-6 py-3.5">{t("colDate")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {user.orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono font-medium text-slate-500">#{o.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{o.client.name}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : o.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800"
                              : o.status === "CANCELED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {o.status === "COMPLETED"
                            ? t("statusCompleted")
                            : o.status === "IN_PROGRESS"
                            ? t("statusInProgress")
                            : o.status === "CANCELED"
                            ? t("statusCanceled")
                            : t("statusPending")}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-700">
                        {o.status === "COMPLETED" ? "Rp 500.000" : "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section: Riwayat Penarikan Dana (Payout History) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">{t("payoutHistory")}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t("payoutHistoryDesc")}</p>
          </div>

          {user.payoutRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {t("noData")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">{t("colId")}</th>
                    <th className="px-6 py-3.5">{t("colAmount")}</th>
                    <th className="px-6 py-3.5">{t("colBankDest")}</th>
                    <th className="px-6 py-3.5">{t("colTransferStatus")}</th>
                    <th className="px-6 py-3.5">{t("colDate")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {user.payoutRequests.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono font-medium text-slate-500">#{p.id}</td>
                      <td className="px-6 py-4 font-bold text-emerald-700 font-mono">
                        Rp {p.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{p.bankInfo}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : p.status === "REJECTED"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {p.status === "APPROVED"
                              ? t("statusApproved")
                              : p.status === "REJECTED"
                              ? t("statusRejected")
                              : t("statusPending")}
                          </span>

                          {p.receiptImageUrl && (
                            <button
                              onClick={() => setActiveReceiptPayout(p)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-lg transition"
                            >
                              <span>📄</span>
                              <span>{t("viewTransferProof")}</span>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Official Transfer Receipt Lightbox Modal */}
      {activeReceiptPayout && activeReceiptPayout.receiptImageUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setActiveReceiptPayout(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-extrabold text-base text-slate-900">
                  {t("officialTransferReceipt")}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  ID Payout: #{activeReceiptPayout.id} • Rp {activeReceiptPayout.amount.toLocaleString("id-ID")}
                </p>
              </div>
              <button
                onClick={() => setActiveReceiptPayout(null)}
                className="text-slate-400 hover:text-slate-700 font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto bg-slate-950 rounded-2xl flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeReceiptPayout.receiptImageUrl}
                alt="Bukti Transfer Payout"
                className="max-h-[50vh] max-w-full object-contain rounded-xl"
              />
            </div>

            {activeReceiptPayout.notes && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="font-bold">{t("transferRefNotes")}: </span>
                <span className="font-mono">{activeReceiptPayout.notes}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <a
                href={activeReceiptPayout.receiptImageUrl}
                download={`bukti-transfer-payout-${activeReceiptPayout.id}.png`}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl text-center shadow-md shadow-emerald-600/20 transition"
              >
                {t("downloadReceipt")}
              </a>
              <button
                onClick={() => setActiveReceiptPayout(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
