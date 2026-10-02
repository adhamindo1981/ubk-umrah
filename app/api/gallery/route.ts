import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeImageUrl } from "@/lib/imageUtils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rawPhotos = await prisma.pilgrimPhoto.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
    });

    const photos = rawPhotos.map((p) => ({
      ...p,
      imageUrl: normalizeImageUrl(p.imageUrl),
    }));

    return NextResponse.json({ success: true, photos });
  } catch (error: any) {
    console.error("Failed to fetch gallery:", error);
    return NextResponse.json({ error: "Gagal memuat galeri" }, { status: 500 });
  }
}
