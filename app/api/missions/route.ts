import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { updateMissionProgressSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const WHATSAPP_DAILY_TARGET = 3; // إرسال 3 رسائل واتساب يفتح الرادار

/**
 * GET /api/missions
 * Returns today's mission progress and radar status for the logged-in marketer
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Fetch or initialize today's mission
    let mission = await prisma.dailyMission.findUnique({
      where: {
        marketerId_missionDate: {
          marketerId,
          missionDate: todayStr,
        },
      },
    });

    if (!mission) {
      mission = await prisma.dailyMission.create({
        data: {
          marketerId,
          missionDate: todayStr,
          contactsAddedCount: 0,
          whatsappSentCount: 0,
          isRadarUnlocked: false,
          pointsEarned: 0,
        },
      });
    }

    // Also get all-time points earned from missions
    const totalPointsAgg = await prisma.dailyMission.aggregate({
      where: { marketerId },
      _sum: { pointsEarned: true },
    });

    const totalPoints = totalPointsAgg._sum.pointsEarned || 0;

    return NextResponse.json({
      success: true,
      mission: {
        ...mission,
        targetWhatsapp: WHATSAPP_DAILY_TARGET,
        progressPercentage: Math.min(
          100,
          Math.round((mission.whatsappSentCount / WHATSAPP_DAILY_TARGET) * 100)
        ),
      },
      totalPoints,
    });
  } catch (error: any) {
    console.error("Fetch mission error:", error);
    return NextResponse.json({ error: "Gagal mengambil data misi harian" }, { status: 500 });
  }
}

/**
 * POST /api/missions
 * Registers activity towards today's mission (e.g. sending WhatsApp or adding contacts)
 * Automatically unlocks the Lead Radar when 3 WhatsApp messages are completed!
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const rawBody = await request.json();

    const parseResult = updateMissionProgressSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Data aksi tidak valid";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { action, increment, contactId } = parseResult.data;
    const todayStr = new Date().toISOString().split("T")[0];

    // Find current record
    let current = await prisma.dailyMission.findUnique({
      where: {
        marketerId_missionDate: {
          marketerId,
          missionDate: todayStr,
        },
      },
    });

    if (!current) {
      current = await prisma.dailyMission.create({
        data: {
          marketerId,
          missionDate: todayStr,
        },
      });
    }

    let updatedContacts = current.contactsAddedCount;
    let updatedWhatsapp = current.whatsappSentCount;
    let pointsToAdd = 0;

    if (action === "ADD_CONTACT") {
      updatedContacts += increment;
      pointsToAdd += 10 * increment;
    } else if (action === "SEND_WHATSAPP") {
      updatedWhatsapp += increment;
      pointsToAdd += 25 * increment;

      // If a specific lead was contacted, update lead status
      if (contactId) {
        await prisma.marketerLead.updateMany({
          where: { id: contactId, marketerId },
          data: {
            status: "CONTACTED",
            lastContactedAt: new Date(),
          },
        });
      }
    }

    // Check if radar should be unlocked
    const shouldUnlockRadar = updatedWhatsapp >= WHATSAPP_DAILY_TARGET;
    const isNewUnlock = shouldUnlockRadar && !current.isRadarUnlocked;
    if (isNewUnlock) {
      pointsToAdd += 100; // Bonus 100 points for unlocking radar!
    }

    const updatedMission = await prisma.dailyMission.update({
      where: { id: current.id },
      data: {
        contactsAddedCount: updatedContacts,
        whatsappSentCount: updatedWhatsapp,
        isRadarUnlocked: shouldUnlockRadar || current.isRadarUnlocked,
        pointsEarned: { increment: pointsToAdd },
      },
    });

    return NextResponse.json({
      success: true,
      mission: {
        ...updatedMission,
        targetWhatsapp: WHATSAPP_DAILY_TARGET,
        progressPercentage: Math.min(
          100,
          Math.round((updatedMission.whatsappSentCount / WHATSAPP_DAILY_TARGET) * 100)
        ),
      },
      newlyUnlockedRadar: isNewUnlock,
      pointsEarnedNow: pointsToAdd,
    });
  } catch (error: any) {
    console.error("Update mission error:", error);
    return NextResponse.json({ error: "Gagal memperbarui progres misi" }, { status: 500 });
  }
}
