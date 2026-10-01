"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";

interface PosterItem {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  previewImageUrl: string;
  isPurchased: boolean;
  paymentStatus: "APPROVED" | "PENDING_APPROVAL" | "REJECTED" | null;
  paymentMethod: "FREE_STARTER" | "COMMISSION_BALANCE" | "BANK_TRANSFER" | null;
  receiptImageUrl: string | null;
  customizedImageUrl: string | null;
  licenseKey: string | null;
  isFeaturedOnPage: boolean;
  purchasedAt: string | null;
}

interface CompanyBank {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export function PosterMarketplaceModal() {
  const { t, isArabic } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<PosterItem[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [hasUsedFreeStarter, setHasUsedFreeStarter] = useState<boolean>(false);
  const [companyBank, setCompanyBank] = useState<CompanyBank>({
    bankName: "BCA",
    accountNumber: "8830-1928-3190",
    accountName: "UMAR BIN AL-KHATTAB FOR UMRAH",
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [claimingId, setClaimingId] = useState<number | null>(null);

  // Purchase Dialog state
  const [selectedTemplateForPurchase, setSelectedTemplateForPurchase] = useState<PosterItem | null>(null);
  const [chosenPaymentMethod, setChosenPaymentMethod] = useState<"FREE_STARTER" | "COMMISSION_BALANCE" | "BANK_TRANSFER">("FREE_STARTER");
  const [receiptBase64, setReceiptBase64] = useState<string>("");
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccessMsg, setPurchaseSuccessMsg] = useState<string | null>(null);

  // Lightbox Zoom
  const [previewModalImage, setPreviewModalImage] = useState<{ url: string; title: string; isLicensed: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const res = await fetch("/api/marketplace/posters");
      const data = await res.json();
      if (res.ok) {
        setTemplates(data.templates || []);
        setUserBalance(data.userBalance || 0);
        setHasUsedFreeStarter(data.hasUsedFreeStarter ?? false);
        if (data.companyBank) setCompanyBank(data.companyBank);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenPurchase(template: PosterItem) {
    setSelectedTemplateForPurchase(template);
    setPurchaseError(null);
    setPurchaseSuccessMsg(null);
    setReceiptBase64("");

    // Set default payment method based on user eligibility
    if (!hasUsedFreeStarter) {
      setChosenPaymentMethod("FREE_STARTER");
    } else if (userBalance >= template.price) {
      setChosenPaymentMethod("COMMISSION_BALANCE");
    } else {
      setChosenPaymentMethod("BANK_TRANSFER");
    }
  }

  function handleReceiptFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert(isArabic ? "حجم الصورة كبير جداً (الحد الأقصى 4MB)" : "Ukuran file terlalu besar (Maksimal 4MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleConfirmPurchase() {
    if (!selectedTemplateForPurchase) return;
    setPurchaseError(null);
    setPurchaseSuccessMsg(null);

    if (chosenPaymentMethod === "BANK_TRANSFER" && !receiptBase64) {
      setPurchaseError(
        isArabic
          ? "يرجى رفع صورة إيصال التحويل البنكي للمتابعة."
          : "Wajib melampirkan foto / bukti transfer bank untuk verifikasi."
      );
      return;
    }

    setClaimingId(selectedTemplateForPurchase.id);

    try {
      const res = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplateForPurchase.id,
          paymentMethod: chosenPaymentMethod,
          receiptImageUrl: receiptBase64 || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPurchaseSuccessMsg(data.message || (isArabic ? "تمت العملية بنجاح!" : "Transaksi berhasil diproses!"));
        setTimeout(async () => {
          setSelectedTemplateForPurchase(null);
          await fetchTemplates();
        }, 1500);
      } else {
        setPurchaseError(data.error || (isArabic ? "فشلت العملية." : "Gagal memproses pembelian."));
      }
    } catch (e) {
      setPurchaseError(isArabic ? "تعذر الاتصال بالخادم." : "Terjadi gangguan koneksi jaringan.");
    } finally {
      setClaimingId(null);
    }
  }

  async function handleToggleFeature(templateId: number, currentStatus: boolean) {
    try {
      const res = await fetch("/api/marketplace/toggle-feature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          isFeaturedOnPage: !currentStatus,
        }),
      });
      if (res.ok) {
        setTemplates((prev) =>
          prev.map((item) =>
            item.id === templateId ? { ...item, isFeaturedOnPage: !currentStatus } : item
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  function triggerDirectDownload(url: string, filename: string) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 300);
  }

  async function handleDownloadPoster(template: PosterItem) {
    const rawSvgData = template.customizedImageUrl || template.previewImageUrl;
    if (!rawSvgData) return;

    setDownloadingId(template.id);
    const fileName = `UBK-Poster-${template.licenseKey || template.id}`;

    try {
      let svgText = "";
      if (rawSvgData.startsWith("data:image/svg+xml;utf8,")) {
        svgText = decodeURIComponent(rawSvgData.replace("data:image/svg+xml;utf8,", ""));
      } else if (rawSvgData.startsWith("data:image/svg+xml;base64,")) {
        svgText = atob(rawSvgData.replace("data:image/svg+xml;base64,", ""));
      } else {
        svgText = rawSvgData;
      }

      const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const svgBlobUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 1080;
          canvas.height = 1080;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            triggerDirectDownload(`/api/marketplace/download?templateId=${template.id}`, `${fileName}.svg`);
            setDownloadingId(null);
            return;
          }
          ctx.drawImage(img, 0, 0, 1080, 1080);
          URL.revokeObjectURL(svgBlobUrl);

          canvas.toBlob((pngBlob) => {
            if (pngBlob) {
              const pngUrl = URL.createObjectURL(pngBlob);
              triggerDirectDownload(pngUrl, `${fileName}.png`);
              setTimeout(() => URL.revokeObjectURL(pngUrl), 2000);
            } else {
              triggerDirectDownload(`/api/marketplace/download?templateId=${template.id}`, `${fileName}.svg`);
            }
            setDownloadingId(null);
          }, "image/png");
        } catch (canvasErr) {
          console.error("Canvas export blocked, using server route:", canvasErr);
          triggerDirectDownload(`/api/marketplace/download?templateId=${template.id}`, `${fileName}.svg`);
          setDownloadingId(null);
        }
      };

      img.onerror = (e) => {
        console.error("Image loading failed, downloading via server:", e);
        triggerDirectDownload(`/api/marketplace/download?templateId=${template.id}`, `${fileName}.svg`);
        setDownloadingId(null);
      };

      img.src = svgBlobUrl;
    } catch (err) {
      console.error("Download error:", err);
      triggerDirectDownload(`/api/marketplace/download?templateId=${template.id}`, `${fileName}.svg`);
      setDownloadingId(null);
    }
  }

  const filteredTemplates = activeTab === "all" ? templates : templates.filter((t) => t.isPurchased);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition shadow-md shadow-emerald-600/20 inline-flex items-center gap-2"
      >
        <span>🎨</span>
        <span>{t("openMarketplace")}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 transition-all"
          dir={isArabic ? "rtl" : "ltr"}
        >
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-start">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-black text-emerald-800 tracking-wider uppercase bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                  UBK MARKETING ASSETS & IP PROTECTED DESIGNS
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  {t("marketplaceTitle")}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                  {t("marketplaceSubtitle")}
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200 flex items-center justify-center text-lg font-bold transition shadow-xs"
              >
                ✕
              </button>
            </div>

            {/* Quota & Balance Indicator Bar */}
            <div className="px-6 py-3 bg-emerald-50/80 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">
                  {isArabic ? "رصيد عمولاتك المتاح:" : "Saldo Komisi Aktif Anda:"}
                </span>
                <span className="font-black text-emerald-800 font-mono text-sm">
                  Rp {userBalance.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!hasUsedFreeStarter ? (
                  <span className="bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full text-[11px] border border-amber-300">
                    🎁 {isArabic ? "متاح لك 1 بوستر مجاني للبداية" : "Tersedia 1 Poster Gratis untuk Anda"}
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                    ✓ {isArabic ? "تم استنفاد البوستر المجاني" : "Jatah poster gratis telah digunakan"}
                  </span>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-6 py-3 border-b border-slate-100 flex gap-2 bg-white">
              <button
                onClick={() => setActiveTab("all")}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                  activeTab === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t("allTemplates")} ({templates.length})
              </button>
              <button
                onClick={() => setActiveTab("my")}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                  activeTab === "my"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                ⭐ {t("myPostersTab")} ({templates.filter((t) => t.isPurchased).length})
              </button>
            </div>

            {/* Modal Body / Templates Grid */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {loading ? (
                <div className="py-20 text-center text-slate-400 text-sm">
                  {isArabic ? "جاري تحميل التصاميم وقوالب البوستات..." : "Sedang memuat katalog poster..."}
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-sm">
                  {t("noData")}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTemplates.map((template) => {
                    const displayImage =
                      template.isPurchased && template.customizedImageUrl
                        ? template.customizedImageUrl
                        : template.previewImageUrl;

                    const isPending = template.paymentStatus === "PENDING_APPROVAL";

                    return (
                      <div
                        key={template.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between transition hover:shadow-md"
                      >
                        {/* Poster Preview Container with IP Protection */}
                        <div className="relative group bg-slate-900 select-none overflow-hidden aspect-square">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={displayImage}
                            alt={template.title}
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
                            onContextMenu={(e) => e.preventDefault()}
                          />

                          {/* Watermark Tag or License Tag */}
                          <div className="absolute top-3 start-3">
                            {template.isPurchased ? (
                              <span className="text-[10px] font-black tracking-wide text-emerald-900 bg-emerald-100/95 border border-emerald-300 px-3 py-1 rounded-full shadow-sm">
                                ✓ {t("licensedPoster")}
                              </span>
                            ) : isPending ? (
                              <span className="text-[10px] font-black tracking-wide text-amber-900 bg-amber-100/95 border border-amber-300 px-3 py-1 rounded-full shadow-sm">
                                ⏳ {isArabic ? "بانتظار مراجعة الإيصال" : "Menunggu Verifikasi Admin"}
                              </span>
                            ) : (
                              <span className="text-[10px] font-black tracking-wide text-rose-900 bg-rose-100/95 border border-rose-300 px-3 py-1 rounded-full shadow-sm">
                                🔒 {t("previewWatermark")}
                              </span>
                            )}
                          </div>

                          {/* Zoom Button */}
                          <button
                            onClick={() =>
                              setPreviewModalImage({
                                url: displayImage,
                                title: template.title,
                                isLicensed: template.isPurchased,
                              })
                            }
                            className="absolute bottom-3 end-3 bg-slate-900/80 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl backdrop-blur-sm transition"
                          >
                            🔍 {isArabic ? "تكبير" : "Pratinjau"}
                          </button>
                        </div>

                        {/* Card Info & Actions */}
                        <div className="p-5 space-y-3">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-sm font-black text-slate-900 leading-snug">
                                {template.title}
                              </h3>
                              <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                                {template.isPurchased
                                  ? (isArabic ? "مرخص" : "Aktif")
                                  : isPending
                                  ? (isArabic ? "قيد المراجعة" : "Pending")
                                  : `Rp ${template.price.toLocaleString("id-ID")}`}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {template.description}
                            </p>
                          </div>

                          {template.isPurchased && template.licenseKey && (
                            <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 font-mono flex items-center justify-between">
                              <span className="font-bold">{t("licenseNumber")}</span>
                              <span className="font-black text-emerald-800">{template.licenseKey}</span>
                            </div>
                          )}

                          {isPending && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold space-y-1">
                              <div>⏳ {isArabic ? "تم إرسال إيصال التحويل للإدارة بنجاح." : "Bukti transfer telah dikirim ke Admin."}</div>
                              <p className="text-[11px] text-amber-700 font-normal">
                                {isArabic
                                  ? "سيتم ختم وترخيص البوستر ببياناتك فور اعتماد الإيصال من قبل المصمم/الأدمن."
                                  : "Poster akan otomatis berlisensi dan mencantumkan data Anda setelah disetujui Admin/Desainer."}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            {template.isPurchased ? (
                              <>
                                <button
                                  onClick={() => handleDownloadPoster(template)}
                                  disabled={downloadingId === template.id}
                                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
                                >
                                  {downloadingId === template.id
                                    ? (isArabic ? "جاري التجهيز والتنزيل..." : "Sedang Mengunduh...")
                                    : t("downloadPng")}
                                </button>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleToggleFeature(template.id, template.isFeaturedOnPage)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                                      template.isFeaturedOnPage
                                        ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                                        : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                                    }`}
                                  >
                                    {template.isFeaturedOnPage
                                      ? `✓ ${t("showOnMyPage")}`
                                      : `+ ${t("showOnMyPage")}`}
                                  </button>
                                  <a
                                    href={`/api/marketplace/download?templateId=${template.id}`}
                                    download
                                    className="py-2 px-3 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition inline-flex items-center gap-1 shrink-0"
                                    title={isArabic ? "تحميل ملف المتجهات الأصلي (SVG)" : "Unduh File Vektor Asli (SVG)"}
                                  >
                                    <span>📄 SVG</span>
                                  </a>
                                </div>
                              </>
                            ) : isPending ? (
                              <button
                                disabled
                                className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed text-center"
                              >
                                {isArabic ? "طلبك قيد المراجعة لدى الأدمن ⏳" : "Menunggu Persetujuan Admin ⏳"}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenPurchase(template)}
                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition inline-flex items-center justify-center gap-2"
                              >
                                {!hasUsedFreeStarter
                                  ? (isArabic ? "الحصول عليه كبوستر مجاني أول 🎁" : "Ambil sebagai 1 Poster Gratis Pertama 🎁")
                                  : (isArabic ? "شراء وتخصيص البوستر 💳" : "Beli & Pasang Branding 💳")}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Purchase & Payment Options Dialog */}
      {selectedTemplateForPurchase && (
        <div
          className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
          dir={isArabic ? "rtl" : "ltr"}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 text-start space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {isArabic ? "خيارات شراء وتخصيص البوستر" : "Pilihan Pembelian & Lisensi Poster"}
              </h3>
              <button
                onClick={() => setSelectedTemplateForPurchase(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="font-extrabold text-slate-900 text-xs">
                {selectedTemplateForPurchase.title}
              </div>
              <div className="text-emerald-700 font-bold text-xs mt-0.5 font-mono">
                Rp {selectedTemplateForPurchase.price.toLocaleString("id-ID")}
              </div>
            </div>

            {purchaseError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                {purchaseError}
              </div>
            )}

            {purchaseSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
                {purchaseSuccessMsg}
              </div>
            )}

            {/* Payment Method Selector based on User Status */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                {isArabic ? "طريقة الدفع المتاحة لك:" : "Metode Pembayaran:"}
              </label>

              {/* Option A: Free Starter (If available) */}
              {!hasUsedFreeStarter && (
                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-amber-300 bg-amber-50/60 cursor-pointer">
                  <input
                    type="radio"
                    name="payMethod"
                    value="FREE_STARTER"
                    checked={chosenPaymentMethod === "FREE_STARTER"}
                    onChange={() => setChosenPaymentMethod("FREE_STARTER")}
                    className="mt-0.5 accent-emerald-600"
                  />
                  <div>
                    <div className="text-xs font-black text-amber-950">
                      🎁 {isArabic ? "بوستر البداية المجاني (حصري للمسوق الجديد)" : "Poster Gratis Awal (Khusus Mitra Baru)"}
                    </div>
                    <div className="text-[11px] text-amber-800 mt-0.5">
                      {isArabic
                        ? "يحق لك كمسوق معتمد اختيار تصميم واحد مجاناً دون أي خصم مالي."
                        : "Sebagai mitra baru, Anda berhak memilih 1 desain poster pertama tanpa biaya sama sekali."}
                    </div>
                  </div>
                </label>
              )}

              {/* Option B: Commission Balance (If user has balance >= price) */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition ${
                  userBalance >= selectedTemplateForPurchase.price
                    ? "border-emerald-300 bg-emerald-50/60 cursor-pointer"
                    : "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                }`}
              >
                <input
                  type="radio"
                  name="payMethod"
                  value="COMMISSION_BALANCE"
                  disabled={userBalance < selectedTemplateForPurchase.price}
                  checked={chosenPaymentMethod === "COMMISSION_BALANCE"}
                  onChange={() => setChosenPaymentMethod("COMMISSION_BALANCE")}
                  className="mt-0.5 accent-emerald-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">
                      ⚡ {isArabic ? "الخصم المباشر من رصيد أرباحي" : "Potong Saldo Komisi Aktif"}
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-700">
                      Saldo: Rp {userBalance.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {userBalance >= selectedTemplateForPurchase.price
                      ? (isArabic ? "خصم فوري وتفعيل فوري للبوستر والترخيص في ثانية واحدة." : "Otomatis dipotong dari saldo komisi Anda dan lisensi aktif instan.")
                      : (isArabic ? "(رصيدك الحالي غير كافٍ لهذا الخيار)" : "(Saldo tidak mencukupi untuk opsi ini)")}
                  </div>
                </div>
              </label>

              {/* Option C: Bank Transfer with Receipt Upload */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-300 bg-white cursor-pointer hover:border-slate-400 transition">
                <input
                  type="radio"
                  name="payMethod"
                  value="BANK_TRANSFER"
                  checked={chosenPaymentMethod === "BANK_TRANSFER"}
                  onChange={() => setChosenPaymentMethod("BANK_TRANSFER")}
                  className="mt-0.5 accent-emerald-600"
                />
                <div>
                  <div className="text-xs font-black text-slate-900">
                    🏦 {isArabic ? "التحويل البنكي وإرفاق إيصال الدفع" : "Transfer Bank Resmi UBK & Lampirkan Bukti"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {isArabic
                      ? "التحويل إلى حساب UBK المعتمد وإرفاق صورة الإشعار للمراجعة والاعتماد."
                      : "Transfer ke rekening resmi UBK dan kirimkan foto struk untuk diverifikasi admin."}
                  </div>
                </div>
              </label>
            </div>

            {/* Bank Transfer Details & Upload Box (Shown if BANK_TRANSFER is selected) */}
            {chosenPaymentMethod === "BANK_TRANSFER" && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="text-xs font-extrabold text-slate-900">
                  {isArabic ? "بيانات الحساب البنكي المعتمد (UBK):" : "Rekening Resmi Umar Bin Alkhattab for Umrah:"}
                </div>
                <div className="text-xs text-slate-700 space-y-1 font-mono bg-white p-3 rounded-xl border border-slate-200">
                  <div>Bank: <strong>{companyBank.bankName}</strong></div>
                  <div>No Rekening: <strong className="text-emerald-800 text-sm">{companyBank.accountNumber}</strong></div>
                  <div>Atas Nama: <strong>{companyBank.accountName}</strong></div>
                  <div>Nominal Transfer: <strong className="text-emerald-700">Rp {selectedTemplateForPurchase.price.toLocaleString("id-ID")}</strong></div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isArabic ? "رفع صورة إيصال التحويل (Bukti Transfer):" : "Unggah Foto / Bukti Struk Transfer Bank:"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptFileChange}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {receiptBase64 && (
                    <div className="mt-2 text-[11px] text-emerald-700 font-bold">
                      ✓ {isArabic ? "تم تجهيز الإيصال للإرسال" : "Bukti transfer siap dikirim"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedTemplateForPurchase(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                {isArabic ? "إلغاء" : "Batal"}
              </button>
              <button
                type="button"
                disabled={claimingId !== null}
                onClick={handleConfirmPurchase}
                className="px-6 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {claimingId !== null
                  ? (isArabic ? "جاري المعالجة..." : "Memproses...")
                  : chosenPaymentMethod === "FREE_STARTER"
                  ? (isArabic ? "تفعيل البوستر المجاني 🎁" : "Aktifkan Poster Gratis 🎁")
                  : chosenPaymentMethod === "COMMISSION_BALANCE"
                  ? (isArabic ? "تأكيد الخصم والتفعيل الفوري 🚀" : "Konfirmasi Potong Saldo & Aktifkan 🚀")
                  : (isArabic ? "إرسال الإيصال للأدمن 📤" : "Kirim Bukti Transfer ke Admin 📤")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / High-Res Zoom Modal */}
      {previewModalImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[80] flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setPreviewModalImage(null)}
        >
          <div
            className="max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">{previewModalImage.title}</span>
              <button
                onClick={() => setPreviewModalImage(null)}
                className="text-slate-500 hover:text-slate-800 font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewModalImage.url}
                alt={previewModalImage.title}
                className="max-h-[75vh] object-contain rounded-xl"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
