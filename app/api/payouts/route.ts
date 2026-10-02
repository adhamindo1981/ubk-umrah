import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";



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
    const body = await request.json();
    const { amountToWithdraw, bankInfo } = body;

    const amountNum = Number(amountToWithdraw);

    if (!amountNum || isNaN(amountNum) || !bankInfo || bankInfo.trim() === "") {
      return NextResponse.json(
        { error: "Mohon tentukan nominal penarikan dan rekening bank / E-Wallet tujuan." },
        { status: 400 }
      );
    }

    // Enforce minimum Rp 500.000 and multiples of Rp 500.000
    if (amountNum < MIN_PAYOUT_IDR || amountNum % MIN_PAYOUT_IDR !== 0) {
      return NextResponse.json(
        {
          error:
            "Penarikan dana minimal Rp 500.000 dan harus dalam kelipatan Rp 500.000 (contoh: Rp 500.000, Rp 1.000.000, Rp 1.500.000, dst).",
        },
        { status: 400 }
      );
    }

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
