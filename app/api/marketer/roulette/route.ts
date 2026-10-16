import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { claimRouletteLeadSchema } from "@/lib/validations/sales-engine";

/**
 * Partially masks phone numbers for privacy prior to claiming:
 * e.g. 6281234567890 -> +62 812-XXXX-7890
 */
function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return phone;
  const start = phone.slice(0, 5);
  const end = phone.slice(-4);
  return `${start}-XXXX-${end}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const today = new Date().toISOString().split("T")[0];

    // Verify if marketer has unlocked radar today
    const mission = await prisma.dailyMission.findUnique({
      where: {
        marketerId_missionDate: {
          marketerId,
          missionDate: today,
        },
      },
    });

    const isUnlocked = mission?.isRadarUnlocked || false;

    // Fetch available roulette hot leads
    const availableLeads = await prisma.leadRoulette.findMany({
      where: { status: "AVAILABLE" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const maskedLeads = availableLeads.map((l) => ({
      id: l.id,
      clientName: l.clientName,
      whatsappNumber: isUnlocked ? l.whatsappNumber : maskPhoneNumber(l.whatsappNumber),
      city: l.city,
      packageInterest: l.packageInterest,
      createdAt: l.createdAt,
    }));

    return NextResponse.json({
      isRadarUnlocked: isUnlocked,
      progress: {
        whatsappSentCount: mission?.whatsappSentCount || 0,
        targetWhatsapp: 3,
      },
      leads: maskedLeads,
    });
  } catch (error) {
    console.error("Marketer Roulette GET Error:", error);
    return NextResponse.json(
      { error: "Gagal memuat radar peluang jamaah." },
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

    // Check if radar is unlocked today
    const mission = await prisma.dailyMission.findUnique({
      where: {
        marketerId_missionDate: {
          marketerId,
          missionDate: today,
        },
      },
    });

    if (!mission || !mission.isRadarUnlocked) {
      return NextResponse.json(
        {
          error:
            "Radar Peluang terkunci! Selesaikan misi 3 pesan WhatsApp hari ini untuk membuka akses / أكمل مهمة التواصل مع 3 عملاء لفتح الرادار.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = claimRouletteLeadSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Payload tidak valid" },
        { status: 400 }
      );
    }

    const { rouletteId } = parseResult.data;

    // Atomic transaction using updateMany with condition status: "AVAILABLE" to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch lead details first
      const targetLead = await tx.leadRoulette.findUnique({
        where: { id: rouletteId },
      });

      if (!targetLead || targetLead.status !== "AVAILABLE") {
        return null;
      }

      // 2. Atomic claim update
      const updateResult = await tx.leadRoulette.updateMany({
        where: {
          id: rouletteId,
          status: "AVAILABLE",
        },
        data: {
          status: "CLAIMED",
          claimedById: marketerId,
          claimedAt: new Date(),
        },
      });

      if (updateResult.count === 0) {
        return null; // Another marketer claimed it at the exact same split-second
      }

      // 3. Automatically add to Marketer's CRM
      const newCrmLead = await tx.marketerLead.create({
        data: {
          marketerId,
          clientName: targetLead.clientName,
          whatsappNumber: targetLead.whatsappNumber,
          source: "RADAR_ROULETTE",
          status: "NEW",
          packageInterest: targetLead.packageInterest,
          dpAmount: 5000000,
          notes: `Peluang Panas dari Radar (${targetLead.city})`,
        },
      });

      return {
        claimedLead: targetLead,
        crmLead: newCrmLead,
      };
    });

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Maaf, peluang jamaah ini baru saja diambil oleh mitra pemasar lain beberapa detik yang lalu / تم اقتناص هذه الفرصة من قِبل مسوق آخر.",
        },
        { status: 409 }
      );
    }

    // Build personalized WhatsApp link
    const cleanWa = result.claimedLead.whatsappNumber.replace(/\D/g, "");
    const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
      `Assalamu'alaikum Bapak/Ibu ${result.claimedLead.clientName},\n\n` +
        `Saya konsultan resmi dari UBK Umrah (Umar Bin Alkhattab for Umrah - PPIU No. U-271 Tahun 2021). ` +
        `Kami menerima informasi bahwa Anda berminat dengan program ${result.claimedLead.packageInterest}.\n\n` +
        `Izin kami informasikan bahwa paket ini menggunakan penerbangan Qatar Airways dan hotel walking distance tanpa bus shuttle. Cukup DP Rp 5.000.000 untuk amankan seat.\n\n` +
        `Apakah ada waktu luang sebentar untuk kami jelaskan detail jadwal dan fasilitasnya? Terima kasih. 🙏`
    )}`;

    return NextResponse.json({
      success: true,
      message: "Peluang jamaah berhasil diamankan ke CRM Anda!",
      lead: result.crmLead,
      unmaskedPhone: result.claimedLead.whatsappNumber,
      waUrl,
    });
  } catch (error) {
    console.error("Marketer Roulette Claim Error:", error);
    return NextResponse.json(
      { error: "Gagal mengklaim peluang jamaah." },
      { status: 500 }
    );
  }
}
