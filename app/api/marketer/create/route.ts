import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { hashPassword } from "@/lib/auth";
import { generateShortReferralCode } from "@/lib/referral";

const prisma = new PrismaClient();

/**
 * Generate a random temporary password like "UBK-7842"
 */
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `UBK-${random}`;
}

/**
 * POST /api/marketer/create
 * Creates a new Sub-marketer (by Master Marketer) or a new Marketer (by Admin).
 * Generates:
 * 1. A temporary password and flags mustChangePassword: true.
 * 2. An official referralCode (UBK-XXXXX) and personal page link right away!
 * The creator (Admin or Sponsor) can immediately share the credentials and personal page link.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "غير مصرح / Tidak diizinkan" }, { status: 401 });
    }

    const callerId = Number((session.user as any).id);
    const callerRole = (session.user as any).role;

    const body = await request.json();
    const { username, email, whatsapp, subMarketerShare } = body;

    if (!username || !email) {
      return NextResponse.json(
        { error: "اسم المستخدم والبريد الإلكتروني مطلوبان / Username dan email wajib diisi" },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: username.trim() }, { email: email.trim().toLowerCase() }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "اسم المستخدم أو البريد الإلكتروني مسجل بالفعل في النظام / Username atau email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    // Generate unique short referral code right now
    let referralCode = generateShortReferralCode();
    let existsCode = await prisma.user.findUnique({ where: { referralCode } });
    while (existsCode) {
      referralCode = generateShortReferralCode();
      existsCode = await prisma.user.findUnique({ where: { referralCode } });
    }

    // If caller is MARKETER, parent is callerId. If caller is ADMIN, parent is null (direct)
    const parentId = callerRole === "ADMIN" ? null : callerId;

    const newMarketer = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp ? whatsapp.trim() : null,
        passwordHash,
        mustChangePassword: true,
        isApproved: true,
        parentId: parentId,
        subMarketerShare: subMarketerShare ? Number(subMarketerShare) : 350000,
        role: "MARKETER",
        referralCode: referralCode,
      },
    });

    const origin = request.headers.get("origin") || "http://localhost:3000";
    const personalPageUrl = `${origin}/m/${referralCode}`;
    const loginUrl = `${origin}/auth/signin`;

    return NextResponse.json({
      success: true,
      marketer: {
        id: newMarketer.id,
        username: newMarketer.username,
        email: newMarketer.email,
        whatsapp: newMarketer.whatsapp,
        tempPassword,
        referralCode,
        personalPageUrl,
        loginUrl,
      },
    });
  } catch (error: any) {
    console.error("Create marketer error:", error);
    return NextResponse.json(
      { error: "تعذر تسجيل المسوق الجديد: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
