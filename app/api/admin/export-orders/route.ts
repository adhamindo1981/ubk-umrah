import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Force dynamic rendering – required because getServerSession reads request headers
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

/**
 * GET route handler to export all orders and clients to a CSV file.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        client: true,
        marketer: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate UTF-8 CSV with BOM for Arabic support in Excel
    let csvContent = "\uFEFFرقم الطلب,اسم العميل,البريد الإلكتروني,المسوق,كود الإحالة,حالة الطلب,تاريخ الطلب\n";

    orders.forEach((o) => {
      const orderId = o.id;
      const clientName = `"${o.client.name.replace(/"/g, '""')}"`;
      const clientEmail = `"${o.client.email.replace(/"/g, '""')}"`;
      const marketerName = o.marketer ? `"${o.marketer.username.replace(/"/g, '""')}"` : "مباشر";
      const referralCode = o.referralCode || "-";
      const status = o.status;
      const date = new Date(o.createdAt).toLocaleDateString("ar-SA");

      csvContent += `${orderId},${clientName},${clientEmail},${marketerName},${referralCode},${status},${date}\n`;
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="UBK_Umrah_Orders_Report_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Export CSV error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تصدير التقرير" },
      { status: 500 }
    );
  }
}
