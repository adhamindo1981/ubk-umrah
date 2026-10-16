"use client";

import React, { useState } from "react";
import { Calculator, CheckCircle2, Copy, Send, Sparkles, X, UserPlus } from "lucide-react";

interface TabunganCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadSaved?: () => void;
  marketerCode?: string;
  marketerName?: string;
}

export function TabunganCalculatorModal({
  isOpen,
  onClose,
  onLeadSaved,
  marketerCode = "",
  marketerName = "",
}: TabunganCalculatorModalProps) {
  // Preset Umrah Package Prices in IDR
  const [totalPrice, setTotalPrice] = useState<number>(29900000);
  const [dpAmount, setDpAmount] = useState<number>(5000000); // Standard DP Rp 5.000.000
  const [durationMonths, setDurationMonths] = useState<number>(12); // 6, 12, 18, 24 months

  // Form for saving as CRM Lead
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [clientName, setClientName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const remainingBalance = Math.max(0, totalPrice - dpAmount);
  const monthlyInstallment = Math.round(remainingBalance / durationMonths);

  const formatIDR = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

  // WhatsApp Simulation Template
  const generateWaSimulationText = () => {
    return `*SIMULASI TABUNGAN UMRAH UBK (PT. UMAR BIN AL-KHATTAB)* 🕋✨
_Solusi Menuju Baitullah dengan Perencanaan Terjangkau & Amanah_

Assalamu'alaikum Warahmatullahi Wabarakatuh,
Bapak/Ibu yang dirahmati Allah, berikut rincian rencana tabungan Umrah:

💰 *Estimasi Biaya Paket:* ${formatIDR(totalPrice)}
💵 *Uang Muka (DP Awal):* ${formatIDR(dpAmount)}
⏳ *Target Waktu Menabung:* ${durationMonths} Bulan
📌 *Cicilan Ringan per Bulan:* *${formatIDR(monthlyInstallment)} / bulan*

✅ Rekening Penampungan Resmi: Bank Syariah Indonesia (BSI) a.n. PT. UMAR BIN AL-KHATTAB FOR UMRAH
✅ Keberangkatan Terjadwal Sesuai Sunnah & Berizin Resmi PPIU Kemenag

Mari kita mulai langkah niat suci ke Tanah Suci hari ini. Untuk konsultasi & pendaftaran lebih lanjut:
👤 *Konsultan Pendamping:* ${marketerName || "Mitra Resmi UBK"}
📲 *Hubungi WhatsApp:* wa.me/?text=Saya%20tertarik%20Tabungan%20Umrah

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;
  };

  const handleCopySimulation = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(generateWaSimulationText());
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  const handleSaveToCrm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !whatsappNumber.trim()) {
      setNotification("Nama dan Nomor WhatsApp calon jamaah wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientName.trim(),
          whatsappNumber: whatsappNumber.trim(),
          source: "TABUNGAN_CALCULATOR",
          status: "NEW",
          packageInterest: `Tabungan ${durationMonths} Bulan (${formatIDR(monthlyInstallment)}/bln)`,
          dpAmount,
          monthlyPlan: monthlyInstallment,
          notes: notes.trim() || `Simulasi Tabungan Umrah ${durationMonths} Bulan. Total: ${formatIDR(totalPrice)}`,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok) {
        setNotification("✅ Prospek berhasil disimpan ke daftar Mini-CRM Anda!");
        setClientName("");
        setWhatsappNumber("");
        setNotes("");
        setShowSaveForm(false);
        if (onLeadSaved) onLeadSaved();
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification(data.error || "Gagal menyimpan prospek.");
      }
    } catch (err) {
      setIsSubmitting(false);
      setNotification("Terjadi gangguan koneksi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                Kalkulator Tabungan Umrah
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  DP 5 Juta
                </span>
              </h3>
              <p className="text-xs text-emerald-200/80">Simulasi cicilan bulanan ringan menuju Baitullah</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {notification && (
            <div className="p-3 text-xs rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* 1. Pilih Paket & Estimasi Biaya */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Estimasi Biaya Paket Umrah (Total):
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {[
                { label: "Paket Taysir", price: 29900000 },
                { label: "Paket Berkah", price: 31500000 },
                { label: "Paket VIP", price: 34500000 },
              ].map((item) => (
                <button
                  key={item.price}
                  type="button"
                  onClick={() => setTotalPrice(item.price)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                    totalPrice === item.price
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[11px] font-mono text-emerald-600 font-extrabold">
                    {formatIDR(item.price)}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
              <input
                type="number"
                value={totalPrice}
                onChange={(e) => setTotalPrice(Number(e.target.value) || 0)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                placeholder="Masukkan nominal custom..."
              />
            </div>
          </div>

          {/* 2. Uang Muka (DP) */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span>💰 Uang Muka / DP Awal:</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-200/80 rounded-md text-amber-800">
                  Standar UBK
                </span>
              </label>
              <span className="text-sm font-extrabold font-mono text-amber-700">
                {formatIDR(dpAmount)}
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 leading-relaxed">
              Jamaah mengunci seat dan nomor registrasi dengan DP awal Rp 5.000.000 ke rekening resmi perusahaan.
            </p>
          </div>

          {/* 3. Durasi Menabung */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Jangka Waktu Cicilan Tabungan:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[6, 12, 18, 24].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMonths(m)}
                  className={`py-2 px-2 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                    durationMonths === m
                      ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-sm font-extrabold">{m}</span>
                  <span className="text-[10px] opacity-80">Bulan</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Hasil Kalkulasi Highlight Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-3 text-xs text-slate-300">
              <span>Sisa Biaya yang Dicicil:</span>
              <span className="font-mono font-bold text-slate-200">{formatIDR(remainingBalance)}</span>
            </div>

            <div className="border-t border-slate-700/60 pt-3">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                Angsuran Menabung per Bulan:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold font-mono text-amber-300 tracking-tight">
                  {formatIDR(monthlyInstallment)}
                </span>
                <span className="text-xs text-slate-400">/ bulan ({durationMonths}x)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800 flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Cicilan fleksibel tanpa denda, langsung disetorkan ke rekening giro BSI resmi UBK.</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleCopySimulation}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                copiedText
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
              }`}
            >
              {copiedText ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Teks Simulasi Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-600" />
                  <span>Salin Format Penawaran WhatsApp</span>
                </>
              )}
            </button>

            {!showSaveForm ? (
              <button
                type="button"
                onClick={() => setShowSaveForm(true)}
                className="w-full py-3 px-4 rounded-2xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center justify-center gap-2 shadow-sm"
              >
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>Simpan sebagai Prospek Jamaah (Mini-CRM)</span>
              </button>
            ) : (
              <form onSubmit={handleSaveToCrm} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Simpan Prospek ke Daftar CRM Anda:</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Calon Jamaah *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Contoh: Bpk. Ahmad Dahlan"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nomor WhatsApp (Aktif) *</label>
                  <input
                    type="text"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Contoh: 081234567890 atau +628..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Catatan Tambahan (Opsional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Rencana berangkat bersama istri bulan Desember"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? "Menyimpan..." : "Konfirmasi Simpan Prospek"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSaveForm(false)}
                    className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
