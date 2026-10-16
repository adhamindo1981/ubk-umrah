import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { claimRouletteSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

/**
 * GET /api/radar/roulette
 * Returns hot leads pool if marketer has unlocked today's radar
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const todayStr = new Date().toISOString().split("T")[0];

    // Check today's mission status
    const mission = await prisma.dailyMission.findUnique({
      where: {
        marketerId_missionDate: {
          marketerId,
          missionDate: todayStr,
        },
      },
    });

    const isUnlocked = mission?.isRadarUnlocked ?? false;

    if (!isUnlocked) {
      return NextResponse.json({
        isRadarUnlocked: false,
        message:
          "Radar Terkunci! Selesaikan target menghubungi 3 calon jamaah hari ini untuk membuka Radar Peluang Panas.",
        availableCount: await prisma.leadRoulette.count({ where: { status: "AVAILABLE" } }),
      });
    }

    // Radar is unlocked! Return available leads in the pool
    const hotLeads = await prisma.leadRoulette.findMany({
      where: { status: "AVAILABLE" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Also get leads previously claimed by this marketer
    const claimedByMe = await prisma.leadRoulette.findMany({
      where: { claimedById: marketerId },
      orderBy: { claimedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      isRadarUnlocked: true,
      hotLeads,
      claimedByMe,
      availableCount: hotLeads.length,
    });
  } catch (error: any) {
    console.error("Fetch radar error:", error);
    return NextResponse.json({ error: "Gagal memuat data Radar Peluang" }, { status: 500 });
  }
}

/**
 * POST /api/radar/roulette
 * Atomically claims an available hot lead from the roulette pool
 * using Prisma Interactive Transactions (Prevents race conditions)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const todayStr = new Date().toISOString().split("T")[0];

    // Verify radar is unlocked for today
    const mission = await prisma.dailyMission.findUnique({
      where: {
        marketerId_missionDate: {
          marketerId,
          missionDate: todayStr,
        },
      },
    });

    if (!mission?.isRadarUnlocked) {
      return NextResponse.json(
        {
          error:
            "Akses Radar Ditolak! Anda harus menyelesaikan target 3 kirim pesan WhatsApp hari ini untuk mengklaim prospek.",
        },
        { status: 403 }
      );
    }

    const rawBody = await request.json();
    const parseResult = claimRouletteSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "ID prospek tidak valid";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { rouletteId } = parseResult.data;

    // Atomic interactive transaction to guarantee single claimer
    const result = await prisma.$transaction(async (tx) => {
      // Find candidate
      const target = await tx.leadRoulette.findUnique({
        where: { id: rouletteId },
      });

      if (!target) {
        throw new Error("Peluang jamaah tidak ditemukan.");
      }

      if (target.status !== "AVAILABLE") {
        throw new Error("Maaf, peluang ini baru saja diklaim oleh mitra lain! Silakan pilih prospek lainnya.");
      }

      // Claim the lead
      const claimedRoulette = await tx.leadRoulette.update({
        where: { id: rouletteId },
        data: {
          status: "CLAIMED",
          claimedById: marketerId,
          claimedAt: new Date(),
        },
      });

      // Automatically add directly into marketer's Mini-CRM
      const newCrmLead = await tx.marketerLead.create({
        data: {
          marketerId,
          clientName: target.clientName,
          whatsappNumber: target.whatsappNumber,
          source: "RADAR_ROULETTE",
          status: "NEW",
          packageInterest: target.packageInterest,
          dpAmount: 5000000,
          notes: `Didapatkan via Radar Peluang Panas (${target.city})`,
        },
      });

      return { claimedRoulette, newCrmLead };
    });

    return NextResponse.json({
      success: true,
      message: "Selamat! Prospek jamaah berhasil diklaim dan telah masuk ke daftar CRM Anda.",
      lead: result.newCrmLead,
    });
  } catch (error: any) {
    console.error("Claim roulette error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mengklaim peluang jamaah" },
      { status: 400 }
    );
  }
}
