import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { createLeadSchema, updateLeadSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

/**
 * GET /api/leads
 * Returns the current authenticated marketer's leads (Mini-CRM)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    const leads = await prisma.marketerLead.findMany({
      where: {
        marketerId,
        ...(statusFilter ? { status: statusFilter as any } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error("Fetch leads error:", error);
    return NextResponse.json({ error: "Gagal mengambil data prospek" }, { status: 500 });
  }
}

/**
 * POST /api/leads
 * Creates a new lead (from Tabungan Calculator, Manual Mission, or Personal Form)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const rawBody = await request.json();

    const parseResult = createLeadSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Data prospek tidak valid";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = parseResult.data;

    const newLead = await prisma.marketerLead.create({
      data: {
        marketerId,
        clientName: data.clientName,
        whatsappNumber: data.whatsappNumber,
        source: data.source as any,
        status: data.status as any,
        packageInterest: data.packageInterest,
        dpAmount: data.dpAmount ?? 5000000,
        monthlyPlan: data.monthlyPlan,
        notes: data.notes,
        lastContactedAt: data.status === "CONTACTED" ? new Date() : null,
      },
    });

    // Automatically register progress towards today's Gamified Daily Mission
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    await prisma.dailyMission.upsert({
      where: {
        marketerId_missionDate: {
          marketerId,
          missionDate: todayStr,
        },
      },
      create: {
        marketerId,
        missionDate: todayStr,
        contactsAddedCount: 1,
        whatsappSentCount: 0,
        isRadarUnlocked: false,
        pointsEarned: 10,
      },
      update: {
        contactsAddedCount: { increment: 1 },
        pointsEarned: { increment: 10 },
      },
    });

    return NextResponse.json({ success: true, lead: newLead }, { status: 201 });
  } catch (error: any) {
    console.error("Create lead error:", error);
    return NextResponse.json({ error: "Gagal menambahkan prospek baru" }, { status: 500 });
  }
}

/**
 * PATCH /api/leads
 * Updates lead status, notes, or lastContactedAt (Strictly IDOR-protected)
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const rawBody = await request.json();
    const { id, ...updateFields } = rawBody;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID prospek diperlukan" }, { status: 400 });
    }

    const parseResult = updateLeadSchema.safeParse(updateFields);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Data pembaruan tidak valid";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data = parseResult.data;

    // Check ownership before updating
    const existing = await prisma.marketerLead.findFirst({
      where: { id, marketerId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Data prospek tidak ditemukan atau bukan milik Anda" }, { status: 404 });
    }

    const updatedLead = await prisma.marketerLead.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status as any } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.packageInterest ? { packageInterest: data.packageInterest } : {}),
        ...(data.monthlyPlan !== undefined ? { monthlyPlan: data.monthlyPlan } : {}),
        ...(data.lastContactedAt ? { lastContactedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    console.error("Update lead error:", error);
    return NextResponse.json({ error: "Gagal memperbarui prospek" }, { status: 500 });
  }
}

/**
 * DELETE /api/leads
 * Deletes a lead (Strictly IDOR-protected)
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = Number((session.user as any).id);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID prospek diperlukan" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.marketerLead.findFirst({
      where: { id, marketerId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Data prospek tidak ditemukan" }, { status: 404 });
    }

    await prisma.marketerLead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete lead error:", error);
    return NextResponse.json({ error: "Gagal menghapus prospek" }, { status: 500 });
  }
}
