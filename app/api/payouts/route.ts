import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";



import { payoutRequestSchema } from "@/lib/validations";

const MIN_PAYOUT_IDR = 500000; // Rp 500.000

/**
 * API route for Marketers to submit payout requests in Indonesian Rupiah (IDR).
 * Body: { amountToWithdraw, bankInfo }
 * Condition: Minimum Rp 500.000 and multiples of Rp 500.000
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Tidak diizinkan / غير مصرح" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const rawBody = await request.json();
    
    // Normalize amountToWithdraw to number
    const normalizedBody = {
      ...rawBody,
      amountToWithdraw: Number(rawBody.amountToWithdraw),
    };

    const parseResult = payoutRequestSchema.safeParse(normalizedBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Data penarikan dana tidak valid";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { amountToWithdraw: amountNum, bankInfo } = parseResult.data;

    // Check marketer's total available balance
    const user = await prisma.user.findUnique({
      where: { id: marketerId },
      include: {
        rewards: true,
        payoutRequests: true,
        purchasedPosters: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Akun mitra tidak ditemukan" }, { status: 404 });
    }

    // Calculate total earned in Rupiah
    const totalEarnedIDR = user.rewards.reduce((sum, r) => sum + (r.amount || r.points * 1000), 0);
    const totalRedeemedIDR = user.payoutRequests
      .filter((p) => p.status !== "REJECTED")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalPosterPurchasesIDR = user.purchasedPosters
      .filter((p) => p.paymentMethod === "COMMISSION_BALANCE" && p.paymentStatus === "APPROVED")
      .reduce((sum, p) => sum + p.pricePaid, 0);

    const availableIDR = Math.max(0, totalEarnedIDR - totalRedeemedIDR - totalPosterPurchasesIDR);

    if (availableIDR < MIN_PAYOUT_IDR) {
      return NextResponse.json(
        {
          error: `Saldo aktif Anda saat ini (Rp ${availableIDR.toLocaleString(
            "id-ID"
          )}) belum mencukupi batas minimal penarikan (Rp 500.000).`,
        },
        { status: 400 }
      );
    }

    if (amountNum > availableIDR) {
      return NextResponse.json(
        {
          error: `Saldo aktif yang dapat ditarik hanya sebesar Rp ${availableIDR.toLocaleString(
            "id-ID"
          )}.`,
        },
        { status: 400 }
      );
    }

    // Create payout request
    const payoutRequest = await prisma.payoutRequest.create({
      data: {
        marketerId,
        amount: amountNum,
        bankInfo: bankInfo.trim(),
        status: "PENDING",
      },
    });

    return NextResponse.json(
      { success: true, payoutRequest },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Payout request error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengajukan penarikan dana" },
      { status: 500 }
    );
  }
}
