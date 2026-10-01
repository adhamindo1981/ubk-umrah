import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@/lib/auth";
import { generateShortReferralCode } from "@/lib/referral";

const prisma = new PrismaClient();

/**
 * API route to register a new Marketer / User.
 * Accepts: { username, email, password, whatsapp?, parentReferralCode?, role? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, whatsapp, parentReferralCode, role } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, dan password wajib diisi / جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username atau email sudah terdaftar / اسم المستخدم أو البريد مسجل بالفعل" },
        { status: 400 }
      );
    }

    // Check if parent referral code exists (for building the Tree Downline)
    let parentId: number | null = null;
    if (parentReferralCode && parentReferralCode.trim() !== "") {
      const parentUser = await prisma.user.findUnique({
        where: { referralCode: parentReferralCode.trim() },
      });
      if (parentUser) {
        parentId = parentUser.id;
      }
    }

    // Generate unique short referral code (e.g. UBK-8K3P)
    let referralCode = generateShortReferralCode();
    let codeExists = await prisma.user.findUnique({ where: { referralCode } });
    while (codeExists) {
      referralCode = generateShortReferralCode();
      codeExists = await prisma.user.findUnique({ where: { referralCode } });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create new user with short referralCode and optional parent link in Tree
    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: hashedPassword,
        whatsapp: whatsapp ? whatsapp.trim() : null,
        parentId: parentId,
        role: role === "ADMIN" ? "ADMIN" : "MARKETER",
        referralCode: referralCode,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          whatsapp: user.whatsapp,
          parentId: user.parentId,
          role: user.role,
          referralCode: user.referralCode,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("User registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mendaftar / حدث خطأ أثناء التسجيل" },
      { status: 500 }
    );
  }
}
