import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { hashPassword } from "@/lib/auth";

/**
 * GET /api/admin/admins
 * Returns list of all current Admin accounts
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح بالدخول / Tidak diizinkan" }, { status: 401 });
    }

    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        username: true,
        email: true,
        whatsapp: true,
        role: true,
        isApproved: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ admins });
  } catch (error: any) {
    console.error("Fetch admins error:", error);
    return NextResponse.json({ error: "تعذر جلب مسؤولي النظام" }, { status: 500 });
  }
}

/**
 * POST /api/admin/admins
 * Creates a brand new Admin account with full permissions
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح بالدخول / Tidak diizinkan" }, { status: 401 });
    }

    const body = await request.json();
    const { username, email, whatsapp, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "اسم المستخدم والبريد وكلمة المرور مطلوبة / Semua bidang wajib diisi" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب ألا تقل عن 6 خانات / Kata sandi minimal 6 karakter" },
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
        { error: "اسم المستخدم أو البريد الإلكتروني مسجل بالفعل / Username atau email sudah terdaftar" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newAdmin = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp ? whatsapp.trim() : null,
        passwordHash,
        role: "ADMIN",
        isApproved: true,
        mustChangePassword: false,
      },
      select: {
        id: true,
        username: true,
        email: true,
        whatsapp: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, admin: newAdmin });
  } catch (error: any) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { error: "تعذر إنشاء حساب الأدمن: " + (error?.message || "") },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/admins
 * Promotes a marketer to Admin or changes role
 * Body: { userId, role: "ADMIN" | "MARKETER" }
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح بالدخول / Tidak diizinkan" }, { status: 401 });
    }

    const currentAdminId = Number((session.user as any).id);
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role || !["ADMIN", "MARKETER"].includes(role)) {
      return NextResponse.json(
        { error: "معرف المستخدم والرتبة الجديدة مطلوبان / ID pengguna dan peran baru wajib diisi" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "المستخدم غير موجود / Pengguna tidak ditemukan" }, { status: 404 });
    }

    // Safety: Prevent self-demotion if there is only 1 admin
    if (Number(userId) === currentAdminId && role === "MARKETER") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "لا يمكنك خفض رتبة حسابك لأنك الأدمن الوحيد في النظام" },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        role,
        isApproved: true, // Always ensure approved when made admin
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isApproved: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message:
        role === "ADMIN"
          ? `تم ترقية (${updatedUser.username}) إلى رتبة أدمن بكامل الصلاحيات بنجاح!`
          : `تم إعادة تعيين (${updatedUser.username}) كمسوّق معتمد.`,
    });
  } catch (error: any) {
    console.error("Update admin role error:", error);
    return NextResponse.json(
      { error: "تعذر تحديث الرتبة والصلاحيات" },
      { status: 500 }
    );
  }
}
