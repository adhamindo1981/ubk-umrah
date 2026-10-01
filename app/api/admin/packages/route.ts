import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const packages = await prisma.umrahPackage.findMany({
      orderBy: [{ isPopular: "desc" }, { id: "asc" }],
    });
    return NextResponse.json({ success: true, packages });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      titleAr,
      year,
      month,
      programDays,
      downPayment,
      airline,
      makkahHotel,
      madinahHotel,
      freebies,
      inclusions,
      priceQuad,
      priceTriple,
      priceDouble,
      scholarLeader,
      notes,
      customFields,
      badge,
      badgeAr,
      posterUrl,
      isPopular,
      isActive,
    } = body;

    if (!title || !month || !airline || !makkahHotel || !madinahHotel) {
      return NextResponse.json(
        { error: "Mohon lengkapi data wajib paket umrah" },
        { status: 400 }
      );
    }

    const newPkg = await prisma.umrahPackage.create({
      data: {
        title,
        titleAr: titleAr || null,
        year: Number(year) || 2026,
        month,
        programDays: Number(programDays) || 9,
        downPayment: Number(downPayment) || 5000000,
        airline,
        makkahHotel,
        madinahHotel,
        freebies: typeof freebies === "string" ? freebies : JSON.stringify(freebies || []),
        inclusions: typeof inclusions === "string" ? inclusions : JSON.stringify(inclusions || []),
        priceQuad: Number(priceQuad) || 0,
        priceTriple: Number(priceTriple) || 0,
        priceDouble: Number(priceDouble) || 0,
        scholarLeader: scholarLeader || null,
        notes: notes || null,
        customFields: typeof customFields === "string" ? customFields : JSON.stringify(customFields || []),
        badge: badge || null,
        badgeAr: badgeAr || null,
        posterUrl: posterUrl || null,
        isPopular: Boolean(isPopular),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, package: newPkg }, { status: 201 });
  } catch (error: any) {
    console.error("Create package error:", error);
    return NextResponse.json(
      { error: "Gagal membuat paket umrah baru" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...dataToUpdate } = body;

    if (!id) {
      return NextResponse.json({ error: "ID paket diperlukan" }, { status: 400 });
    }

    const updated = await prisma.umrahPackage.update({
      where: { id: Number(id) },
      data: {
        ...(dataToUpdate.title !== undefined ? { title: dataToUpdate.title } : {}),
        ...(dataToUpdate.titleAr !== undefined ? { titleAr: dataToUpdate.titleAr } : {}),
        ...(dataToUpdate.year !== undefined ? { year: Number(dataToUpdate.year) } : {}),
        ...(dataToUpdate.month !== undefined ? { month: dataToUpdate.month } : {}),
        ...(dataToUpdate.programDays !== undefined ? { programDays: Number(dataToUpdate.programDays) } : {}),
        ...(dataToUpdate.downPayment !== undefined ? { downPayment: Number(dataToUpdate.downPayment) } : {}),
        ...(dataToUpdate.airline !== undefined ? { airline: dataToUpdate.airline } : {}),
        ...(dataToUpdate.makkahHotel !== undefined ? { makkahHotel: dataToUpdate.makkahHotel } : {}),
        ...(dataToUpdate.madinahHotel !== undefined ? { madinahHotel: dataToUpdate.madinahHotel } : {}),
        ...(dataToUpdate.freebies !== undefined
          ? { freebies: typeof dataToUpdate.freebies === "string" ? dataToUpdate.freebies : JSON.stringify(dataToUpdate.freebies) }
          : {}),
        ...(dataToUpdate.inclusions !== undefined
          ? { inclusions: typeof dataToUpdate.inclusions === "string" ? dataToUpdate.inclusions : JSON.stringify(dataToUpdate.inclusions) }
          : {}),
        ...(dataToUpdate.priceQuad !== undefined ? { priceQuad: Number(dataToUpdate.priceQuad) } : {}),
        ...(dataToUpdate.priceTriple !== undefined ? { priceTriple: Number(dataToUpdate.priceTriple) } : {}),
        ...(dataToUpdate.priceDouble !== undefined ? { priceDouble: Number(dataToUpdate.priceDouble) } : {}),
        ...(dataToUpdate.scholarLeader !== undefined ? { scholarLeader: dataToUpdate.scholarLeader } : {}),
        ...(dataToUpdate.notes !== undefined ? { notes: dataToUpdate.notes } : {}),
        ...(dataToUpdate.customFields !== undefined
          ? { customFields: typeof dataToUpdate.customFields === "string" ? dataToUpdate.customFields : JSON.stringify(dataToUpdate.customFields) }
          : {}),
        ...(dataToUpdate.badge !== undefined ? { badge: dataToUpdate.badge } : {}),
        ...(dataToUpdate.badgeAr !== undefined ? { badgeAr: dataToUpdate.badgeAr } : {}),
        ...(dataToUpdate.posterUrl !== undefined ? { posterUrl: dataToUpdate.posterUrl || null } : {}),
        ...(dataToUpdate.isPopular !== undefined ? { isPopular: Boolean(dataToUpdate.isPopular) } : {}),
        ...(dataToUpdate.isActive !== undefined ? { isActive: Boolean(dataToUpdate.isActive) } : {}),
      },
    });

    return NextResponse.json({ success: true, package: updated });
  } catch (error: any) {
    console.error("Update package error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui paket umrah" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID paket diperlukan" }, { status: 400 });
    }

    await prisma.umrahPackage.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete package error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus paket umrah" },
      { status: 500 }
    );
  }
}
