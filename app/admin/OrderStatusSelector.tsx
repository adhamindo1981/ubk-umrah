"use client";

import { useState } from "react";

interface OrderStatusSelectorProps {
  orderId: number;
  initialStatus: string;
}

export function OrderStatusSelector({
  orderId,
  initialStatus,
}: OrderStatusSelectorProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
      } else {
        alert("فشل تحديث الحالة");
      }
    } catch (err) {
      alert("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={status}
      disabled={loading}
      onChange={(e) => handleStatusChange(e.target.value)}
      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition ${
        status === "COMPLETED"
          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
          : status === "IN_PROGRESS"
          ? "bg-blue-50 text-blue-800 border-blue-300"
          : status === "CANCELED"
          ? "bg-rose-50 text-rose-800 border-rose-300"
          : "bg-amber-50 text-amber-800 border-amber-300"
      }`}
    >
      <option value="PENDING">قيد الانتظار (PENDING)</option>
      <option value="IN_PROGRESS">قيد التنفيذ (IN_PROGRESS)</option>
      <option value="COMPLETED">مكتمل (COMPLETED)</option>
      <option value="CANCELED">ملغي (CANCELED)</option>
    </select>
  );
}
