"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { UbkLogo } from "@/components/UbkLogo";
import { IslamicPattern } from "@/components/IslamicPattern";
import { MitraTermsModal } from "@/components/MitraTermsModal";

export interface MitraLandingViewProps {
  referralCode?: string;
  marketerName?: string;
  marketerPhone?: string;
}

/**
 * High-converting Marketer Recruitment Landing Page View.
 * Showcases commission structure, interactive earnings calculator,
 * working freedom (Work From Anywhere/Anytime), and terms agreement modal.
 */
export function MitraLandingView({
  referralCode,
  marketerName,
  marketerPhone,
}: MitraLandingViewProps) {
  const { t, isArabic } = useLanguage();

  // Modal State
  const [termsModalOpen, setTermsModalOpen] = useState<boolean>(false);

  // Interactive Calculator State
  const [directPilgrims, setDirectPilgrims] = useState<number>(10);
  const [teamPilgrims, setTeamPilgrims] = useState<number>(20);

  // Financial calculations (in IDR)
  const directCommissionPerPilgrim = 500000;
  const teamSupervisoryBonusPerPilgrim = 150000;

  const totalDirectEarnings = directPilgrims * directCommissionPerPilgrim;
  const totalTeamEarnings = teamPilgrims * teamSupervisoryBonusPerPilgrim;
  const grandTotalEarnings = totalDirectEarnings + totalTeamEarnings;

  // WhatsApp Routing Logic
  const rawPhone = marketerPhone || "6285110539752";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const targetWaNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.substring(1) : cleanPhone;

  const waMessage = referralCode
    ? encodeURIComponent(
        `Assalamu'alaikum Bapak/Ibu ${marketerName || "Mitra UBK"}, saya tertarik dan ingin bergabung menjadi bagian dari tim pemasaran Anda sebagai Sub-Marketer UBK Umrah (Kode Referal: ${referralCode}). Saya telah membaca dan menyetujui seluruh ketentuan kemitraan. Mohon informasi dan tautan undangannya. Terima kasih.\n\n----------------------------------------\n\nالسلام عليكم ورحمة الله وبركاته أ/ ${marketerName || "المسوّق"}, اطلعت على برنامج شركاء UBK للعمرة وأرغب في الانضمام ضمن فريقك كمسوّق فرعي تحت إشرافك (كود الإحالة: ${referralCode}). قرأت الشروط النظامية وأوافق عليها، يرجى تزويدي برابط ورقم الدعوة للتسجيل.`
      )
    : encodeURIComponent(
        `Assalamu'alaikum wr. wb., Saya tertarik dan ingin mendaftar sebagai Mitra Pemasar Langsung (Marketer Resmi) di UBK Umrah. Saya telah membaca dan menyetujui seluruh ketentuan kemitraan. Mohon informasi dan tautan undangan pendaftarannya. Terima kasih.\n\n----------------------------------------\n\nالسلام عليكم ورحمة الله وبركاته، أرغب في الانضمام كمسوّق مباشر معتمد لدى شركة عمر بن الخطاب للعمرة (UBK). قرأت الشروط والبنود النظامية وأوافق عليها بالكامل، يرجى التكرم بتزويدي برابط ورقم الدعوة للتسجيل في النظام.`
      );

  const targetWaLink = `https://wa.me/${targetWaNumber}?text=${waMessage}`;

  const handleOpenTermsModal = () => {
    setTermsModalOpen(true);
  };

  const handleAcceptAndProceedToWa = () => {
    setTermsModalOpen(false);
    window.open(targetWaLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 font-sans transition-all selection:bg-amber-400 selection:text-slate-950"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Terms & Conditions Modal */}
      <MitraTermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onAcceptAndProceed={handleAcceptAndProceedToWa}
        marketerName={marketerName}
        referralCode={referralCode}
      />

      {/* Navigation Header */}
      <header className="border-b border-amber-500/20 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-90 transition">
              <UbkLogo size="sm" variant="dark" showSubtitle={false} animated={true} />
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-amber-500/10 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-400/30">
              <span>🤝</span>
              <span>{isArabic ? "بوابة الشركاء والمسوقين" : "Portal Kemitraan Resmi"}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <LanguageSwitcher />

            <Link
              href="/auth/signin"
              className="font-bold text-amber-300/90 hover:text-amber-200 bg-slate-900 border border-amber-500/30 px-3.5 py-2 rounded-xl transition inline-flex items-center gap-1.5 shadow-sm"
            >
              <span>🔐</span>
              <span>{isArabic ? "دخول المسوق" : "Login Mitra"}</span>
            </Link>

            <button
              type="button"
              onClick={handleOpenTermsModal}
              className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl shadow-md transition active:scale-95 hidden sm:inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>🚀</span>
              <span>{isArabic ? "انضم الآن" : "Gabung Sekarang"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 text-center overflow-hidden">
        {/* Subtle Watermark Backdrop */}
        <IslamicPattern opacity={0.06} color="#d97706" scale={72} />

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          {/* Badge: Special Freedom Feature Highlight */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-black text-amber-300 bg-amber-500/10 rounded-full border border-amber-400/40 shadow-lg backdrop-blur-md">
            <span>✨</span>
            <span>
              {isArabic
                ? "دون الارتباط بأوقات عمل رسمية ومن أي مكان | حريتك المالية والزمانية"
                : "Fleksibel Penuh: Tanpa Terikat Jam Kantor & Lokasi, Dari Mana Saja"}
            </span>
            <span>✨</span>
          </div>

          {/* Sponsoring Marketer Notice (if referral link) */}
          {referralCode && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl max-w-md mx-auto text-xs text-emerald-200 font-semibold flex items-center justify-center gap-2">
              <span>🌟</span>
              <span>
                {isArabic ? (
                  <>
                    دعوة خاصة للانضمام إلى فريق المسوّق المعتمد: <strong>{marketerName || referralCode}</strong>
                  </>
                ) : (
                  <>
                    Undangan kemitraan resmi dalam tim mitra: <strong>{marketerName || referralCode}</strong>
                  </>
                )}
              </span>
            </div>
          )}

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.25] tracking-tight drop-shadow-2xl">
            {isArabic ? (
              <>
                كن شريكاً في خدمة ضيوف الرحمن وحقق{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-300">
                  أرباحاً مالية مجزية
                </span>{" "}
                بدون رأس مال
              </>
            ) : (
              <>
                Raih Penghasilan Berkah Bersama UBK Umrah{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-300">
                  Komisi Menarik & Tanpa Modal
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isArabic
              ? "برنامج تسويقي متكامل يوفر لك صفحة هبوط مستقلة باسمك، باركود QR، سوق بوستات دعائية مخصصة، وعمولة 500,000 روبية عن كل معتمر، بالإضافة إلى عوائد سلبية من مبيعات فريقك الفرعي."
              : "Program kemitraan umrah modern & syariah di Indonesia. Dapatkan landing page pribadi, QR code unik, desain promosi resmi, komisi hingga Rp 500.000,-/jamaah, dan passive income dari tim Anda."}
          </p>

          {/* Hero Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
            <button
              type="button"
              onClick={handleOpenTermsModal}
              className="w-full sm:w-auto flex-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 px-8 py-4 rounded-2xl font-black text-sm shadow-2xl shadow-emerald-950/60 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🚀</span>
              <span>{isArabic ? "طلب رابط الدعوة والانضمام" : "Minta Tautan Undangan Kemitraan"}</span>
            </button>

            <a
              href="#kalkulator"
              className="w-full sm:w-auto bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 px-6 py-4 rounded-2xl font-bold text-sm transition text-center"
            >
              <span>🧮</span>{" "}
              <span>{isArabic ? "حاسبة الأرباح" : "Kalkulator Komisi"}</span>
            </a>
          </div>

          <div className="text-[11px] text-slate-400 pt-1">
            {isArabic
              ? "🔒 التسجيل مجاني 100% ويخضع لنظام العمل والشراكات المستقلة الإندونيسي"
              : "🔒 Pendaftaran 100% Gratis. Tunduk pada regulasi kemitraan mandiri RI."}
          </div>
        </div>
      </section>

      {/* 6 Key Pillars / Features */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-slate-900/60 border-y border-amber-500/20">
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-14">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full">
              {isArabic ? "مزايا استثنائية للمسوقين" : "KEUNGGULAN PROGRAM MITRA"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {isArabic ? "لماذا UBK Umrah هو خيارك الأفضل للنجاح؟" : "Fasilitas & Keuntungan Maksimal Bagi Anda"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {isArabic
                ? "صممنا نظامنا ليمكنك من ممارسة نشاطك بأعلى إنتاجية وبدون أي قيود أو أعباء مالية."
                : "Semua infrastruktur digital dan legalitas telah kami siapkan agar Anda tinggal fokus promosi."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Working Freedom */}
            <div className="bg-slate-950 p-6 sm:p-7 rounded-3xl border-2 border-amber-400/40 hover:border-amber-400 transition-all duration-300 shadow-xl space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition" />
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center text-2xl font-black">
                ⏰
              </div>
              <h3 className="text-base font-black text-white">
                {isArabic ? "حرية الوقت والمكان (دون دوام رسمي)" : "Bebas Waktu & Lokasi (Work From Anywhere)"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "لا يوجد أي التزام بساعات عمل مكتبية أو تقارير حضور. أنت مدير نفسك؛ اعمل في أوقات فراغك، من منزلك، أو من أي مكان تريده في العالم بحرية مطلقة."
                  : "Tidak ada target jam kerja mengikat atau kewajiban ke kantor. Anda bebas mengatur waktu secara fleksibel dari rumah, kantor, atau di mana pun Anda berada."}
              </p>
            </div>

            {/* Feature 2: High Commissions */}
            <div className="bg-slate-950 p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center text-2xl font-black">
                💰
              </div>
              <h3 className="text-base font-black text-white">
                {isArabic ? "أرباح فورية ومجزية (500 ألف روبية)" : "Komisi Rp 500.000,- / Jamaah"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "تحصل على 500,000 روبية نقداً عن كل معتمر يتم تأكيد حجزه، مع سرعة صرف الأرباح إلى حسابك البنكي المعتمد (BCA, Mandiri, BRI, BNI, BSI) أو محفظتك الإلكترونية."
                  : "Dapatkan komisi bersih hingga Rp 500.000,- per jamaah yang mendaftar. Pencairan dana cepat langsung ke rekening bank atau e-wallet Anda."}
              </p>
            </div>

            {/* Feature 3: Isolated Personal Landing Page */}
            <div className="bg-slate-950 p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center text-2xl font-black">
                🌐
              </div>
              <h3 className="text-base font-black text-white">
                {isArabic ? "صفحة تسويقية مستقلة خاصة بك" : "Landing Page Khusus & Mandiri"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "صفحة ويب فاخرة باسمك، كودك الخاص، ورقم واتسابك الشخصي. معزولة عن الموقع العام لضمان بقاء عملائك مسجلين تحت أرباحك حصرياً دون تسرب."
                  : "Halaman web profesional dengan nama, nomor WhatsApp, dan kode referal Anda sendiri. Terisolasi agar jamaah Anda terkunci di akun Anda."}
              </p>
            </div>

            {/* Feature 4: Passive Income Tree */}
            <div className="bg-slate-950 p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-amber-500/50 transition-all duration-300 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center text-2xl font-black">
                🌳
              </div>
              <h3 className="text-base font-black text-white">
                {isArabic ? "دخل سلبي من بناء فريقك (شجرة الشركاء)" : "Passive Income Tim Kemitraan (Tree)"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "دعوة أصدقائك أو معارفك كمسوقين فرعيين تحت إشرافك تمنحك مكافأة إشرافية عن كل معتمر يسجلونه، مما يخلق لك تدفقاً مالياً متواصلاً."
                  : "Bentuk tim sub-marketer Anda sendiri. Setiap kali anggota tim Anda mendaftarkan jamaah, Anda menikmati bonus supervisi berkelanjutan."}
              </p>
            </div>

            {/* Feature 5: Poster Marketplace */}
            <div className="bg-slate-950 p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-purple-500/50 transition-all duration-300 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center text-2xl font-black">
                🎨
              </div>
              <h3 className="text-base font-black text-white">
                {isArabic ? "سوق بوستات تسويقية باسمك ورقمك" : "Marketplace Desain Promosi Berlisensi"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "تصاميم إعلانية احترافية لباقات العمرة، يتم تخصيصها باسمك ورقم هاتفك بنقرة واحدة لتحصل على بوستر تسويقي جاهز للنشر على واتساب وإنستغرام."
                  : "Koleksi poster umrah resolusi tinggi resmi berlisensi, otomatis memuat nama dan nomor WhatsApp Anda untuk dibagikan di media sosial."}
              </p>
            </div>

            {/* Feature 6: Government Accreditation & Sharia */}
            <div className="bg-slate-950 p-6 sm:p-7 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 shadow-xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center text-2xl font-black">
                🛡️
              </div>
              <h3 className="text-base font-black text-white">
                {isArabic ? "ترخيص حكومي موثوق (Kemenag PPIU)" : "Legalitas Resmi PPIU Kemenag RI"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "شراكة رسمية مع وكالة PT Asma Tour المرخصة من وزارة الشؤون الدينية، مع الالتزام التام بمعايير (5 Pasti Umrah) والضوابط الشرعية."
                  : "Bermitra resmi dengan PPIU PT Asma Tour berizin resmi Kemenag RI. Transparan, amanah, dan terjamin sesuai standar '5 Pasti Umrah'."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Calculator Section */}
      <section id="kalkulator" className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full">
              {isArabic ? "احسب أرباحك المتوقعة" : "KALKULATOR SIMULASI PENGHASILAN"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {isArabic ? "كم يمكنك أن تربح شهرياً كمسوّق؟" : "Berapa Potensi Penghasilan Bulanan Anda?"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              {isArabic
                ? "حرّك المؤشرات أدناه وشاهد أرباحك المباشرة بالإضافة إلى عوائد فريقك التسويقي بالروبية الإندونيسية فوراً."
                : "Geser slider di bawah untuk melihat simulasi komisi langsung dan bonus tim yang bisa Anda bawa pulang setiap bulan."}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-amber-500/30 p-6 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Sliders Area */}
            <div className="space-y-6">
              {/* Slider 1: Direct Pilgrims */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">
                    {isArabic ? "معتمرون عبر كودك المباشر:" : "Jumlah Jamaah Langsung:"}
                  </span>
                  <span className="font-mono font-black text-emerald-400 text-sm bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-800">
                    {directPilgrims} {isArabic ? "معتمر" : "Jamaah"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={directPilgrims}
                  onChange={(e) => setDirectPilgrims(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>

              {/* Slider 2: Team Pilgrims */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">
                    {isArabic ? "معتمرون عبر فريقك الفرعي (Tree):" : "Jamaah dari Tim Sub-Marketer:"}
                  </span>
                  <span className="font-mono font-black text-amber-400 text-sm bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-800">
                    {teamPilgrims} {isArabic ? "معتمر" : "Jamaah"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={teamPilgrims}
                  onChange={(e) => setTeamPilgrims(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800">
                💡{" "}
                {isArabic
                  ? "تحصل على 500,000 روبية عن كل معتمر مباشر، و150,000 روبية مكافأة إشرافية عن كل معتمر يسجله مسوقوك الفرعيون."
                  : "Anda memperoleh Rp 500.000,-/jamaah langsung dan Rp 150.000,- bonus supervisi/jamaah dari tim Anda."}
              </div>
            </div>

            {/* Total Results Box */}
            <div className="bg-slate-950 p-6 sm:p-7 rounded-2xl border border-emerald-500/40 text-center space-y-4 shadow-xl">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {isArabic ? "إجمالي دخلك المتوقع شهرياً" : "Estimasi Total Penghasilan Anda"}
              </span>

              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300 font-mono tracking-tight">
                Rp {grandTotalEarnings.toLocaleString("id-ID")}
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 border-t border-slate-900 pt-3 text-start">
                <div className="flex justify-between">
                  <span>{isArabic ? "أرباح الحجز المباشر:" : "Komisi Langsung:"}</span>
                  <strong className="text-emerald-400 font-mono">
                    Rp {totalDirectEarnings.toLocaleString("id-ID")}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>{isArabic ? "مكافآت إشراف الفريق:" : "Bonus Supervisi Tim:"}</span>
                  <strong className="text-amber-400 font-mono">
                    Rp {totalTeamEarnings.toLocaleString("id-ID")}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenTermsModal}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 text-slate-950 font-black text-xs hover:opacity-95 transition shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-95"
              >
                <span>🚀</span>{" "}
                <span>
                  {isArabic ? "ابدأ بتحقيق هذه الأرباح الآن" : "Mulai Raih Penghasilan Ini Sekarang"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Simple Steps */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-slate-900/60 border-y border-amber-500/20">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full">
              {isArabic ? "آلية العمل" : "LANGKAH MUDAH"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {isArabic ? "كيف تبدأ في 3 خطوات بسيطة؟" : "3 Langkah Mudah Menjadi Mitra"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 font-black text-xl flex items-center justify-center mx-auto border border-amber-400/30">
                1
              </div>
              <h3 className="font-black text-white text-base">
                {isArabic ? "طلب رابط الدعوة والموافقة" : "Minta Tautan Undangan"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "اضغط على زر الانضمام واطلع على الشروط النظامية ووافق عليها لإرسال طلب الدعوة الفوري عبر الواتساب."
                  : "Klik tombol gabung, setujui syarat & ketentuan kemitraan, lalu kirim permintaan undangan via WhatsApp resmi."}
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 font-black text-xl flex items-center justify-center mx-auto border border-emerald-400/30">
                2
              </div>
              <h3 className="font-black text-white text-base">
                {isArabic ? "استلام لوحتك ورابطك الخاص" : "Aktivasi Dasbor & Tautan"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "ستستلم رابط تفعيل حسابك، لتصدر فورياً صفحتك التسويقية، باركود QR الخاص بك، وتصل لسوق البوستات."
                  : "Dapatkan akses dasbor Anda, halaman landing mandiri atas nama Anda, serta materi promosi berlisensi."}
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 font-black text-xl flex items-center justify-center mx-auto border border-blue-400/30">
                3
              </div>
              <h3 className="font-black text-white text-base">
                {isArabic ? "شارك العروض واستلم أرباحك" : "Bagikan & Tarik Komisi"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "شارك عروض العمرة مع معارفك وشبكتك، وبمجرد تأكيد حجز المعتمر، اطلب تحويل عمولتك إلى حسابك البنكي فوراً."
                  : "Promosikan paket umrah, pantau jamaah yang mendaftar, dan ajukan pencairan komisi ke rekening bank Anda."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms & Regulations Highlight Box */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-start max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full">
              {isArabic ? "الشفافية والنظام" : "KEPATUHAN HUKUM & SYARIAH"}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {isArabic
                ? "شراكة نظامية تخضع للأنظمة وقوانين العمل الإندونيسية"
                : "Perjanjian Kemitraan Mandiri Sesuai Hukum Indonesia"}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isArabic
                ? "نلتزم بأعلى معايير الشفافية والأمانة. يمكنك الاطلاع على كامل بنود الشروط واللوائح التنظيمية الخاصة بالشراكة المستقلة قبل تأكيد طلبك."
                : "Tunduk pada KUHPerdata Pasal 1320 & 1338, UU Perlindungan Data Pribadi No. 27/2022, serta standar Kemenag PPIU RI."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenTermsModal}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 text-amber-300 border-2 border-amber-400/50 hover:border-amber-400 px-6 py-3.5 rounded-2xl font-bold text-xs transition shadow-lg shrink-0 cursor-pointer active:scale-95"
          >
            <span>📜</span>{" "}
            <span>{isArabic ? "عرض الشروط النظامية" : "Lihat Syarat & Ketentuan"}</span>
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-slate-900/60 border-t border-amber-500/20">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {isArabic ? "الأسئلة الشائعة للمسوقين" : "Pertanyaan yang Sering Diajukan (FAQ)"}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-amber-300">
                {isArabic ? "هل يلزمني التواجد في المكتب أو ساعات عمل محددة؟" : "Apakah ada kewajiban jam kerja atau datang ke kantor?"}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "لا مطلقاً! شراكتنا حرة ومستقلة 100%. يمكنك العمل في أي وقت يناسبك ومن أي مكان في إندونيسيا أو العالم دون أي التزام بدوام رسمي."
                  : "Sama sekali tidak ada! Kemitraan ini 100% mandiri dan fleksibel. Anda berhak menentukan sendiri waktu, durasi, dan tempat kerja tanpa kewajiban absensi kantor."}
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-amber-300">
                {isArabic ? "هل هناك أي رسوم اشتراك أو تكاليف للبدء؟" : "Apakah ada biaya pendaftaran untuk menjadi mitra?"}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "لا يوجد أي رسوم إطلاقاً. الانضمام مجاني تماماً 100%، وتستلم صفحتك التسويقية وكافة أدوات العمل بدون أي مقابل."
                  : "Pendaftaran 100% GRATIS tanpa dipungut biaya apa pun. Fasilitas landing page, materi promosi, dan akses sistem kami sediakan cuma-cuma."}
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-amber-300">
                {isArabic ? "كيف ومتى أستلم أرباحي؟" : "Bagaimana dan kapan komisi dicairkan?"}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "بمجرد سداد المعتمر لتكاليف رحلته واعتماد حجزه رسمياً في النظام، يُضاف رصيدك فورياً في لوحة تحكمك، ويمكنك طلب سحبه بضغطة زر إلى حسابك البنكي أو محفظتك الإلكترونية."
                  : "Setelah jamaah menyelesaikan pelunasan dan pesanan diverifikasi oleh admin, komisi langsung masuk ke saldo dasbor Anda dan dapat ditarik ke rekening bank Anda kapan saja."}
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-sm text-amber-300">
                {isArabic ? "هل يحق لي استلام مبالغ الحجز في حسابي الشخصي؟" : "Bolehkah saya menerima pembayaran jamaah ke rekening pribadi?"}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isArabic
                  ? "يُحظر تماماً استلام أي أموال في حسابك الشخصي؛ كافة مدفوعات المعتمرين تتم حصرياً ومباشرة إلى الحسابات البنكية الرسمية لشركة العمرة المرخصة (PT Asma Tour) حفاظاً على الأمانة وحماية لحقوقك وحقوق المعتمرين."
                  : "Dilarang keras menampung dana umrah di rekening pribadi. Seluruh pembayaran wajib langsung ditransfer oleh jamaah ke rekening bank resmi PT Asma Tour demi kepatuhan hukum dan transparansi."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 relative overflow-hidden text-center">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-slate-950 flex items-center justify-center text-3xl mx-auto shadow-2xl shadow-emerald-950/80">
            🕋
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {isArabic ? "جاهز للانطلاق كشريك معتمد لدى UBK Umrah؟" : "Siap Menjadi Mitra Sukses UBK Umrah?"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            {isArabic
              ? "اطلب رابط دعوتك الآن وابدأ في بناء مستقبلك التسويقي في خدمة ضيوف بيت الله الحرام."
              : "Ambil langkah awal Anda hari ini. Bergabung bersama kami dan nikmati kemudahan berbisnis umrah secara profesional dan berkah."}
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleOpenTermsModal}
              className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black text-sm px-10 py-4 rounded-2xl shadow-2xl shadow-emerald-950/70 transition-all duration-300 transform active:scale-95 inline-flex items-center gap-2 cursor-pointer"
            >
              <span>🚀</span>
              <span>{isArabic ? "موافقة على الشروط وطلب الدعوة 💬" : "Setujui Syarat & Minta Undangan Sekarang 💬"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto space-y-2">
          <p>© {new Date().getFullYear()} UMAR BIN AL-KHATTAB FOR UMRAH (UBK). All rights reserved.</p>
          <p className="text-[11px] text-slate-600">
            Penyelenggara Perjalanan Ibadah Umrah Resmi Berizin Kemenag RI (PT Asma Tour).
          </p>
        </div>
      </footer>
    </div>
  );
}
