"use client";

import { useState } from "react";

export interface MarketerProfileData {
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
  subMarketerShare: number;
  subMarketersCount: number;
  createdAt: string;
  totalEarnedIDR: number;
  totalRedeemedIDR: number;
  availableIDR: number;
  ordersCount: number;
  orders: Array<{
    id: number;
    clientName: string;
    clientEmail: string;
    status: string;
    createdAt: string;
  }>;
  payoutRequests: Array<{
    id: number;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  subMarketers: Array<{
    id: number;
    username: string;
    referralCode: string | null;
    ordersCount: number;
  }>;
}

export function AdminMarketerProfileModal({
  marketer,
}: {
  marketer: MarketerProfileData;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition inline-flex items-center gap-1 shadow-sm"
      >
        👁️ Lihat Profil / عرض الملف
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-left" dir="ltr">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                  {marketer.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Profil Mitra: {marketer.username}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Kode Referral: <strong>{marketer.referralCode}</strong>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold block mb-1">
                    Status Akun & Jaringan
                  </span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      marketer.isApproved
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {marketer.isApproved ? "Aktif / Disetujui ✅" : "Menunggu Persetujuan ⏳"}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {marketer.parentMarketerName
                      ? `Sponsor / Induk: ${marketer.parentMarketerName}`
                      : "Mitra Mandiri (Direct UBK)"}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold block mb-1">
                    Saldo Aktif Komisi
                  </span>
                  <div className="text-lg font-black text-emerald-700 font-mono">
                    Rp {marketer.availableIDR.toLocaleString("id-ID")}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Total: Rp {marketer.totalEarnedIDR.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold block mb-1">
                    Total Jamaah & Tim
                  </span>
                  <div className="text-lg font-extrabold text-slate-900">
                    {marketer.ordersCount} <span className="text-xs font-normal text-slate-500">Jamaah</span>
                  </div>
                  <div className="text-[11px] text-blue-700 font-semibold">
                    {marketer.subMarketersCount} Mitra Binaan (Tree)
                  </div>
                </div>
              </div>

              {/* Personal & Indonesian Banking Details */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Informasi Kontak & Rekening Bank (Indonesia)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Email:</span>
                    <span className="font-semibold text-slate-800 font-mono">{marketer.email}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">WhatsApp:</span>
                    <span className="font-semibold text-emerald-800 font-mono">
                      {marketer.whatsapp || "Belum diisi"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Nomor KTP / NIK:</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {marketer.idNumber || "Belum diisi"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Nama Bank / E-Wallet:</span>
                    <span className="font-semibold text-slate-800 font-bold">
                      {marketer.bankName || "Belum ditentukan"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Nomor Rekening / No E-Wallet:</span>
                    <span className="font-mono font-bold text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-200 block">
                      {marketer.bankAccountNumber || "Belum ada"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Nama Pemilik Rekening:</span>
                    <span className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200 block">
                      {marketer.bankAccountName || "Belum ada"}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block mb-0.5">Bagi Hasil untuk Sub-Marketer Binaan:</span>
                    <span className="text-xs text-emerald-800 font-bold">
                      Rp {marketer.subMarketerShare.toLocaleString("id-ID")} per jamaah (Sisa untuk sponsor: Rp {(500000 - marketer.subMarketerShare).toLocaleString("id-ID")})
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-marketers under this user */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Daftar Mitra Tim Binaan ({marketer.subMarketers.length})
                </h4>

                {marketer.subMarketers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">
                    Mitra ini belum memiliki sub-marketer binaan di bawah jaringannya.
                  </p>
                ) : (
                  <div className="overflow-x-auto max-h-40">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                        <tr>
                          <th className="py-2 px-3">Nama Mitra</th>
                          <th className="py-2 px-3">Kode Referral</th>
                          <th className="py-2 px-3">Total Jamaah</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {marketer.subMarketers.map((s) => (
                          <tr key={s.id}>
                            <td className="py-2 px-3 font-semibold text-slate-900">{s.username}</td>
                            <td className="py-2 px-3 font-mono text-emerald-700">{s.referralCode}</td>
                            <td className="py-2 px-3 font-bold">{s.ordersCount} Jamaah</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Orders of this Marketer */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Daftar Booking Jamaah ({marketer.orders.length})
                </h4>

                {marketer.orders.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2">
                    Belum ada jamaah yang terdaftar melalui kode mitra ini.
                  </p>
                ) : (
                  <div className="overflow-x-auto max-h-44">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                        <tr>
                          <th className="py-2 px-3">ID</th>
                          <th className="py-2 px-3">Nama Jamaah</th>
                          <th className="py-2 px-3">Email</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {marketer.orders.map((o) => (
                          <tr key={o.id}>
                            <td className="py-2 px-3 font-mono">#{o.id}</td>
                            <td className="py-2 px-3 font-semibold">{o.clientName}</td>
                            <td className="py-2 px-3 text-slate-500">{o.clientEmail}</td>
                            <td className="py-2 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  o.status === "COMPLETED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : o.status === "IN_PROGRESS"
                                    ? "bg-blue-100 text-blue-800"
                                    : o.status === "CANCELED"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {o.status === "COMPLETED"
                                  ? "Dikonfirmasi ✅"
                                  : o.status === "IN_PROGRESS"
                                  ? "Dalam Proses"
                                  : o.status === "CANCELED"
                                  ? "Dibatalkan"
                                  : "Menunggu"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition"
              >
                Tutup / إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
