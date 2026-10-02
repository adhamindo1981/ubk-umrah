"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export interface MitraTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptAndProceed: () => void;
  marketerName?: string;
  referralCode?: string;
}

/**
 * Legal & Regulatory Terms of Partnership Modal.
 * Compliant with Indonesian Civil Code (KUHPerdata Pasal 1320 & 1338),
 * Freelance Independent Partnership (Kemitraan Mandiri),
 * Personal Data Protection (UU PDP No. 27/2022),
 * and Indonesian Ministry of Religious Affairs (Kemenag PPIU) Umrah guidelines.
 */
export function MitraTermsModal({
  isOpen,
  onClose,
  onAcceptAndProceed,
  marketerName,
  referralCode,
}: MitraTermsModalProps) {
  const { isArabic } = useLanguage();
  const [agreed, setAgreed] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="bg-slate-900 border border-amber-500/40 text-slate-100 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
              ⚖️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-300">
                {isArabic
                  ? "وثيقة شروط الانضمام كمسوّق معتمد"
                  : "Ketentuan & Syarat Kemitraan Pemasar Mandiri"}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isArabic
                  ? "متوافقة مع الأنظمة التجارية ونظام العمل والشراكات في جمهورية إندونيسيا (KUHPerdata & UU RI)"
                  : "Sesuai Regulasi Kemitraan Mandiri RI (KUHPerdata & Kemenag PPIU)"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body - Scrollable Terms */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-300 divide-y divide-slate-800/80">
          {/* Note Banner */}
          <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-[11px] text-amber-200/90 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <span>📌</span>
              <span>
                {isArabic
                  ? "تنبيه نظامي هام للمتقدمين:"
                  : "Pemberitahuan Hukum Kemitraan:"}
              </span>
            </div>
            <p>
              {isArabic
                ? "الانضمام إلى برنامج UBK Umrah التسويقي يتم وفق عقد (شراكة تسويقية حرة ومستقلة بالعمولة)، دون اشتراط الدوام المكتبي أو ساعات عمل محددة، مع الالتزام التام بالأنظمة والضوابط الشرعية والنظامية."
                : "Kemitraan ini berstatus Kemitraan Mandiri (Freelance Affiliate Partner), di mana Anda memiliki kebebasan penuh dalam mengatur waktu dan lokasi kerja tanpa keterikatan hubungan kerja tetap (karyawan)."}
            </p>
          </div>

          {/* Clause 1 */}
          <div className="pt-3 space-y-1">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <span className="text-amber-400">1.</span>
              <span>
                {isArabic
                  ? "طبيعة العلاقة التعاقدية (Hubungan Kemitraan Mandiri)"
                  : "1. Sifat Hubungan Kemitraan (KUHPerdata Pasal 1320 & 1338)"}
              </span>
            </h3>
            <p className="text-slate-400">
              {isArabic
                ? "تخضع هذه الشراكة لأحكام القانون المدني الإندونيسي المتعلقة بحرية التعاقد والشراكات المستقلة. لا يُعد المسوق موظفاً براتب شهري ثابت أو عاملاً خاضعاً لعلاقة عمل تبعية، بل شريكاً مستقلاً يتقاضى عمولات ومكافآت مجزية مقابل الحجوزات الناجحة."
                : "Hubungan hukum antara UBK Umrah (PT Asma Tour) dan Mitra adalah Kemitraan Mandiri. Mitra bukan berstatus karyawan tetap/buruh perusahaan sehingga tidak tunduk pada kewajiban absensi kantor maupun hak atas gaji pokok bulanan, melainkan berbasis komisi hasil nyata."}
            </p>
          </div>

          {/* Clause 2: Flexibility Highlight */}
          <div className="pt-3 space-y-1">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <span className="text-amber-400">2.</span>
              <span>
                {isArabic
                  ? "مرونة أوقات ومكان العمل (Fleksibilitas Waktu & Lokasi)"
                  : "2. Kebebasan Waktu Kerja & Lokasi (Work From Anywhere)"}
              </span>
            </h3>
            <p className="text-slate-400">
              {isArabic
                ? "يتمتع المسوّق بحرية مطلقة في تحديد أوقات عمله، جدول نشاطه، ومكانه الجغرافي دون أي إلزام بساعات دوام رسمي أو التواجد في مقر الشركة، ويمكنه ممارسة التسويق عن بُعد من أي مكان في إندونيسيا أو خارجها."
                : "Mitra berhak sepenuhnya menentukan waktu, durasi, dan lokasi kegiatan promosi secara mandiri tanpa batasan jam kantor formal. Kegiatan dapat dijalankan secara fleksibel (Work from Anywhere) baik secara online maupun tatap muka."}
            </p>
          </div>

          {/* Clause 3 */}
          <div className="pt-3 space-y-1">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <span className="text-amber-400">3.</span>
              <span>
                {isArabic
                  ? "استحقاق وصرف العمولات والمكافآت (Sistem Komisi)"
                  : "3. Ketentuan Komisi & Pembayaran (Payout)"}
              </span>
            </h3>
            <p className="text-slate-400">
              {isArabic
                ? "يستحق المسوّق عمولته المحددة (500,000 روبية عن كل معتمر للمسوق المباشر، أو الحصة المقررة للمسوق الفرعي + مكافأة الإشراف) بمجرد سداد المعتمر لتكاليف الباقة وتأكيد حجزه رسمياً في النظام. وتُصرف الأرباح عبر التحويل البنكي أو المحافظ الإلكترونية المعتمدة فور تقديم طلب السحب."
                : "Hak komisi kemitraan (Rp 500.000,- per jamaah atau pembagian sub-marketer sesuai sistem) berlaku setelah status pemesanan jamaah terverifikasi lunas (APPROVED). Pencairan dana diproses ke rekening bank atau e-wallet resmi Mitra."}
            </p>
          </div>

          {/* Clause 4 */}
          <div className="pt-3 space-y-1">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <span className="text-amber-400">4.</span>
              <span>
                {isArabic
                  ? "الأمانة المالية ومنع تحصيل الأموال الشخصية (Integritas Finansial)"
                  : "4. Larangan Menerima Dana Tunai Secara Pribadi"}
              </span>
            </h3>
            <p className="text-slate-400">
              {isArabic
                ? "يُحظر تماماً على المسوّق استلام أي مبالغ مالية أو دفعات حجز في حسابه البنكي الشخصي نيابة عن المعتمرين. يجب توجيه كافة مدفوعات الباقات حصرياً للحسابات البنكية الرسمية لشركة العمرة المرخصة (PT Asma Tour / UBK Umrah) لحماية حقوق المعتمرين والمسوق."
                : "Mitra dilarang keras menampung dana pendaftaran umrah ke rekening pribadi. Seluruh pembayaran biaya umrah wajib ditransfer langsung oleh jamaah ke rekening bank resmi perusahaan (PT Asma Tour / UBK Umrah) demi keamanan transaksi."}
            </p>
          </div>

          {/* Clause 5 */}
          <div className="pt-3 space-y-1">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <span className="text-amber-400">5.</span>
              <span>
                {isArabic
                  ? "حماية بيانات المعتمرين (Kepatuhan UU Perlindungan Data Pribadi)"
                  : "5. Perlindungan Data Pribadi Jamaah (UU PDP No. 27/2022)"}
              </span>
            </h3>
            <p className="text-slate-400">
              {isArabic
                ? "يلتزم المسوق التزاماً صارماً بعدم إفشاء أو استغلال أرقام هواتف أو بيانات المعتمرين لأي أغراض أخرى خارج نطاق خدمات العمرة، وفقاً لقانون حماية البيانات الشخصية الإندونيسي (UU PDP)."
                : "Mitra wajib menjaga kerahasiaan identitas dan nomor kontak jamaah sesuai ketentuan Undang-Undang Perlindungan Data Pribadi RI No. 27 Tahun 2022."}
            </p>
          </div>

          {/* Clause 6 */}
          <div className="pt-3 space-y-1">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <span className="text-amber-400">6.</span>
              <span>
                {isArabic
                  ? "الالتزام بضوابط وزارة الشؤون الدينية (Regulasi Kemenag PPIU)"
                  : "6. Kepatuhan Standar Penyelenggaraan Umrah (Kemenag RI)"}
              </span>
            </h3>
            <p className="text-slate-400">
              {isArabic
                ? "يلتزم المسوق بتقديم معلومات صحيحة ومطابقة للواقع بخصوص مواصفات الفنادق، الطيران، وبرامج الرحلات المعتمدة دون أي مبالغات أو وعود غير معتمدة من إدارة الشركة والجهات المنظمة."
                : "Mitra berjanji memberikan sosialisasi program umrah yang benar, transparan, dan berpedoman pada standar '5 Pasti Umrah' Kementerian Agama Republik Indonesia."}
            </p>
          </div>
        </div>

        {/* Modal Footer - Checkbox & Confirm CTA */}
        <div className="p-5 sm:p-6 border-t border-slate-800 bg-slate-950/90 space-y-4 shrink-0">
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 rounded-md border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-900 mt-0.5 shrink-0 cursor-pointer"
            />
            <span className="text-xs text-slate-300 group-hover:text-white transition leading-snug">
              {isArabic ? (
                <>
                  أقر بأنني قرأت وفهمت كافة <strong>الشروط والبنود النظامية</strong> أعلاه، وأوافق عليها بالكامل للانضمام كمسوّق معتمد{" "}
                  {referralCode ? (
                    <span className="text-amber-300 font-bold">
                      (تحت إشراف المسوّق: {marketerName || referralCode})
                    </span>
                  ) : (
                    <span className="text-emerald-300 font-bold">(مسوّق مباشر معتمد)</span>
                  )}
                  .
                </>
              ) : (
                <>
                  Saya menyatakan telah membaca, memahami, dan menyetujui seluruh{" "}
                  <strong>Ketentuan & Regulasi Kemitraan Mandiri</strong> di atas untuk mendaftar sebagai Mitra Resmi{" "}
                  {referralCode ? (
                    <span className="text-amber-300 font-bold">
                      (Dalam Tim Mitra: {marketerName || referralCode})
                    </span>
                  ) : (
                    <span className="text-emerald-300 font-bold">(Mitra Pemasar Langsung)</span>
                  )}
                  .
                </>
              )}
            </span>
          </label>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onAcceptAndProceed}
              disabled={!agreed}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-xl ${
                agreed
                  ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 text-slate-950 hover:from-emerald-500 hover:to-amber-400 cursor-pointer active:scale-95 shadow-emerald-950/60"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              <span>💬</span>
              <span>
                {isArabic
                  ? "موافقة ومتابعة طلب الدعوة عبر الواتساب"
                  : "Setujui & Lanjutkan Permintaan Undangan ke WhatsApp"}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 rounded-2xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
            >
              {isArabic ? "إغلاق" : "Tutup"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
