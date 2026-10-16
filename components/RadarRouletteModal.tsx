"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Flame, MapPin, MessageCircle, Radar, Sparkles, X, AlertCircle } from "lucide-react";

interface HotLead {
  id: string;
  clientName: string;
  whatsappNumber: string;
  city: string;
  packageInterest: string;
  createdAt: string;
}

interface RadarRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadClaimed?: () => void;
}

export function RadarRouletteModal({
  isOpen,
  onClose,
  onLeadClaimed,
}: RadarRouletteModalProps) {
  const [loading, setLoading] = useState(false);
  const [hotLeads, setHotLeads] = useState<HotLead[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimedLead, setClaimedLead] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRadarPool();
    }
  }, [isOpen]);

  const fetchRadarPool = async () => {
    setLoading(true);
    setIsScanning(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/radar/roulette");
      const data = await res.json();
      setLoading(false);
      setTimeout(() => setIsScanning(false), 800);

      if (res.ok && data.isRadarUnlocked) {
        setHotLeads(data.hotLeads || []);
      } else {
        setErrorMsg(data.message || "Radar terkunci atau tidak tersedia.");
      }
    } catch (err) {
      setLoading(false);
      setIsScanning(false);
      setErrorMsg("Gagal memuat radar.");
    }
  };

  const handleClaim = async (leadId: string) => {
    setClaimingId(leadId);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/radar/roulette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rouletteId: leadId }),
      });

      const data = await res.json();
      setClaimingId(null);

      if (res.ok) {
        setClaimedLead(data.lead);
        // Refresh radar list
        fetchRadarPool();
        if (onLeadClaimed) onLeadClaimed();
      } else {
        setErrorMsg(data.error || "Gagal mengklaim peluang.");
      }
    } catch (err) {
      setClaimingId(null);
      setErrorMsg("Gangguan koneksi.");
    }
  };

  if (!isOpen) return null;

  const maskPhone = (phone: string) => {
    if (phone.length < 7) return phone;
    const start = phone.slice(0, 4);
    const end = phone.slice(-3);
    return `${start}-****-${end}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 text-white overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Radar className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">Radar Peluang Panas</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider">
                  Live Roulette
                </span>
              </div>
              <p className="text-xs text-slate-400">Peluang calon jamaah aktif di Jabodetabek (Siap Diklaim)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Claim Banner */}
          {claimedLead && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900/60 to-teal-900/60 border border-emerald-500/50 text-emerald-100 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Peluang Berhasil Diklaim & Masuk ke Mini-CRM Anda!</span>
              </div>
              <div className="bg-slate-950/60 rounded-xl p-3 text-xs space-y-1 font-mono">
                <p>👤 <strong>{claimedLead.clientName}</strong></p>
                <p>📲 WhatsApp: <strong className="text-emerald-400">{claimedLead.whatsappNumber}</strong></p>
                <p>🕋 Minat: {claimedLead.packageInterest}</p>
              </div>
              <a
                href={`https://wa.me/${claimedLead.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Assalamu'alaikum Warahmatullahi Wabarakatuh, ${claimedLead.clientName}. Saya konsultan resmi dari PT. Umar Bin Alkhattab for Umrah (UBK). Terkait rencana ibadah Umrah Anda, ada yang bisa saya bantu informasikan detail jadwal dan hotelnya?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <MessageCircle className="w-4 h-4 text-slate-950" />
                <span>Buka Chat WhatsApp Sekarang 💬</span>
              </a>
            </div>
          )}

          {/* Radar Animation Graphic */}
          <div className="relative py-4 flex flex-col items-center justify-center bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden">
            <div className="relative w-36 h-36 rounded-full border border-emerald-500/30 flex items-center justify-center">
              {/* Concentric Radar Rings */}
              <div className="w-24 h-24 rounded-full border border-emerald-500/20" />
              <div className="w-12 h-12 rounded-full border border-emerald-500/30" />
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-ping" />

              {/* Sweeping Radar Scanner Line */}
              <div className="absolute inset-0 rounded-full animate-spin [animation-duration:3s]">
                <div className="w-1/2 h-1/2 bg-gradient-to-br from-emerald-500/40 to-transparent origin-bottom-right rounded-tl-full" />
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-center">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{hotLeads.length} Peluang Terdeteksi di Sekitar Anda</span>
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sistem Roulette: Peluang yang diklaim akan langsung terkunci untuk Anda saja.
              </p>
            </div>
          </div>

          {/* Hot Leads Pool List */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Daftar Prospek Panas Tersedia:</span>
            </h4>

            {loading ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Memindai frekuensi calon jamaah...
              </div>
            ) : hotLeads.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/40 rounded-2xl border border-slate-800 text-xs text-slate-500">
                Belum ada prospek baru yang mengalir ke pool saat ini. Sistem akan memperbarui secara berkala.
              </div>
            ) : (
              hotLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-100">{lead.clientName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        {maskPhone(lead.whatsappNumber)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>{lead.city}</span>
                      </span>
                      <span>•</span>
                      <span className="text-amber-300/90 font-medium">{lead.packageInterest}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaim(lead.id)}
                    disabled={claimingId === lead.id}
                    className="py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
                  >
                    {claimingId === lead.id ? (
                      "Mengklaim..."
                    ) : (
                      <>
                        <Radar className="w-3.5 h-3.5" />
                        <span>Klaim Prospek Ini 🚀</span>
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
