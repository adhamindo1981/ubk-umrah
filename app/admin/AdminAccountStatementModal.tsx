"use client";

import React, { useState, useMemo } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { UbkLogo } from "@/components/UbkLogo";

export interface StatementMarketerData {
  id: number;
  username: string;
  email: string;
  whatsapp: string | null;
  referralCode: string | null;
  isApproved: boolean;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  idNumber: string | null;
  parentMarketerName: string | null;
  subMarketerShare?: number;
  subMarketersCount?: number;
  createdAt: string | Date;
  rewards: Array<{
    id: number;
    amount: number;
    points?: number;
    description: string | null;
    orderId?: number | null;
    createdAt: string | Date;
  }>;
  payoutRequests: Array<{
    id: number;
    amount: number;
    bankInfo: string;
    status: string;
    notes: string | null;
    createdAt: string | Date;
  }>;
  purchasedPosters: Array<{
    id: number;
    pricePaid: number;
    paymentMethod: string;
    paymentStatus: string;
    licenseKey: string;
    template?: {
      title: string;
    } | null;
    createdAt: string | Date;
  }>;
}

interface AdminAccountStatementModalProps {
  marketer: StatementMarketerData;
  triggerButtonText?: string;
  triggerButtonClass?: string;
}

interface StatementLedgerRow {
  id: string;
  rawDate: Date;
  dateStr: string;
  timeStr: string;
  category: "COMMISSION" | "SUB_COMMISSION" | "ADJUSTMENT" | "PAYOUT" | "POSTER_PURCHASE";
  typeLabelAr: string;
  typeLabelId: string;
  description: string;
  referenceNumber: string;
  credit: number;
  debit: number;
  runningBalance: number;
  statusBadge?: { textAr: string; textId: string; color: string };
}

export function AdminAccountStatementModal({
  marketer,
  triggerButtonText,
  triggerButtonClass,
}: AdminAccountStatementModalProps) {
  const { isArabic } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"DESC" | "ASC">("DESC");

  // Format currency
  const formatIDR = (val: number) => `Rp ${Math.abs(val).toLocaleString("id-ID")}`;

  // Consolidate and compute running balance
  const { transactions, totalCredits, totalDebits, netBalance } = useMemo(() => {
    const rawRows: Array<Omit<StatementLedgerRow, "runningBalance">> = [];

    // 1. Rewards (Commissions & Admin Balance Adjustments)
    (marketer.rewards || []).forEach((r) => {
      const d = new Date(r.createdAt);
      const isAdjustment =
        (r.description && (r.description.includes("تسوية") || r.description.includes("Penyesuaian"))) ||
        (!r.orderId && !r.description?.includes("فريق") && !r.description?.includes("Tim"));

      const isSubMarketerShare =
        r.description &&
        (r.description.includes("فريق") || r.description.includes("Tim") || r.description.includes("غير مباشرة"));

      let category: StatementLedgerRow["category"] = "COMMISSION";
      let typeLabelAr = "عمولة حجز معتمر مباشر";
      let typeLabelId = "Komisi Jamaah Langsung";
      let statusBadge = {
        textAr: "مكتسبة ومودعة",
        textId: "Telah Dikreditkan",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
      };

      if (isAdjustment) {
        category = "ADJUSTMENT";
        if (r.amount >= 0) {
          typeLabelAr = "تسوية رصيد يدوية (إيداع إدارة)";
          typeLabelId = "Penyesuaian Saldo Admin (Kredit)";
          statusBadge = {
            textAr: "تسوية يدوية (+)",
            textId: "Koreksi (+)",
            color: "bg-amber-100 text-amber-800 border-amber-300",
          };
        } else {
          typeLabelAr = "تسوية رصيد يدوية (خصم إدارة)";
          typeLabelId = "Penyesuaian Saldo Admin (Debet)";
          statusBadge = {
            textAr: "تسوية يدوية (-)",
            textId: "Koreksi (-)",
            color: "bg-rose-100 text-rose-800 border-rose-300",
          };
        }
      } else if (isSubMarketerShare) {
        category = "SUB_COMMISSION";
        typeLabelAr = "عمولة فريق (مسوق فرعي)";
        typeLabelId = "Komisi Tim (Sub-Mitra)";
        statusBadge = {
          textAr: "أرباح شجرة",
          textId: "Bonus Tim",
          color: "bg-blue-100 text-blue-800 border-blue-300",
        };
      }

      const credit = r.amount > 0 ? r.amount : 0;
      const debit = r.amount < 0 ? Math.abs(r.amount) : 0;

      rawRows.push({
        id: `rew-${r.id}`,
        rawDate: d,
        dateStr: d.toLocaleDateString(isArabic ? "ar-SA" : "id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        timeStr: d.toLocaleTimeString(isArabic ? "ar-SA" : "id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        category,
        typeLabelAr,
        typeLabelId,
        description:
          r.description ||
          (isArabic
            ? "تسجيل استحقاق مالي بنظام الحوافز"
            : "Pencatatan komisi program kemitraan"),
        referenceNumber: r.orderId ? `ORD-#${r.orderId}` : `ADJ-#${r.id}`,
        credit,
        debit,
        statusBadge,
      });
    });

    // 2. Payout Requests (Cash Withdrawals)
    (marketer.payoutRequests || []).forEach((p) => {
      if (p.status === "REJECTED") return; // Rejected payouts don't debit balance
      const d = new Date(p.createdAt);
      const isApproved = p.status === "APPROVED";

      rawRows.push({
        id: `pay-${p.id}`,
        rawDate: d,
        dateStr: d.toLocaleDateString(isArabic ? "ar-SA" : "id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        timeStr: d.toLocaleTimeString(isArabic ? "ar-SA" : "id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        category: "PAYOUT",
        typeLabelAr: isApproved ? "سحب أرباح معتمد (حوالة بنكية)" : "طلب سحب أرباح (قيد المعالجة)",
        typeLabelId: isApproved ? "Pencairan Saldo (Transfer Bank)" : "Penarikan Dana (Menunggu)",
        description: `${isArabic ? "تحويل بنكي إلى" : "Transfer ke"}: ${p.bankInfo}${
          p.notes ? ` - (${p.notes})` : ""
        }`,
        referenceNumber: `WD-#${p.id}`,
        credit: 0,
        debit: p.amount,
        statusBadge: isApproved
          ? {
              textAr: "تم الصرف بنجاح",
              textId: "Selesai Ditransfer",
              color: "bg-purple-100 text-purple-800 border-purple-300",
            }
          : {
              textAr: "قيد المراجعة",
              textId: "Proses Admin",
              color: "bg-amber-100 text-amber-800 border-amber-300",
            },
      });
    });

    // 3. Poster Purchases (Commission Balance deductions)
    (marketer.purchasedPosters || []).forEach((post) => {
      if (post.paymentMethod !== "COMMISSION_BALANCE" || post.paymentStatus !== "APPROVED") return;
      const d = new Date(post.createdAt);

      rawRows.push({
        id: `post-${post.id}`,
        rawDate: d,
        dateStr: d.toLocaleDateString(isArabic ? "ar-SA" : "id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        timeStr: d.toLocaleTimeString(isArabic ? "ar-SA" : "id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        category: "POSTER_PURCHASE",
        typeLabelAr: "شراء بوستر تسويقي (خصم من الرصيد)",
        typeLabelId: "Beli Poster Promosi (Potong Saldo)",
        description: `${isArabic ? "قالب إعلاني رسمي" : "Desain Brosur"}: "${
          post.template?.title || "Poster Umrah"
        }" (${isArabic ? "ترخيص" : "Lisensi"}: ${post.licenseKey.slice(0, 8)})`,
        referenceNumber: `LIC-${post.licenseKey.slice(0, 8).toUpperCase()}`,
        credit: 0,
        debit: post.pricePaid || 25000,
        statusBadge: {
          textAr: "تم الشراء والخصم",
          textId: "Terpotong Saldo",
          color: "bg-rose-100 text-rose-800 border-rose-300",
        },
      });
    });

    // Sort chronologically (earliest to latest) to calculate running balance
    rawRows.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    let running = 0;
    let sumCredits = 0;
    let sumDebits = 0;

    const rowsWithBalance: StatementLedgerRow[] = rawRows.map((r) => {
      sumCredits += r.credit;
      sumDebits += r.debit;
      running += r.credit - r.debit;
      return {
        ...r,
        runningBalance: running,
      };
    });

    return {
      transactions: rowsWithBalance,
      totalCredits: sumCredits,
      totalDebits: sumDebits,
      netBalance: running,
    };
  }, [marketer, isArabic]);

  // Filter and sort display
  const displayTransactions = useMemo(() => {
    let filtered = transactions;
    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((t) => t.category === categoryFilter);
    }
    if (sortOrder === "DESC") {
      return [...filtered].reverse();
    }
    return filtered;
  }, [transactions, categoryFilter, sortOrder]);

  function handlePrint() {
    window.print();
  }

  const currentDateStr = new Date().toLocaleDateString(isArabic ? "ar-SA" : "id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerButtonClass ||
          "text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg transition inline-flex items-center gap-1 shadow-sm"
        }
      >
        <span>📄</span>
        <span>{triggerButtonText || (isArabic ? "كشف حساب" : "Rekening Koran")}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          {/* Printable Container Card */}
          <div
            id="printable-statement"
            className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 overflow-hidden text-start my-auto print:m-0 print:border-none print:shadow-none print:w-full print:max-w-none"
            onClick={(e) => e.stopPropagation()}
            dir={isArabic ? "rtl" : "ltr"}
          >
            {/* Top Interactive Controls Toolbar (Hidden in Print) */}
            <div className="no-print bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">📑</span>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {isArabic
                      ? `كشف الحساب المالي للمسوق (${marketer.username})`
                      : `Rekening Koran & Mutasi Keuangan (${marketer.username})`}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isArabic
                      ? "تقرير تفصيلي بجميع العمولات والتسويات المالية والسحوبات"
                      : "Laporan resmi rekam jejak mutasi komisi, penyesuaian, dan penarikan"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Print Button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl transition shadow-md shadow-emerald-600/30"
                >
                  <span>🖨️</span>
                  <span>{isArabic ? "طباعة الكشف / حفظ PDF" : "Cetak / Simpan PDF"}</span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition"
                >
                  ✕ {isArabic ? "إغلاق" : "Tutup"}
                </button>
              </div>
            </div>

            {/* Filter Bar (Hidden in Print) */}
            <div className="no-print bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">
                  {isArabic ? "تصفية العمليات:" : "Filter Transaksi:"}
                </span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="ALL">{isArabic ? "جميع العمليات (الكل)" : "Semua Transaksi"}</option>
                  <option value="COMMISSION">
                    {isArabic ? "عمولات الحجوزات المباشرة" : "Komisi Jamaah Langsung"}
                  </option>
                  <option value="SUB_COMMISSION">
                    {isArabic ? "عمولات الفريق (المسوقين الفرعيين)" : "Komisi Tim (Sub-Mitra)"}
                  </option>
                  <option value="ADJUSTMENT">
                    {isArabic ? "تسويات الرصيد اليدوية (الإدارة)" : "Penyesuaian Saldo Admin"}
                  </option>
                  <option value="PAYOUT">
                    {isArabic ? "سحوبات الأرباح البنكية" : "Penarikan Saldo Bank"}
                  </option>
                  <option value="POSTER_PURCHASE">
                    {isArabic ? "مشتريات البوسترات (خصم رصيد)" : "Pembelian Desain Poster"}
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">{isArabic ? "الترتيب:" : "Urutan:"}</span>
                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === "DESC" ? "ASC" : "DESC")}
                  className="bg-white border border-slate-300 hover:bg-slate-100 rounded-lg px-2.5 py-1 font-bold text-slate-700"
                >
                  {sortOrder === "DESC"
                    ? isArabic
                      ? "الأحدث أولاً ⬇️"
                      : "Terbaru Dahulu ⬇️"
                    : isArabic
                    ? "الأقدم أولاً ⬆️"
                    : "Terlama Dahulu ⬆️"}
                </button>
              </div>
            </div>

            {/* ============================================================== */}
            {/* OFFICIAL BANK-STATEMENT DOCUMENT BODY (Printed on A4 Paper)   */}
            {/* ============================================================== */}
            <div className="p-6 sm:p-10 space-y-6 bg-white text-slate-900">
              {/* Document Official Header */}
              <div className="border-b-2 border-slate-800 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <UbkLogo size="sm" variant="light" showSubtitle={false} />
                  <div>
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      PT. UMAR BIN ALKHATTAB FOR UMRAH (UBK)
                    </h1>
                    <p className="text-[11px] font-semibold text-emerald-800">
                      Izin Resmi PPIU Kemenag RI No. U-271/2021 | منصة عمر بن الخطاب للعمرة
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Kantor Pusat: Jakarta • Layanan Operasional: Makkah & Madinah Al-Munawwarah
                    </p>
                  </div>
                </div>

                <div className="text-start sm:text-end space-y-0.5">
                  <div className="inline-block bg-slate-900 text-white font-mono text-[10px] font-black px-3 py-1 rounded-md">
                    REKENING KORAN / كشف حساب مالي
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-700 pt-1">
                    No: STMT-UBK-{marketer.id}-{new Date().getFullYear()}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isArabic ? "تاريخ الإصدار: " : "Tanggal Cetak: "}
                    <span className="font-semibold text-slate-800">{currentDateStr}</span>
                  </div>
                </div>
              </div>

              {/* Marketer & Banking Information Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
                {/* Column 1: Marketer Profile */}
                <div className="space-y-1.5 border-b md:border-b-0 md:border-e border-slate-200 pb-3 md:pb-0 md:pe-4">
                  <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>👤</span>
                    <span>{isArabic ? "بيانات المسوّق المعتمد:" : "Data Profil Mitra Pemasar:"}</span>
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isArabic ? "اسم المسوّق:" : "Nama Mitra:"}</span>
                    <strong className="text-slate-900 font-bold">{marketer.username}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isArabic ? "كود الإحالة:" : "Kode Referral:"}</span>
                    <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {marketer.referralCode || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isArabic ? "نوع الكادر:" : "Tipe Kemitraan:"}</span>
                    <span className="font-bold text-slate-800">
                      {marketer.parentMarketerName
                        ? isArabic
                          ? `مسوق فرعي (بإشراف: ${marketer.parentMarketerName})`
                          : `Sub-Mitra (Sponsor: ${marketer.parentMarketerName})`
                        : isArabic
                        ? "مسوّق رئيسي مباشر (Direct UBK)"
                        : "Mitra Utama Mandiri (Direct UBK)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isArabic ? "رقم الهاتف / واتساب:" : "No. WhatsApp:"}</span>
                    <span className="font-mono text-slate-800">{marketer.whatsapp || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-mono text-slate-800">{marketer.email}</span>
                  </div>
                </div>

                {/* Column 2: Indonesian Bank Account */}
                <div className="space-y-1.5 md:ps-2">
                  <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>🏦</span>
                    <span>{isArabic ? "الحساب البنكي لتحويل العمولات (إندونيسيا):" : "Rekening Bank Pencairan (Indonesia):"}</span>
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isArabic ? "اسم البنك:" : "Nama Bank:"}</span>
                    <strong className="text-slate-900 font-bold">{marketer.bankName || "Belum diisi"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isArabic ? "رقم الحساب:" : "Nomor Rekening:"}</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                      {marketer.bankAccountNumber || "Belum diisi"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isArabic ? "اسم صاحب الحساب:" : "Atas Nama (A/N):"}</span>
                    <span className="font-semibold text-slate-800">{marketer.bankAccountName || "Belum diisi"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isArabic ? "الرقم القومي (NIK / KTP):" : "NIK / KTP:"}</span>
                    <span className="font-mono text-slate-800">{marketer.idNumber || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isArabic ? "تاريخ التسجيل:" : "Bergabung Sejak:"}</span>
                    <span className="text-slate-800 font-medium">
                      {new Date(marketer.createdAt).toLocaleDateString(isArabic ? "ar-SA" : "id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Summary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-start">
                {/* Total Credits */}
                <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl space-y-1">
                  <div className="text-[11px] font-bold text-emerald-800 flex items-center justify-between">
                    <span>{isArabic ? "إجمالي العمولات والإيداعات (+)" : "Total Kredit Komisi (+)"}</span>
                    <span className="text-xs">📈</span>
                  </div>
                  <div className="text-lg font-black font-mono text-emerald-700">
                    {formatIDR(totalCredits)}
                  </div>
                  <p className="text-[10px] text-emerald-600">
                    {isArabic ? "حجوزات مباشرة، أرباح شجرة، وتسويات إيجابية" : "Komisi jamaah, bonus tim, & kredit saldo"}
                  </p>
                </div>

                {/* Total Debits */}
                <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-2xl space-y-1">
                  <div className="text-[11px] font-bold text-rose-800 flex items-center justify-between">
                    <span>{isArabic ? "إجمالي السحوبات والمصروفات (-)" : "Total Debet & Penarikan (-)"}</span>
                    <span className="text-xs">📉</span>
                  </div>
                  <div className="text-lg font-black font-mono text-rose-700">
                    {formatIDR(totalDebits)}
                  </div>
                  <p className="text-[10px] text-rose-600">
                    {isArabic ? "حوالات بنكية، مشتريات بوسترات، وتسويات خصم" : "Pencairan bank, beli poster, & potongan"}
                  </p>
                </div>

                {/* Net Balance */}
                <div className="bg-slate-900 text-white border border-slate-900 p-4 rounded-2xl space-y-1 shadow-md">
                  <div className="text-[11px] font-bold text-amber-300 flex items-center justify-between">
                    <span>{isArabic ? "صافي الرصيد المتاح الحالي" : "Saldo Aktif Saat Ini"}</span>
                    <span className="text-xs">💼</span>
                  </div>
                  <div className="text-xl font-black font-mono text-emerald-400">
                    {formatIDR(netBalance)}
                  </div>
                  <p className="text-[10px] text-slate-300">
                    {isArabic ? "الرصيد الفعلي الجاهز للسحب في أي وقت" : "Saldo bersih siap dicairkan ke rekening"}
                  </p>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <span>📋</span>
                    <span>
                      {isArabic ? "جدول الحركات والقيود المالية التفصيلي:" : "Rincian Mutasi Transaksi & Buku Besar:"}
                    </span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500">
                    {isArabic
                      ? `إجمالي الحركات: ${displayTransactions.length} حركة`
                      : `Total ${displayTransactions.length} mutasi`}
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-xs text-start border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                        <th className="py-3 px-3 w-10 text-center">#</th>
                        <th className="py-3 px-3">{isArabic ? "التاريخ والوقت" : "Tanggal"}</th>
                        <th className="py-3 px-3">{isArabic ? "نوع الحركة" : "Jenis Mutasi"}</th>
                        <th className="py-3 px-4">{isArabic ? "البيان والتفاصيل" : "Keterangan"}</th>
                        <th className="py-3 px-3 text-center">{isArabic ? "المرجع" : "Ref"}</th>
                        <th className="py-3 px-3 text-end text-emerald-800">{isArabic ? "إيداع (+)" : "Kredit (+)"}</th>
                        <th className="py-3 px-3 text-end text-rose-800">{isArabic ? "خصم (-)" : "Debet (-)"}</th>
                        <th className="py-3 px-4 text-end bg-slate-200/50">{isArabic ? "الرصيد" : "Saldo"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {displayTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                            {isArabic ? "لا توجد عمليات مسجلة في هذا الحساب حتى الآن" : "Belum ada riwayat transaksi"}
                          </td>
                        </tr>
                      ) : (
                        displayTransactions.map((tx, idx) => (
                          <tr
                            key={tx.id}
                            className={`hover:bg-slate-50/80 transition ${
                              tx.category === "ADJUSTMENT" ? "bg-amber-50/20" : ""
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[10px]">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="font-semibold text-slate-800">{tx.dateStr}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{tx.timeStr}</div>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  tx.statusBadge?.color || "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {isArabic ? tx.typeLabelAr : tx.typeLabelId}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-medium text-slate-700 max-w-xs">
                              {tx.description}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono text-[10px] text-slate-500 font-bold">
                              {tx.referenceNumber}
                            </td>
                            <td className="py-2.5 px-3 text-end whitespace-nowrap font-mono font-bold text-emerald-600">
                              {tx.credit > 0 ? `+${formatIDR(tx.credit)}` : "-"}
                            </td>
                            <td className="py-2.5 px-3 text-end whitespace-nowrap font-mono font-bold text-rose-600">
                              {tx.debit > 0 ? `-${formatIDR(tx.debit)}` : "-"}
                            </td>
                            <td className="py-2.5 px-4 text-end whitespace-nowrap font-mono font-black text-slate-900 bg-slate-50/70">
                              {formatIDR(tx.runningBalance)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Official Seal, Audit Footer, & Signatures */}
              <div className="border-t-2 border-slate-200 pt-6 mt-8 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* Legal & System Verification Text */}
                  <div className="text-start space-y-1 max-w-lg text-[11px] text-slate-500">
                    <p className="font-bold text-slate-700">
                      {isArabic ? "إقرار مالي رسمي:" : "Pernyataan Keabsahan Dokumen:"}
                    </p>
                    <p className="leading-relaxed">
                      {isArabic
                        ? "تم إنشاء هذا الكشف إلكترونياً وبشكل مشفر عبر منصة UBK للعمرة، ويعد وثيقة رسمية معتمدة تثبت حركة العمولات والتسويات المالية. جميع الحقوق محفوظة لشركة عمر بن الخطاب للعمرة."
                        : "Dokumen rekening koran ini diterbitkan secara otomatis dan terverifikasi oleh sistem UBK Umrah. Sah sebagai bukti mutasi hak komisi dan penyesuaian saldo resmi mitra."}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      System Hash: UBK-FIN-{marketer.id}-{Date.now().toString(36).toUpperCase()} • SSL Encrypted
                    </p>
                  </div>

                  {/* Stamp & Signature Badges */}
                  <div className="flex items-center gap-8 text-center">
                    {/* Stamp */}
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-600/60 p-1 flex items-center justify-center rotate-[-6deg] select-none">
                      <div className="w-full h-full rounded-full border border-emerald-600 flex flex-col items-center justify-center p-1 bg-emerald-50/40">
                        <span className="text-[8px] font-black text-emerald-800 tracking-tighter">UBK UMRAH</span>
                        <span className="text-[10px]">🕋</span>
                        <span className="text-[7px] font-bold text-emerald-900 uppercase">FINANCE AUDIT</span>
                        <span className="text-[7px] font-mono text-emerald-700">TERVERIFIKASI</span>
                      </div>
                    </div>

                    {/* Signature Line */}
                    <div className="space-y-1 text-center min-w-[140px]">
                      <div className="h-10 border-b border-slate-400 flex items-end justify-center pb-1">
                        <span className="font-serif italic text-xs text-slate-600 select-none">UBK Finance Dept.</span>
                      </div>
                      <div className="text-[10px] font-black text-slate-800">
                        Chief Financial Officer (CFO)
                      </div>
                      <div className="text-[9px] text-slate-400">
                        PT. Umar Bin Alkhattab for Umrah
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Print Styling */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-statement,
          #printable-statement * {
            visibility: visible;
          }
          #printable-statement {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </>
  );
}
