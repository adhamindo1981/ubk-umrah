import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { isAiStudioEnabled } from "@/lib/ai-studio/flags";

export const dynamic = "force-dynamic";

const DAILY_MAX_QUOTA = 3;

export async function GET(req: NextRequest) {
  try {
    if (!isAiStudioEnabled()) {
      return NextResponse.json(
        { error: "AI Studio saat ini dinonaktifkan." },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = String((session.user as any).id);
    const userRole = (session.user as any)?.role || "MARKETER";
    const effectiveMaxQuota = userRole === "ADMIN" ? 100 : DAILY_MAX_QUOTA;
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const quotaRecord = await prisma.dailyImageQuota.findUnique({
      where: {
        marketerId_date: {
          marketerId,
          date: todayStr,
        },
      },
    });

    const usedCount = quotaRecord ? quotaRecord.count : 0;
    const remaining = Math.max(0, effectiveMaxQuota - usedCount);

    return NextResponse.json({
      success: true,
      date: todayStr,
      usedCount,
      maxQuota: effectiveMaxQuota,
      remaining,
      isExhausted: usedCount >= effectiveMaxQuota,
    });
  } catch (error: any) {
    console.error("AI Studio Image Quota GET Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kuota gambar." },
      { status: 500 }
    );
  }
}
