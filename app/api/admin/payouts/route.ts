import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

/**
 * PATCH endpoint for Admin to approve or reject a Payout Request.
 * Body: { payoutId, status } // "APPROVED" | "REJECTED"
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { payoutId, status, receiptImageUrl, notes } = body;

    if (!payoutId || !status) {
      return NextResponse.json(
        { error: "رقم طلب السحب والحالة مطلوبان" },
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
