import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { sendMail } from "@/lib/email";

const prisma = new PrismaClient();

/**
 * PATCH endpoint for Admin to approve or freeze a Marketer account.
 * Body: { marketerId, isApproved }
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Ensure user is logged in
    if (!session || !session.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { marketerId, isApproved } = body;

    if (!marketerId || typeof isApproved !== "boolean") {
      return NextResponse.json(
        { error: "معرف المسوق وحالة التفعيل مطلوبان" },
        { status: 400 }
      );
    }

    // Update marketer isApproved status in DB
    const updatedMarketer = await prisma.user.update({
      where: { id: Number(marketerId) },
      data: { isApproved },
    });

    // Notify marketer via Email if approved
    try {
      if (isApproved && updatedMarketer.email) {
        await sendMail({
          to: updatedMarketer.email,
          subject: "UBK for Umrah - تم تفعيل حساب المسوق الخاص بك",
          html: `<div dir="rtl"><h2>تهانينا ${updatedMarketer.username}!</h2><p>تم تفعيل حساب المسوق الخاص بك بنجاح. يمكنك الآن تسجيل الدخول واستخدام كود الإحالة الخاص بك <strong>${updatedMarketer.referralCode}</strong> لبدء كسب المكافآت.</p></div>`,
        });
      }
    } catch (emailErr) {
      console.warn("Marketer approval email warning:", emailErr);
    }

    return NextResponse.json({ success: true, marketer: updatedMarketer });
  } catch (error: any) {
    console.error("Failed to update marketer status:", error);
    return NextResponse.json(
      { error: "تعذر تحديث حالة المسوق" },
      { status: 500 }
    );
  }
}

/**
 * DELETE endpoint for Admin to permanently delete a Marketer account.
 * URL: /api/admin/marketers?id=123 OR body: { marketerId: 123 }
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "غير مصرح بالدخول" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let marketerId = searchParams.get("id") ? Number(searchParams.get("id")) : null;

    if (!marketerId) {
      try {
        const body = await request.json();
        if (body.marketerId) marketerId = Number(body.marketerId);
      } catch (_) {
        // Body might be empty
      }
    }

    if (!marketerId || isNaN(marketerId)) {
      return NextResponse.json(
        { error: "معرف المسوق مطلوب ومفقود" },
        { status: 400 }
      );
    }

    // Check target user
    const targetUser = await prisma.user.findUnique({
      where: { id: marketerId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "المسوق غير موجود" }, { status: 404 });
    }

    // Protect ADMIN accounts from accidental deletion
    if (targetUser.role === "ADMIN") {
      return NextResponse.json(
        { error: "لا يمكن حذف حساب المسؤول العام (Admin)" },
        { status: 403 }
      );
    }

    // Clean up dependent relations safely
    // 1. Unlink any sub-marketers so they become independent
    await prisma.user.updateMany({
      where: { parentId: marketerId },
      data: { parentId: null },
    });

    // 2. Unlink any client orders attributed to this marketer so clients' records are preserved
    await prisma.order.updateMany({
      where: { marketerId: marketerId },
      data: { marketerId: null },
    });

    // 3. Delete rewards associated with this marketer
    await prisma.reward.deleteMany({
      where: { marketerId: marketerId },
    });

    // 4. Delete payout requests for this marketer
    await prisma.payoutRequest.deleteMany({
      where: { marketerId: marketerId },
    });

    // 5. Delete purchased/customized posters
    await prisma.marketerPoster.deleteMany({
      where: { marketerId: marketerId },
    });

    // 6. Finally delete the user account
    await prisma.user.delete({
      where: { id: marketerId },
    });

    return NextResponse.json({
      success: true,
      message: `تم حذف حساب المسوق (${targetUser.username}) بنجاح`,
    });
  } catch (error: any) {
    console.error("Failed to delete marketer:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء محاولة حذف المسوق: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
