"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BackButton } from "@/components/BackButton";
import { InviteMarketerModal } from "@/components/InviteMarketerModal";
import { AdminPayoutAction } from "@/app/admin/AdminPayoutAction";
import { AdminPointsEditor } from "@/app/admin/AdminPointsEditor";
import { MarketerApprovalToggle } from "@/app/admin/MarketerApprovalToggle";
import { AdminMarketerProfileModal, MarketerProfileData } from "@/app/admin/AdminMarketerProfileModal";
import { OrderStatusSelector } from "@/app/admin/OrderStatusSelector";
import { AdminPosterManagementModal } from "@/components/AdminPosterManagementModal";
import { AdminPackagesManagementModal } from "@/components/AdminPackagesManagementModal";
import { AdminGalleryManagementModal } from "@/components/AdminGalleryManagementModal";
import { UbkLogo } from "@/components/UbkLogo";
import { LogoutButton } from "@/components/LogoutButton";
import Link from "next/link";

export interface AdminPageViewProps {
  orders: Array<any>;
  marketers: Array<any>;
  payoutRequests: Array<any>;
  pendingApprovalsCount: number;
  pendingPayoutsCount: number;
}

export function AdminPageView({
  orders,
  marketers,
  payoutRequests,
  pendingApprovalsCount,
  pendingPayoutsCount,
}: AdminPageViewProps) {
  const { t, isArabic } = useLanguage();

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 font-sans transition-all"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <BackButton fallbackUrl="/dashboard" />
              <Link href="/" className="hover:opacity-90 transition">
                <UbkLogo size="sm" variant="dark" showSubtitle={false} />
              </Link>
              <span className="text-[11px] sm:text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-semibold">
                {t("adminPanel")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm shrink-0">
              <LanguageSwitcher />
              <Link href="/dashboard" className="text-slate-400 hover:text-white text-xs transition px-2 py-1 rounded-lg hover:bg-slate-800 hidden sm:inline">
                {t("goToDashboard")}
              </Link>
              <Link href="/" className="text-slate-400 hover:text-white text-xs transition px-2 py-1 rounded-lg hover:bg-slate-800 hidden sm:inline">
                {t("home")}
              </Link>
              <LogoutButton variant="dark" compactOnMobile={true} />
            </div>
          </div>

          {/* Quick Actions Scroll Bar on Mobile & Desktop */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2.5 pb-0.5 border-t border-slate-800/80 mt-2 text-xs">
            <div className="shrink-0">
              <AdminPackagesManagementModal />
            </div>
            <div className="shrink-0">
              <AdminGalleryManagementModal />
            </div>
            <div className="shrink-0">
              <AdminPosterManagementModal />
            </div>
            <div className="shrink-0">
              <InviteMarketerModal isAdmin={true} />
            </div>
            <a
              href="/api/admin/export-orders"
              download
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shadow-xs inline-flex items-center gap-1.5 shrink-0"
            >
              <span>📊</span>
              <span>{t("adminExportCsv")}</span>
            </a>
            <Link href="/dashboard" className="text-slate-400 hover:text-white text-xs transition px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 sm:hidden shrink-0">
              {t("goToDashboard")}
            </Link>
            <div className="shrink-0 sm:hidden">
              <LogoutButton variant="dark" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t("adminTotalOrders")}
            </h3>
            <div className="text-3xl font-extrabold text-slate-900">{orders.length}</div>
            <span className="text-[11px] text-slate-400">
              {isArabic ? "من جميع المسوقين والفروع" : "Seluruh cabang & mitra"}
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t("adminTotalMarketers")}
            </h3>
            <div className="text-3xl font-extrabold text-slate-900">{marketers.length}</div>
            <span className="text-[11px] text-slate-400">
              {isArabic ? "شامل شبكة الشجرة (Tree)" : "Termasuk jaringan pohon (Tree)"}
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-sm">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
              {t("adminPendingPayouts")}
            </h3>
            <div className="text-3xl font-extrabold text-amber-700 font-mono">
              {pendingPayoutsCount}{" "}
              <span className="text-sm font-normal text-amber-600">
                {isArabic ? "طلبات معلقة" : "Pengajuan"}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t("adminCommissionStandard")}
            </h3>
            <div className="text-lg font-black text-emerald-700 font-mono">
              Rp 500.000 {isArabic ? "/ لكل معتمر" : "/ Jamaah"}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              {isArabic ? "تقسم تلقائياً بين المسوق الفرعي والراعي" : "Dibagi otomatis antara Sub-marketer & Sponsor"}
            </span>
          </div>
        </div>

        {/* Section 1: Payout Requests Management */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isArabic ? "إدارة طلبات تحويل الأرباح (Payout Management)" : "Manajemen Penarikan Dana Mitra (Payout Management)"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic
                  ? "تأكيد التحويلات البنكية للمسوقين لحساباتهم (BCA, Mandiri, BRI, BSI, E-Wallet)."
                  : "Konfirmasi transfer dana komisi ke rekening bank (BCA, Mandiri, BRI, BSI, E-Wallet) mitra pemasar."}
              </p>
            </div>
            {pendingPayoutsCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full">
                {pendingPayoutsCount} {isArabic ? "طلب بانتظار التحويل" : "Pengajuan Menunggu Transfer"}
              </span>
            )}
          </div>

          {payoutRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              {t("noData")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">{t("colId")}</th>
                    <th className="px-6 py-3.5">{t("colPartnerName")}</th>
                    <th className="px-6 py-3.5">{t("colAmount")}</th>
                    <th className="px-6 py-3.5">{t("colBankDest")}</th>
                    <th className="px-6 py-3.5">{t("actions")}</th>
                    <th className="px-6 py-3.5">{t("colDate")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payoutRequests.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono font-medium text-slate-500">#{p.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{p.marketer.username}</td>
                      <td className="px-6 py-4 font-black text-emerald-700 font-mono text-sm">
                        Rp {p.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700 max-w-xs">{p.bankInfo}</td>
                      <td className="px-6 py-4">
                        <AdminPayoutAction
                          payoutId={p.id}
                          initialStatus={p.status}
                          initialReceiptUrl={p.receiptImageUrl}
                          initialNotes={p.notes}
                          amount={p.amount}
                          bankInfo={p.bankInfo}
                          marketerName={p.marketer?.username}
                        />
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {new Date(p.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Marketers & Tree Hierarchy Management */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t("adminMarketerList")}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic
                  ? "متابعة تفعيل الحسابات، شجرة شبكة المسوقين، وتدقيق رصيد العمولات."
                  : "Kelola status aktivasi akun, lihat pohon jaringan sub-marketer, dan audit saldo komisi."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {pendingApprovalsCount > 0 && (
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full">
                  {pendingApprovalsCount} {isArabic ? "حساب بانتظار التفعيل" : "Akun Baru Menunggu Aktivasi"}
                </span>
              )}
              <InviteMarketerModal isAdmin={true} />
            </div>
          </div>

          {marketers.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              {t("noData")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">{t("colPartnerName")}</th>
                    <th className="px-6 py-3.5">{isArabic ? "موقع الشجرة (Tree)" : "Posisi Jaringan (Tree)"}</th>
                    <th className="px-6 py-3.5">{t("colPartnerCode")}</th>
                    <th className="px-6 py-3.5">{isArabic ? "الملف والحساب" : "Profil & Rekening"}</th>
                    <th className="px-6 py-3.5">{t("activeBalance")}</th>
                    <th className="px-6 py-3.5">{isArabic ? "تعديل الرصيد" : "Koreksi Saldo"}</th>
                    <th className="px-6 py-3.5">{isArabic ? "الحالة والإجراءات (حذف/تجميد)" : "Status & Aksi (Hapus/Bekukan)"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {marketers.map((m) => {
                    const totalEarnedIDR = m.rewards.reduce((sum: number, r: any) => sum + (r.amount || r.points * 1000), 0);
                    const totalRedeemedIDR = m.payoutRequests
                      .filter((p: any) => p.status !== "REJECTED")
                      .reduce((sum: number, p: any) => sum + p.amount, 0);
                    const availableIDR = totalEarnedIDR - totalRedeemedIDR;

                    const profileData: MarketerProfileData = {
                      id: m.id,
                      username: m.username,
                      email: m.email,
                      whatsapp: m.whatsapp,
                      referralCode: m.referralCode,
                      isApproved: m.isApproved,
                      bankName: m.bankName,
                      bankAccountNumber: m.bankAccountNumber,
                      bankAccountName: m.bankAccountName,
                      idNumber: m.idNumber,
                      parentMarketerName: m.parent ? m.parent.username : null,
                      subMarketerShare: m.subMarketerShare || 350000,
                      subMarketersCount: m.subMarketers.length,
                      createdAt: new Date(m.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "id-ID"),
                      totalEarnedIDR,
                      totalRedeemedIDR,
                      availableIDR,
                      ordersCount: m.orders.length,
                      orders: m.orders.map((o: any) => ({
                        id: o.id,
                        clientName: o.client.name,
                        clientEmail: o.client.email,
                        status: o.status,
                        createdAt: new Date(o.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "id-ID"),
                      })),
                      payoutRequests: m.payoutRequests.map((p: any) => ({
                        id: p.id,
                        amount: p.amount,
                        status: p.status,
                        createdAt: new Date(p.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "id-ID"),
                      })),
                      subMarketers: m.subMarketers.map((s: any) => ({
                        id: s.id,
                        username: s.username,
                        referralCode: s.referralCode,
                        ordersCount: s.orders.length,
                      })),
                    };

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{m.username}</div>
                          <div className="text-[11px] text-slate-400">{m.email}</div>
                          {m.whatsapp && <div className="text-[10px] text-emerald-700 font-mono" dir="ltr">WA: {m.whatsapp}</div>}
                        </td>
                        <td className="px-6 py-4">
                          {m.parent ? (
                            <span className="inline-block bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-lg text-[10px] font-semibold">
                              {isArabic ? `مسوق تابع لـ: ${m.parent.username}` : `Sub-Marketer dari: ${m.parent.username}`}
                            </span>
                          ) : (
                            <span className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                              {isArabic ? "مسوق رئيسي (مباشر UBK)" : "Mitra Utama (Direct UBK)"}
                            </span>
                          )}
                          <div className="text-[10px] text-slate-400 mt-1">
                            {isArabic ? `فريقه الفرعي: ${m.subMarketers.length} مسوقين` : `Bawahan: ${m.subMarketers.length} mitra`}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-emerald-700 font-bold">
                          {m.referralCode || (isArabic ? "بانتظار التفعيل" : "Menunggu")}
                        </td>
                        <td className="px-6 py-4">
                          <AdminMarketerProfileModal marketer={profileData} />
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 font-mono text-xs">
                          Rp {availableIDR.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4">
                          <AdminPointsEditor marketerId={m.id} currentPoints={Math.round(availableIDR / 1000)} />
                        </td>
                        <td className="px-6 py-4">
                          <MarketerApprovalToggle
                            marketerId={m.id}
                            initialApproved={m.isApproved}
                            marketerName={m.username}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 3: Orders Management Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t("adminAllOrders")}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic
                  ? "تغيير الحالة إلى (COMPLETED) يقوم تلقائياً بصرف وتوزيع المكافأة (500 ألف روبية) للمسوق والراعي."
                  : "Mengubah status ke (COMPLETED) otomatis mendistribusikan komisi Rp 500.000 kepada mitra terkait."}
              </p>
            </div>
            <a
              href="/api/admin/export-orders"
              download
              className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition"
            >
              {isArabic ? "تحميل CSV 📊" : "Unduh CSV 📊"}
            </a>
          </div>

          {orders.length === 0 ? (
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
                    <th className="px-6 py-3.5">{t("emailAddress")}</th>
                    <th className="px-6 py-3.5">{isArabic ? "المسوّق المعني" : "Mitra Terkait"}</th>
                    <th className="px-6 py-3.5">{t("colPartnerCode")}</th>
                    <th className="px-6 py-3.5">{isArabic ? "تحديث الحالة" : "Perbarui Status"}</th>
                    <th className="px-6 py-3.5">{t("colDate")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono font-medium text-slate-500">#{o.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{o.client.name}</td>
                      <td className="px-6 py-4 text-slate-500" dir="ltr">{o.client.email}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {o.marketer ? o.marketer.username : (isArabic ? "مباشر (بدون مسوّق)" : "Langsung (Tanpa Mitra)")}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-emerald-700 font-bold">
                        {o.referralCode || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <OrderStatusSelector orderId={o.id} initialStatus={o.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {new Date(o.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
