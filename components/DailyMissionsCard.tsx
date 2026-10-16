"use client";

import React, { useState } from "react";
import { Award, CheckCircle2, ChevronRight, Flame, MessageCircle, Radar, Sparkles, Target, Zap } from "lucide-react";

interface DailyMissionsCardProps {
  mission: {
    contactsAddedCount: number;
    whatsappSentCount: number;
    isRadarUnlocked: boolean;
    pointsEarned: number;
    targetWhatsapp: number;
    progressPercentage: number;
  } | null;
  totalPoints: number;
  onOpenRadar: () => void;
  onOpenCalculator: () => void;
  onMissionUpdated?: () => void;
}

export function DailyMissionsCard({
  mission,
  totalPoints,
  onOpenRadar,
  onOpenCalculator,
  onMissionUpdated,
}: DailyMissionsCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const contactsSent = mission?.whatsappSentCount || 0;
  const target = mission?.targetWhatsapp || 3;
  const isUnlocked = mission?.isRadarUnlocked || false;
  const percentage = mission?.progressPercentage || Math.min(100, Math.round((contactsSent / target) * 100));

  // Quick Action to register an interaction toward the daily mission
  const handleQuickContactLog = async () => {
    setIsUpdating(true);
    setNotification(null);

    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SEND_WHATSAPP",
          increment: 1,
        }),
      });

      const data = await res.json();
      setIsUpdating(false);

      if (res.ok) {
        if (data.newlyUnlockedRadar) {
          setNotification("🎉 LUAR BIASA! Target harian tercapai. Radar Peluang Panas TERBUKA!");
        } else {
          setNotification(`✅ Aktivitas dicatat! (+${data.pointsEarnedNow} poin)`);
        }
        if (onMissionUpdated) onMissionUpdated();
        setTimeout(() => setNotification(null), 3500);
      } else {
        setNotification(data.error || "Gagal memperbarui misi");
      }
    } catch (err) {
      setIsUpdating(false);
      setNotification("Gagal terhubung ke server");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
      {/* Decorative background glow */}
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
        isUnlocked ? "bg-amber-400/15" : "bg-emerald-500/10"
      }`} />

      {notification && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header with Title & Points */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">Misi Harian Mitra</h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Gamified Daily Target
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Hubungi 3 calon jamaah per hari untuk membuka <strong className="text-amber-600">Radar Peluang Panas</strong>
            </p>
          </div>
        </div>

        {/* Gamified Points Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-300/40 px-3.5 py-2 rounded-2xl">
          <Award className="w-5 h-5 text-amber-600" />
          <div>
            <span className="text-[10px] font-bold text-amber-800 block uppercase tracking-wider">Total Skor</span>
            <span className="text-sm font-extrabold font-mono text-amber-700">
              {totalPoints.toLocaleString("id-ID")} Poin
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Counter */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-5">
        <div className="flex items-center justify-between text-xs mb-2 font-bold">
          <span className="text-slate-700 flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Target Interaksi WhatsApp Hari Ini:</span>
          </span>
          <span className="font-mono text-slate-900">
            <strong className="text-emerald-700 text-sm">{contactsSent}</strong> / {target} Jamaah
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              isUnlocked
                ? "bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500"
                : "bg-gradient-to-r from-emerald-500 to-teal-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-medium">
          <span>Progres: {percentage}%</span>
          {isUnlocked ? (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Target Harian Tercapai!
            </span>
          ) : (
            <span className="text-amber-700 font-semibold">
              Butuh {Math.max(0, target - contactsSent)} interaksi lagi untuk buka radar
            </span>
          )}
        </div>
      </div>

      {/* Radar Status Showcase Card */}
      <div className={`p-4 rounded-2xl border transition-all mb-4 ${
        isUnlocked
          ? "bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border-amber-400/40 shadow-lg"
          : "bg-slate-50 text-slate-700 border-slate-200"
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              isUnlocked
                ? "bg-amber-400/20 text-amber-400 border border-amber-400/30 animate-pulse"
                : "bg-slate-200 text-slate-500"
            }`}>
              <Radar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold ${isUnlocked ? "text-amber-300" : "text-slate-800"}`}>
                  {isUnlocked ? "🟢 RADAR PELUANG PANAS TERBUKA!" : "🔒 Radar Peluang Panas Terkunci"}
                </span>
                {isUnlocked && (
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-md uppercase">
                    Aktif
                  </span>
                )}
              </div>
              <p className={`text-[11px] ${isUnlocked ? "text-slate-300" : "text-slate-500"}`}>
                {isUnlocked
                  ? "Peluang jamaah baru dari Jabodetabek siap Anda klaim secara gratis."
                  : "Selesaikan 3 chat prospek hari ini untuk membuka kontak jamaah baru gratis."}
              </p>
            </div>
          </div>

          {isUnlocked ? (
            <button
              onClick={onOpenRadar}
              className="py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
            >
              <Radar className="w-4 h-4 text-slate-950" />
              <span>Buka Radar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              disabled
              className="py-2 px-3 bg-slate-200 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed shrink-0"
            >
              Terkunci
            </button>
          )}
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
        <button
          onClick={handleQuickContactLog}
          disabled={isUpdating}
          className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>{isUpdating ? "Mencatat..." : "+ Catat 1 Chat WhatsApp"}</span>
        </button>

        <button
          onClick={onOpenCalculator}
          className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
        >
          <Flame className="w-4 h-4 text-amber-600" />
          <span>Buka Kalkulator Tabungan</span>
        </button>
      </div>
    </div>
  );
}
