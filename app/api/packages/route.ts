import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const packages = await prisma.umrahPackage.findMany({
      where: { isActive: true },
      orderBy: [{ isPopular: "desc" }, { id: "asc" }],
    });

    return NextResponse.json({ success: true, packages });
  } catch (error: any) {
    console.error("Fetch packages error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data paket umrah" },
      { status: 500 }
    );
  }
}
