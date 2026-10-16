import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { hashPassword, comparePassword } from "@/lib/auth";

/**
 * PATCH endpoint to update marketer profile details:
 * whatsapp, bankName, bankAccountNumber, bankAccountName, idNumber, subMarketerShare, currentPassword, newPassword
 * SECURITY HARDENING:
 * - Changing password strictly requires verification of currentPassword.
 * - Minimum password length of 6 characters enforced.
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Tidak diizinkan / غير مصرح" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const rawBody = await request.json();

    const { profileUpdateSchema } = await import("@/lib/validations");
    const parseResult = profileUpdateSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Data profil tidak valid";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const {
      whatsapp,
      bankName,
      bankAccountNumber,
      bankAccountName,
      idNumber,
      subMarketerShare,
      currentPassword,
      newPassword,
    } = parseResult.data;

    const currentUser = await prisma.user.findUnique({
      where: { id: marketerId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    const updateData: any = {};
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp.trim();
    if (bankName !== undefined) updateData.bankName = bankName.trim();
    if (bankAccountNumber !== undefined) updateData.bankAccountNumber = bankAccountNumber.trim();
    if (bankAccountName !== undefined) updateData.bankAccountName = bankAccountName.trim();
    if (idNumber !== undefined) updateData.idNumber = idNumber.trim();

    if (subMarketerShare !== undefined && !isNaN(Number(subMarketerShare))) {
      const share = Number(subMarketerShare);
      if (share >= 100000 && share <= 500000) {
        updateData.subMarketerShare = share;
      }
    }

    // Secure Password Change flow
    if (newPassword && newPassword.trim() !== "") {
      if (newPassword.trim().length < 6) {
        return NextResponse.json(
          { error: "Kata sandi baru minimal 6 karakter / كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف" },
          { status: 400 }
        );
      }

      if (!currentPassword) {
        return NextResponse.json(
          { error: "Kata sandi saat ini wajib diisi untuk mengubah kata sandi / يجب إدخال كلمة المرور الحالية" },
          { status: 400 }
        );
      }

      const isCurrentValid = await comparePassword(currentPassword, currentUser.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: "Kata sandi saat ini salah / كلمة المرور الحالية غير صحيحة" },
          { status: 400 }
        );
      }

      updateData.passwordHash = await hashPassword(newPassword.trim());
    }

    const updatedUser = await prisma.user.update({
      where: { id: marketerId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        whatsapp: updatedUser.whatsapp,
        bankName: updatedUser.bankName,
        bankAccountNumber: updatedUser.bankAccountNumber,
        bankAccountName: updatedUser.bankAccountName,
        idNumber: updatedUser.idNumber,
        subMarketerShare: updatedUser.subMarketerShare,
      },
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui profil / حدث خطأ أثناء تحديث الملف الشخصي" },
      { status: 500 }
    );
  }
}
