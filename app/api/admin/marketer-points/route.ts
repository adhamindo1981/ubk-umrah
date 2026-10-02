import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

/**
 * PATCH endpoint for Admin to manually adjust marketer balance in IDR
 * Supports both:
 * - Direct IDR balance adjustment: { marketerId, amountChange, description }
 * - Legacy points: { marketerId, pointsToAdd }
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "غير مصرح / Tidak diizinkan" }, { status: 401 });
    }

    const body = await request.json();
    const { marketerId, amountChange, description, pointsToAdd } = body;

    if (!marketerId) {
      return NextResponse.json(
        { error: "معرف المسوق مطلوب / ID Mitra wajib diisi" },
        { status: 400 }
      );
    }

    let finalAmount = 0;
    if (typeof amountChange === "number") {
      finalAmount = Number(amountChange);
    } else if (typeof pointsToAdd === "number") {
      finalAmount = Number(pointsToAdd) * 1000;
    }

    if (finalAmount === 0 || isNaN(finalAmount)) {
      return NextResponse.json(
        { error: "المبلغ يجب ألا يكون صفراً / Nominal penyesuaian tidak boleh nol" },
        { status: 400 }
      );
    }

    const defaultDesc =
      finalAmount > 0
        ? `تسوية رصيد يدوية (إيداع +Rp ${Math.abs(finalAmount).toLocaleString("id-ID")})`
        : `تسوية رصيد يدوية (خصم -Rp ${Math.abs(finalAmount).toLocaleString("id-ID")})`;

    // Create a new Reward record with the balance adjustment in IDR
    const reward = await prisma.reward.create({
      data: {
        marketerId: Number(marketerId),
        amount: finalAmount,
        points: Math.round(finalAmount / 1000),
        description: description?.trim() || defaultDesc,
      },
    });

    return NextResponse.json({ success: true, reward });
  } catch (error: any) {
    console.error("Balance adjustment error:", error);
    return NextResponse.json(
      { error: "تعذر تعديل الرصيد / Gagal mengubah saldo" },
      { status: 500 }
    );
  }
}
