import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { addProspectSchema } from "@/lib/validations/sales-engine";
import { updateLeadSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);

    const leads = await prisma.marketerLead.findMany({
      where: { marketerId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Marketer Leads GET Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar jamaah prospek." },
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
    const body = await req.json();

    const parseResult = addProspectSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg =
        parseResult.error.issues[0]?.message || "Data prospek tidak valid";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { clientName, whatsappNumber, packageInterest, notes } =
      parseResult.data;

    // Create lead
    const lead = await prisma.marketerLead.create({
      data: {
        marketerId,
        clientName,
        whatsappNumber,
        source: "MANUAL_MISSION",
        status: "NEW",
        packageInterest,
        dpAmount: 5000000,
        notes: notes || null,
      },
    });

    // Automatically count towards today's contacts added in daily mission
    const today = new Date().toISOString().split("T")[0];
    try {
      await prisma.dailyMission.upsert({
        where: {
          marketerId_missionDate: {
            marketerId,
            missionDate: today,
          },
        },
        create: {
          marketerId,
          missionDate: today,
          contactsAddedCount: 1,
        },
        update: {
          contactsAddedCount: { increment: 1 },
        },
      });
    } catch (e) {
      console.warn("Failed to increment daily mission contacts on new lead:", e);
    }

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("Marketer Leads POST Error:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan data jamaah baru." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("id");

    if (!leadId) {
      return NextResponse.json(
        { error: "ID prospek diperlukan" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parseResult = updateLeadSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMsg =
        parseResult.error.issues[0]?.message || "Data update tidak valid";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // Verify ownership (Anti-IDOR)
    const existing = await prisma.marketerLead.findUnique({
      where: { id: leadId },
      select: { marketerId: true },
    });

    if (!existing || existing.marketerId !== marketerId) {
      return NextResponse.json(
        { error: "Data prospek tidak ditemukan atau akses ditolak." },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (parseResult.data.status) updateData.status = parseResult.data.status;
    if (parseResult.data.notes !== undefined) updateData.notes = parseResult.data.notes;
    if (parseResult.data.packageInterest) updateData.packageInterest = parseResult.data.packageInterest;
    if (parseResult.data.monthlyPlan !== undefined) updateData.monthlyPlan = parseResult.data.monthlyPlan;
    if (parseResult.data.lastContactedAt) updateData.lastContactedAt = new Date();

    const updated = await prisma.marketerLead.update({
      where: { id: leadId },
      data: updateData,
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error("Marketer Leads PATCH Error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status prospek." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("id");

    if (!leadId) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    const existing = await prisma.marketerLead.findUnique({
      where: { id: leadId },
      select: { marketerId: true },
    });

    if (!existing || existing.marketerId !== marketerId) {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    await prisma.marketerLead.delete({
      where: { id: leadId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Marketer Leads DELETE Error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data prospek." },
      { status: 500 }
    );
  }
}
