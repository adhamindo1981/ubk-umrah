import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { hashPassword } from "@/lib/auth";
import { generateShortReferralCode } from "@/lib/referral";

const prisma = new PrismaClient();

/**
 * POST /api/auth/first-time-setup
 * Mandatory first-time password change for new marketers.
 * Upon saving the new password, generates the unique referralCode (UBK-XXXXX) for the first time!
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Tidak diizinkan / غير مصرح" }, { status: 401 });
    }

    const userId = Number((session.user as any).id);
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.trim().length < 6) {
      return NextResponse.json(
        { error: "Kata sandi baru minimal 6 karakter / كلمة المرور يجب ألا تقل عن 6 أحرف" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });
    }

    // Generate unique short referral code (e.g. UBK-8K3P)
    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = generateShortReferralCode();
      let exists = await prisma.user.findUnique({ where: { referralCode } });
      while (exists) {
        referralCode = generateShortReferralCode();
        exists = await prisma.user.findUnique({ where: { referralCode } });
      }
    }

    const passwordHash = await hashPassword(newPassword.trim());

    // Update user: activate account, set permanent password, clear mustChangePassword flag
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false,
        referralCode,
      },
    });

    return NextResponse.json({
      success: true,
      referralCode: updatedUser.referralCode,
    });
  } catch (error: any) {
    console.error("First time setup error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui kata sandi dan aktivasi akun" },
      { status: 500 }
    );
  }
}
