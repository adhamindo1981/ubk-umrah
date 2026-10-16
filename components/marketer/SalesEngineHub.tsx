"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Filter,
  Flame,
  HelpCircle,
  Image as ImageIcon,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  QrCode,
  Radar,
  Search,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Unlock,
  UserCheck,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { ObjectionAssistant } from "@/components/marketer/ObjectionAssistant";
import { PosterMarketplaceModal } from "@/components/PosterMarketplaceModal";

export interface SalesEngineHubProps {
  user: {
    id: number;
    username: string;
    referralCode: string | null;
    whatsapp: string | null;
  };
  personalPageUrl: string;
  waLink: string;
  qrCodeDataUrl: string;
}

interface Lead {
  id: string;
  clientName: string;
  whatsappNumber: string;
  source: string;
  status: "NEW" | "CONTACTED" | "INTERESTED" | "DP_PAID" | "CLOSED_WON";
  packageInterest: string;
  dpAmount: number;
  monthlyPlan?: number | null;
  notes?: string | null;
  lastContactedAt?: string | null;
  createdAt: string;
}

interface HotLead {
  id: string;
  clientName: string;
  whatsappNumber: string;
  city: string;
  packageInterest: string;
  createdAt: string;
}

interface DailyMissionData {
  id: string;
  missionDate: string;
  contactsAddedCount: number;
  whatsappSentCount: number;
  isRadarUnlocked: boolean;
  pointsEarned: number;
  targetWhatsapp: number;
  progressPercentage: number;
}

export function SalesEngineHub({
  user,
  personalPageUrl,
  waLink,
  qrCodeDataUrl,
}: SalesEngineHubProps) {
  const { isArabic } = useLanguage();

  // Active Tab State (misi | crm | asisten | media)
  const [activeTab, setActiveTab] = useState<"misi" | "crm" | "asisten" | "media">("misi");

  // Mission & Roulette States
  const [mission, setMission] = useState<DailyMissionData | null>(null);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [rouletteLeads, setRouletteLeads] = useState<HotLead[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [missionLoading, setMissionLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // CRM Leads States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Quick Add Prospect Form States
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [newPhone, setNewPhone] = useState<string>("");
  const [newPackage, setNewPackage] = useState<string>("NOVEMBER_2026_30.9JT");
  const [newNotes, setNewNotes] = useState<string>("");
  const [isAddingLead, setIsAddingLead] = useState<boolean>(false);

  // Fetch Daily Mission & Roulette
  const fetchMissionAndRoulette = async () => {
    try {
      const [missionRes, rouletteRes] = await Promise.all([
        fetch("/api/marketer/missions"),
        fetch("/api/marketer/roulette"),
      ]);

      if (missionRes.ok) {
        const mData = await missionRes.json();
        setMission(mData.mission);
        setTotalPoints(mData.totalPoints || 0);
      }

      if (rouletteRes.ok) {
        const rData = await rouletteRes.json();
        setRouletteLeads(rData.leads || []);
      }
    } catch (err) {
      console.error("Error fetching mission/roulette:", err);
    } finally {
      setMissionLoading(false);
    }
  };

  // Fetch CRM Leads
  const fetchLeads = async () => {
    try {
      setLeadsLoading(true);
      const res = await fetch("/api/marketer/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLeadsLoading(false);
    }
  };

  useEffect(() => {
    fetchMissionAndRoulette();
    fetchLeads();
  }, []);

  // Quick Action: Add Prospect
  const handleAddProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    setIsAddingLead(true);
    setNotification(null);

    try {
      const res = await fetch("/api/marketer/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: newName.trim(),
          whatsappNumber: newPhone.trim(),
          packageInterest: newPackage,
          notes: newNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambah jamaah");

      setNewName("");
      setNewPhone("");
      setNewNotes("");
      setShowAddForm(false);
      setNotification({
        type: "success",
        text: "Prospek jamaah berhasil ditambahkan ke CRM Anda!",
      });

      // Refresh
      fetchLeads();
      fetchMissionAndRoulette();
    } catch (err: any) {
      setNotification({ type: "error", text: err.message });
    } finally {
      setIsAddingLead(false);
    }
  };

  // Action: Kirim WA Pintar & Increment Daily Mission
  const handleKirimWaPintar = async (lead: Lead) => {
    try {
      // 1. Increment mission count
      await fetch("/api/marketer/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SEND_WHATSAPP", increment: 1 }),
      });

      // 2. Mark lastContactedAt in CRM
      await fetch(`/api/marketer/leads?id=${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastContactedAt: true, status: "CONTACTED" }),
      });

      // 3. Build personalized pitch
      const cleanWa = lead.whatsappNumber.replace(/\D/g, "");
      const pitchText = encodeURIComponent(
        `Assalamu'alaikum Bapak/Ibu ${lead.clientName},\n\n` +
          `Semoga senantiasa dalam lindungan Allah Ta'ala. Izin bersilaturahmi, saya ${user.username} konsultan resmi UBK Umrah (Izin PPIU No. U-271 Tahun 2021).\n\n` +
          `Menindaklanjuti niat ibadah Anda untuk program *${lead.packageInterest}*, izin kami sampaikan bahwa penerbangan kami menggunakan maskapai bintang lima *Qatar Airways* dan *Hotel Dekat Masjid Tanpa Shuttle Bus* (jalan kaki santai).\n\n` +
          `✨ *Kabar Baiknya:* Anda *Cukup DP Rp 5.000.000* untuk langsung mengamankan kuota seat hari ini, dan sudah termasuk gratis hidangan khas Albaik!\n\n` +
          `Boleh cek rincian fasilitas lengkap dan simulasi tabungannya di tautan resmi saya ini:\n` +
          `${personalPageUrl}\n\n` +
          `Apakah ada waktu sebentar jika kami bantu reservasikan seat-nya sebelum kuota promo habis? Terima kasih. 🙏`
      );

      // Open WhatsApp
      window.open(`https://wa.me/${cleanWa}?text=${pitchText}`, "_blank");

      // Refresh state
      fetchMissionAndRoulette();
      fetchLeads();
    } catch (err) {
      console.error("Error triggering Kirim WA Pintar:", err);
    }
  };

  // Action: Toggle Lead Status
  const handleUpdateStatus = async (leadId: string, currentStatus: string) => {
    const statusCycle: Record<string, "NEW" | "CONTACTED" | "INTERESTED" | "DP_PAID"> = {
      NEW: "CONTACTED",
      CONTACTED: "INTERESTED",
      INTERESTED: "DP_PAID",
      DP_PAID: "NEW",
    };
    const nextStatus = statusCycle[currentStatus] || "NEW";

    try {
      const res = await fetch(`/api/marketer/leads?id=${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  // Action: Claim Hot Lead from Roulette
  const handleClaimHotLead = async (rouletteId: string) => {
    setClaimingId(rouletteId);
    setNotification(null);

    try {
      const res = await fetch("/api/marketer/roulette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rouletteId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengklaim peluang.");

      setNotification({
        type: "success",
        text: "Alhamdulillah! Jamaah berhasil diamankan ke CRM Anda. Silakan hubungi via WhatsApp.",
      });

      if (data.waUrl) {
        window.open(data.waUrl, "_blank");
      }

      fetchMissionAndRoulette();
      fetchLeads();
    } catch (err: any) {
      setNotification({ type: "error", text: err.message });
    } finally {
      setClaimingId(null);
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const matchesStatus = statusFilter === "ALL" || l.status === statusFilter;
    const matchesSearch =
      l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.whatsappNumber.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const isUnlocked = mission?.isRadarUnlocked || false;
  const contactsSent = mission?.whatsappSentCount || 0;
  const targetSent = mission?.targetWhatsapp || 3;
  const progressPercent = Math.min(100, Math.round((contactsSent / targetSent) * 100));

  return (
    <div className="space-y-6 pb-24 sm:pb-8">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-lg transition animate-fadeIn ${
            notification.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/50"
              : "bg-rose-950/90 text-rose-300 border-rose-500/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{notification.type === "success" ? "✅" : "⚠️"}</span>
            <span>{notification.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Desktop / Tablet Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs hidden sm:flex items-center justify-between gap-2">
        {(
          [
            { id: "misi", label: "🎯 Misi & Radar Peluang", labelAr: "🎯 المهام والرادار" },
            { id: "crm", label: "👥 Jamaah Saya (CRM)", labelAr: "👥 قائمة العملاء" },
            { id: "asisten", label: "🤖 Asisten Pintar (Bantu Jawab)", labelAr: "🤖 المساعد الذكي" },
            { id: "media", label: "🖼️ Kit Promosi & Media", labelAr: "🖼️ حقيبة الترويج" },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                active
                  ? "bg-slate-900 text-emerald-400 shadow-md shadow-slate-900/10 font-black"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <span>{isArabic ? tab.labelAr : tab.label}</span>
              {tab.id === "misi" && isUnlocked && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: MISI HARIAN & RADAR PELUANG
      ========================================================================== */}
      {activeTab === "misi" && (
        <div className="space-y-6">
          {/* Daily Mission Hero Card */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl border border-emerald-800/60 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-emerald-900/60">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full">
                  <Target className="w-3.5 h-3.5" />
                  <span>TARGET PENJUALAN HARIAN MITRA</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Misi Hari Ini: Hubungi 3 Calon Jamaah
                </h3>
                <p className="text-xs text-slate-300 max-w-lg">
                  Kirimkan sapaan penawaran Umrah (DP 5 Juta & Qatar Airways) ke minimal 3 kontak untuk membuka kunci *Radar Peluang Panas* secara otomatis.
                </p>
              </div>

              {/* Points Badge */}
              <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 px-4 py-3 rounded-2xl shrink-0 shadow-inner">
                <Award className="w-6 h-6 text-amber-400" />
                <div className="text-start">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Poin Hadiah</div>
                  <div className="text-base font-black text-amber-300 font-mono">
                    {totalPoints.toLocaleString()} PTS
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="pt-6 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <Flame className="w-4 h-4 text-rose-400 fill-rose-400" />
                  <span>
                    Progres Misi: <strong>{contactsSent}</strong> dari <strong>{targetSent}</strong> Kontak Terhubung
                  </span>
                </span>
                <span className="font-mono text-emerald-400 font-bold">{progressPercent}%</span>
              </div>

              {/* Visual Track */}
              <div className="h-3 w-full bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-emerald-900">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 shadow-sm shadow-emerald-400/50"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>

              {/* Status Pill */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                {isUnlocked ? (
                  <div className="inline-flex items-center gap-1.5 text-emerald-300 font-black bg-emerald-900/40 border border-emerald-500/40 px-3 py-1 rounded-xl">
                    <Unlock className="w-4 h-4 text-emerald-400" />
                    <span>Radar Peluang Terbuka Penuh! Akses leads hangat di bawah.</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-amber-300 font-bold bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-xl">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Kirim {Math.max(0, targetSent - contactsSent)} pesan WA lagi untuk membuka Radar.</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab("crm")}
                  className="text-xs font-bold text-amber-300 hover:text-amber-200 underline flex items-center gap-1"
                >
                  <span>Buka Jamaah Saya & Kirim WA</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Lead Roulette Radar Section with Framer Motion Lock Animation */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Radar className={`w-5 h-5 ${isUnlocked ? "text-rose-600 animate-spin-slow" : "text-slate-400"}`} />
                  <h3 className="text-lg font-black text-slate-900">
                    Radar Peluang Jamaah (Lead Roulette Pool)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Pusat penampungan calon jamaah potensial Jabodetabek. Sistem *siapa cepat dia dapat* (Atomic First-Claim).
                </p>
              </div>

              {isUnlocked && (
                <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 font-black px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-rose-600" />
                  <span>{rouletteLeads.length} Peluang Tersedia</span>
                </span>
              )}
            </div>

            {/* Lock Overlay or Unlocked Pool */}
            {!isUnlocked ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 px-6 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 text-center space-y-4"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-3xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-xl"
                >
                  <Lock className="w-8 h-8" />
                </motion.div>

                <div className="space-y-1 max-w-md mx-auto">
                  <h4 className="font-extrabold text-base text-slate-900">
                    Radar Terkunci! Selesaikan Misi Harian Anda
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sistem mengamankan nomor kontak prospek hangat agar dibagikan adil kepada pemasar yang aktif. Kirimkan pesan ke 3 jamaah untuk membukanya.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("crm")}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Mulai Kirim WA ke Jamaah Saya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rouletteLeads.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                    Saat ini seluruh peluang jamaah telah habis diklaim. Sistem akan menyuntikkan peluang baru secara berkala!
                  </div>
                ) : (
                  rouletteLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-amber-400/60 transition shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">{lead.clientName}</div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span>{lead.city}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          {lead.packageInterest}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                        <span className="font-mono text-slate-600 font-semibold" dir="ltr">
                          {lead.whatsappNumber}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleClaimHotLead(lead.id)}
                          disabled={claimingId === lead.id}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                          <span>{claimingId === lead.id ? "Mengamankan..." : "Ambil Jamaah (Claim)"}</span>
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DAFTAR JAMAAH & CRM (JAMAAH SAYA)
      ========================================================================== */}
      {activeTab === "crm" && (
        <div className="space-y-6">
          {/* Top CRM Action Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Daftar Jamaah & Mini-CRM
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola prospek jamaah, kirimkan penawaran WA Pintar, dan pantau status DP 5 Juta.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddForm ? "Tutup Form" : "Tambah Prospek Baru"}</span>
              </button>
            </div>

            {/* Quick Add Form Drawer */}
            <AnimatePresence>
              {showAddForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddProspect}
                  className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3"
                >
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Nama Jamaah
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Contoh: Pak Bambang"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="08123456789"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Pilihan Paket
                    </label>
                    <select
                      value={newPackage}
                      onChange={(e) => setNewPackage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                    >
                      <option value="NOVEMBER_2026_30.9JT">November 2026 (30.9 JT)</option>
                      <option value="DESEMBER_2026_31.5JT">Desember 2026 (31.5 JT - Sheikh Bugis)</option>
                      <option value="VIP_ROOM_DOUBLE">VIP Double Room (34.9 JT)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isAddingLead}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {isAddingLead ? "Menyimpan..." : "Simpan ke CRM 🚀"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama atau no WA..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-600"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-[11px] font-bold">
                {["ALL", "NEW", "CONTACTED", "INTERESTED", "DP_PAID"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
                      statusFilter === st
                        ? "bg-slate-900 text-white font-extrabold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st === "ALL"
                      ? "Semua"
                      : st === "NEW"
                      ? "Baru"
                      : st === "CONTACTED"
                      ? "Dihubungi"
                      : st === "INTERESTED"
                      ? "Tertarik"
                      : "DP 5 Jt Paid"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leads Cards Grid / Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {leadsLoading ? (
              <div className="py-16 text-center text-slate-400 text-xs">Memuat daftar jamaah...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                <div>Belum ada jamaah pada kategori ini.</div>
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="text-emerald-700 font-bold underline"
                >
                  Tambah prospek sekarang
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{lead.clientName}</span>
                        {/* Status Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(lead.id, lead.status)}
                          title="Klik untuk mengubah status"
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full transition cursor-pointer active:scale-95 ${
                            lead.status === "DP_PAID"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : lead.status === "INTERESTED"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : lead.status === "CONTACTED"
                              ? "bg-blue-100 text-blue-800 border border-blue-300"
                              : "bg-slate-100 text-slate-700 border border-slate-300"
                          }`}
                        >
                          {lead.status === "DP_PAID"
                            ? "✅ DP 5 Juta Masuk"
                            : lead.status === "INTERESTED"
                            ? "🔥 Sangat Berminat"
                            : lead.status === "CONTACTED"
                            ? "💬 Sudah Dihubungi"
                            : "🆕 Belum Dihubungi"}
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="font-mono font-semibold" dir="ltr">
                          {lead.whatsappNumber}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{lead.packageInterest}</span>
                        {lead.monthlyPlan && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-mono font-bold">
                              Tabungan: Rp {lead.monthlyPlan.toLocaleString("id-ID")}/bln
                            </span>
                          </>
                        )}
                      </div>

                      {lead.notes && (
                        <div className="text-[11px] text-slate-400 italic">{lead.notes}</div>
                      )}
                    </div>

                    {/* Kirim WA Pintar Button */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleKirimWaPintar(lead)}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-slate-950 font-black text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 fill-slate-950" />
                        <span>Kirim WA Pintar 📲</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ASISTEN PINTAR (BANTU JAWAB / OBJECTION HANDLER)
      ========================================================================== */}
      {activeTab === "asisten" && (
        <ObjectionAssistant
          marketerName={user.username}
          marketerPhone={user.whatsapp}
          personalLandingUrl={personalPageUrl}
        />
      )}

      {/* =========================================================================
          TAB 4: KIT PROMOSI & MEDIA
      ========================================================================== */}
      {activeTab === "media" && (
        <div className="space-y-6">
          {/* Quick Assets Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-emerald-800/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-start">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-3 py-1 rounded-full">
                MARKETPLACE DESAIN & BROSUR VEKTOR
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Brosur & Poster Promosi dengan Kode Anda
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Download poster resmi beresolusi tinggi yang otomatis tertanam Nama, Nomor WhatsApp, dan QR Code pendaftaran jamaah Anda.
              </p>
            </div>

            <div className="shrink-0">
              <PosterMarketplaceModal />
            </div>
          </div>

          {/* QR Code Card */}
          {qrCodeDataUrl && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeDataUrl} alt="QR Code Pendaftaran" className="w-36 h-36 rounded-xl" />
              </div>
              <div className="space-y-2 text-start">
                <h4 className="font-extrabold text-base text-slate-900">QR Code Halaman Kemitraan</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                  Cetak dan pasang QR Code ini di brosur, banner masjid, atau bagikan di media sosial. Setiap scan akan mengunci jamaah di bawah akun Anda.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <a
                    href={qrCodeDataUrl}
                    download={`QR-UBK-${user.referralCode}.png`}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                  >
                    ⬇️ Download QR (PNG)
                  </a>
                  <a
                    href={personalPageUrl}
                    target="_blank"
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    🌐 Kunjungi Laman
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION BAR (FIXED APP-LIKE NAVIGATION)
      ========================================================================== */}
      <nav
        aria-label="PWA Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-slate-950/95 backdrop-blur-xl border-t border-amber-500/20 px-2 py-2 shadow-2xl safe-bottom"
      >
        <div className="flex items-center justify-around">
          {(
            [
              { id: "misi" as const, icon: Target, label: "Misi & Radar", alert: isUnlocked, badge: 0 },
              { id: "crm" as const, icon: Users, label: "Jamaah Saya", alert: false, badge: leads.length },
              { id: "asisten" as const, icon: Bot, label: "Bantu Jawab", alert: false, badge: 0 },
              { id: "media" as const, icon: ImageIcon, label: "Kit Media", alert: false, badge: 0 },
            ]
          ).map((item) => {
            const active = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex-1 py-1.5 flex flex-col items-center justify-center gap-1 transition relative cursor-pointer active:scale-95 ${
                  active ? "text-amber-400 font-black" : "text-slate-400 hover:text-slate-200 font-semibold"
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                  {item.alert && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5 animate-ping" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="activeBottomIndicator"
                    className="w-5 h-0.5 rounded-full bg-amber-400 absolute bottom-0"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
