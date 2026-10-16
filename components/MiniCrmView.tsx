"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Filter,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { normalizeIndonesianPhone } from "@/lib/validations";

export interface Lead {
  id: string;
  clientName: string;
  whatsappNumber: string;
  source: "MANUAL_MISSION" | "TABUNGAN_CALCULATOR" | "RADAR_ROULETTE" | "LANDING_PAGE";
  status: "NEW" | "CONTACTED" | "INTERESTED" | "DP_PAID" | "CLOSED_WON";
  packageInterest: string;
  dpAmount: number;
  monthlyPlan?: number | null;
  notes?: string | null;
  lastContactedAt?: string | null;
  createdAt: string;
}

interface MiniCrmViewProps {
  onOpenCalculator: () => void;
  onLeadUpdated?: () => void;
}

export function MiniCrmView({ onOpenCalculator, onLeadUpdated }: MiniCrmViewProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State for Manual Lead
  const [newClientName, setNewClientName] = useState("");
  const [newWhatsapp, setNewWhatsapp] = useState("");
  const [newPackage, setNewPackage] = useState("Paket Umrah Taysir 9 Hari (Quad) - Rp 29.900.000");
  const [newNotes, setNewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const url = statusFilter === "ALL" ? "/api/leads" : `/api/leads?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setLeads(data.leads || []);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Lead["status"]) => {
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        );
        setNotification(`Status diperbarui menjadi: ${newStatus}`);
        setTimeout(() => setNotification(null), 2500);
        if (onLeadUpdated) onLeadUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus prospek ini?")) return;

    try {
      const res = await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        if (onLeadUpdated) onLeadUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newWhatsapp.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: newClientName.trim(),
          whatsappNumber: newWhatsapp.trim(),
          packageInterest: newPackage,
          notes: newNotes.trim() || undefined,
          source: "MANUAL_MISSION",
          status: "NEW",
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok) {
        setNotification("✅ Prospek baru berhasil ditambahkan!");
        setNewClientName("");
        setNewWhatsapp("");
        setNewNotes("");
        setIsAddingLead(false);
        fetchLeads();
        if (onLeadUpdated) onLeadUpdated();
        setTimeout(() => setNotification(null), 3000);
      } else {
        alert(data.error || "Gagal menambahkan prospek.");
      }
    } catch (err) {
      setSubmitting(false);
    }
  };

  // Filter by search query
  const filteredLeads = leads.filter(
    (l) =>
      l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.whatsappNumber.includes(searchQuery) ||
      l.packageInterest.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalLeadsCount = leads.length;
  const dpPaidCount = leads.filter((l) => l.status === "DP_PAID" || l.status === "CLOSED_WON").length;
  const totalDpNominal = dpPaidCount * 5000000;

  const getStatusBadge = (status: Lead["status"]) => {
    switch (status) {
      case "NEW":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CONTACTED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "INTERESTED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "DP_PAID":
        return "bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold";
      case "CLOSED_WON":
        return "bg-teal-600 text-white border-teal-600 font-extrabold shadow-sm";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getSourceBadge = (source: Lead["source"]) => {
    switch (source) {
      case "TABUNGAN_CALCULATOR":
        return "💰 Kalkulator Tabungan";
      case "RADAR_ROULETTE":
        return "🎯 Radar Peluang";
      case "MANUAL_MISSION":
        return "✍️ Misi Manual";
      case "LANDING_PAGE":
        return "🌐 Halaman Web";
      default:
        return source;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Prospek (CRM)</span>
            <span className="text-2xl font-black text-slate-900 font-mono">{totalLeadsCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">DP 5 Juta Terbayar</span>
            <span className="text-2xl font-black text-emerald-700 font-mono">{dpPaidCount} Jamaah</span>
            <span className="text-[10px] text-slate-400 block font-mono">Total: Rp {totalDpNominal.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Konversi Menuju Closing</span>
            <span className="text-2xl font-black text-slate-900 font-mono">
              {totalLeadsCount > 0 ? Math.round((dpPaidCount / totalLeadsCount) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Control Bar: Filters & Actions */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "Semua" },
            { id: "NEW", label: "Baru" },
            { id: "CONTACTED", label: "Dihubungi" },
            { id: "INTERESTED", label: "Berminat" },
            { id: "DP_PAID", label: "DP 5 Jt" },
            { id: "CLOSED_WON", label: "Closing ✅" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama/WA..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={() => setIsAddingLead(true)}
            className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Prospek</span>
          </button>
        </div>
      </div>

      {/* Manual Lead Form Modal */}
      {isAddingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <span>Tambah Calon Jamaah Manual (Mini-CRM)</span>
            </h3>

            <form onSubmit={handleCreateManualLead} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Calon Jamaah *</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Contoh: H. Suparman"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={newWhatsapp}
                  onChange={(e) => setNewWhatsapp(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Minat Paket / Program</label>
                <input
                  type="text"
                  value={newPackage}
                  onChange={(e) => setNewPackage(e.target.value)}
                  placeholder="Nama paket yang diminati..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Interaksi (Opsional)</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Catatan hasil obrolan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition"
                >
                  {submitting ? "Menyimpan..." : "Simpan Prospek"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingLead(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leads List Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Memuat data prospek jamaah...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-xl">
              📭
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Belum ada data calon jamaah pada kategori ini. Gunakan <strong>Kalkulator Tabungan</strong> atau klaim dari <strong>Radar Peluang</strong> untuk menambah prospek.
            </p>
            <button
              onClick={onOpenCalculator}
              className="py-2 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-xl transition"
            >
              Buka Kalkulator Tabungan
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{lead.clientName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(lead.status)}`}>
                      {lead.status === "DP_PAID" ? "DP 5 Juta Terbayar ✨" : lead.status}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {getSourceBadge(lead.source)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="font-mono text-emerald-700 font-bold">{lead.whatsappNumber}</span>
                    <span>•</span>
                    <span className="text-slate-500">{lead.packageInterest}</span>
                    {lead.monthlyPlan && (
                      <>
                        <span>•</span>
                        <span className="text-amber-700 font-bold font-mono">
                          Rp {lead.monthlyPlan.toLocaleString("id-ID")}/bln
                        </span>
                      </>
                    )}
                  </div>

                  {lead.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                      "{lead.notes}"
                    </p>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Status Dropdown */}
                  <select
                    value={lead.status}
                    onChange={(e) => handleUpdateStatus(lead.id, e.target.value as any)}
                    className="py-1.5 px-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="NEW">Baru</option>
                    <option value="CONTACTED">Dihubungi</option>
                    <option value="INTERESTED">Berminat</option>
                    <option value="DP_PAID">DP 5 Jt Terbayar</option>
                    <option value="CLOSED_WON">Closing Berangkat</option>
                  </select>

                  {/* Direct WhatsApp Chat Action */}
                  <a
                    href={`https://wa.me/${normalizeIndonesianPhone(lead.whatsappNumber)}?text=${encodeURIComponent(
                      `Assalamu'alaikum Warahmatullahi Wabarakatuh Bapak/Ibu ${lead.clientName},\n\nSemoga berkah dan sehat selalu. Saya konsultan resmi PT. Umar Bin Alkhattab for Umrah (UBK). Terkait rencana ibadah Umrah Anda untuk program *${lead.packageInterest || "2026"}*, izin kami infokan bahwa kami menyediakan paket dengan penerbangan Qatar Airways, Hotel dekat Masjid tanpa shuttle bus, kemudahan DP 5 Juta, dan bonus Free Albaik. Apakah ada hal yang ingin dibantu jelaskan? Terima kasih. 🙏`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleUpdateStatus(lead.id, "CONTACTED")}
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat WA</span>
                  </a>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteLead(lead.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                    title="Hapus Prospek"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
