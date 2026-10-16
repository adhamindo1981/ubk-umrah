import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";



/**
 * PATCH endpoint for Admin to approve or reject a Payout Request.
 * Body: { payoutId, status } // "APPROVED" | "REJECTED"
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك كمسؤول / Tidak diizinkan" }, { status: 403 });
    }

    const body = await request.json();
    const { payoutId, status, receiptImageUrl, notes } = body;

    const ALLOWED_STATUSES = ["APPROVED", "REJECTED", "PENDING"];
    if (!payoutId || !status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "رقم طلب السحب وحالة صالحة مطلوبان (APPROVED, REJECTED, PENDING)" },
        { status: 400 }
      );
    }

    const updatedPayout = await prisma.payoutRequest.update({
      where: { id: Number(payoutId) },
      data: {
        status,
        ...(receiptImageUrl !== undefined ? { receiptImageUrl } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return NextResponse.json({ success: true, payout: updatedPayout });
  } catch (error: any) {
    console.error("Payout approval error:", error);
    return NextResponse.json(
      { error: "تعذر تحديث حالة طلب السحب" },
      { status: 500 }
    );
  }
}
