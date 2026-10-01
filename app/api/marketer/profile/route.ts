import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { hashPassword } from "@/lib/auth";

const prisma = new PrismaClient();

/**
 * PATCH endpoint to update marketer profile details:
 * whatsapp, bankName, bankAccountNumber, bankAccountName, idNumber, subMarketerShare, newPassword
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Tidak diizinkan / غير مصرح" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const body = await request.json();
    const {
      whatsapp,
      bankName,
      bankAccountNumber,
      bankAccountName,
      idNumber,
      subMarketerShare,
      newPassword,
    } = body;

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

    if (newPassword && newPassword.trim() !== "") {
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
