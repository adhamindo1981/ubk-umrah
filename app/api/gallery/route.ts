import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const photos = await prisma.pilgrimPhoto.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
    });
    return NextResponse.json({ success: true, photos });
  } catch (error: any) {
    console.error("Failed to fetch gallery:", error);
    return NextResponse.json({ error: "Gagal memuat galeri" }, { status: 500 });
  }
}
