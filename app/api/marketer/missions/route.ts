import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { updateMissionProgressSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const today = new Date().toISOString().split("T")[0];

    // Find or create today's mission
    let mission = await prisma.dailyMission.findUnique({
      where: {
        marketerId_missionDate: {
          marketerId,
          missionDate: today,
        },
      },
    });

    if (!mission) {
      mission = await prisma.dailyMission.create({
        data: {
          marketerId,
          missionDate: today,
          contactsAddedCount: 0,
          whatsappSentCount: 0,
          isRadarUnlocked: false,
          pointsEarned: 0,
        },
      });
    }

    // Calculate total points accumulated across all missions
    const allMissions = await prisma.dailyMission.findMany({
      where: { marketerId },
      select: { pointsEarned: true },
    });
    const totalPoints = allMissions.reduce((acc, m) => acc + m.pointsEarned, 0);

    return NextResponse.json({
      mission: {
        id: mission.id,
        missionDate: mission.missionDate,
        contactsAddedCount: mission.contactsAddedCount,
        whatsappSentCount: mission.whatsappSentCount,
        isRadarUnlocked: mission.isRadarUnlocked,
        pointsEarned: mission.pointsEarned,
        targetWhatsapp: 3,
        progressPercentage: Math.min(
          100,
          Math.round((mission.whatsappSentCount / 3) * 100)
        ),
      },
      totalPoints,
    });
  } catch (error) {
    console.error("Marketer Missions GET Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data misi harian." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const today = new Date().toISOString().split("T")[0];

    const body = await req.json();
    const parseResult = updateMissionProgressSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMsg =
        parseResult.error.issues[0]?.message || "Invalid payload";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { action, increment, contactId, leadId } = parseResult.data;
    const targetLeadId = leadId || contactId;

    // Fetch existing mission
    let mission = await prisma.dailyMission.findUnique({
      where: {
        marketerId_missionDate: {
          marketerId,
          missionDate: today,
        },
      },
    });

    if (!mission) {
      mission = await prisma.dailyMission.create({
        data: {
          marketerId,
          missionDate: today,
          contactedLeadIds: "[]",
        },
      });
    }

    let newWhatsappSent = mission.whatsappSentCount;
    let newContactsAdded = mission.contactsAddedCount;
    let newPoints = mission.pointsEarned;
    let shouldUnlockRadar = mission.isRadarUnlocked;
    let alreadyCounted = false;

    // Parse contacted lead IDs list
    let contactedLeadIdsList: string[] = [];
    try {
      contactedLeadIdsList = JSON.parse(mission.contactedLeadIds || "[]");
      if (!Array.isArray(contactedLeadIdsList)) {
        contactedLeadIdsList = [];
      }
    } catch {
      contactedLeadIdsList = [];
    }

    if (action === "SEND_WHATSAPP") {
      // UNIQUE LEAD GUARD:
      // If a specific lead was already contacted today, prevent duplicate counting
      if (targetLeadId && contactedLeadIdsList.includes(targetLeadId)) {
        alreadyCounted = true;
      } else {
        if (targetLeadId) {
          contactedLeadIdsList.push(targetLeadId);
        }
        newWhatsappSent += increment;
        newPoints += 25 * increment; // 25 points per WA touchpoint
        if (newWhatsappSent >= 3 && !mission.isRadarUnlocked) {
          shouldUnlockRadar = true;
          newPoints += 100; // Bonus 100 points for unlocking radar
        }
      }

      // Always update lead in CRM if lead ID provided
      if (targetLeadId) {
        await prisma.marketerLead.updateMany({
          where: { id: targetLeadId, marketerId },
          data: {
            status: "CONTACTED",
            lastContactedAt: new Date(),
          },
        });
      }
    } else if (action === "ADD_CONTACT") {
      newContactsAdded += increment;
      newPoints += 10 * increment;
    }

    const updated = await prisma.dailyMission.update({
      where: { id: mission.id },
      data: {
        whatsappSentCount: newWhatsappSent,
        contactsAddedCount: newContactsAdded,
        isRadarUnlocked: shouldUnlockRadar,
        pointsEarned: newPoints,
        contactedLeadIds: JSON.stringify(contactedLeadIdsList),
      },
    });

    return NextResponse.json({
      success: true,
      alreadyCounted,
      mission: {
        ...updated,
        targetWhatsapp: 3,
        progressPercentage: Math.min(
          100,
          Math.round((updated.whatsappSentCount / 3) * 100)
        ),
      },
      justUnlocked: !mission.isRadarUnlocked && shouldUnlockRadar,
      message: alreadyCounted
        ? "Pesan WhatsApp dibuka. Kontak ini sudah dihitung dalam misi hari ini (1x per kontak per hari)."
        : "Progres misi harian berhasil ditambahkan.",
    });
  } catch (error) {
    console.error("Marketer Missions POST Error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui progres misi harian." },
      { status: 500 }
    );
  }
}
