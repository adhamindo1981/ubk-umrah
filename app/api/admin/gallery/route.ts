import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { normalizeImageUrl } from "@/lib/imageUtils";
import fs from "fs";
import path from "path";



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
    const rawPhotos = await prisma.pilgrimPhoto.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
    });
    const photos = rawPhotos.map((p) => ({
      ...p,
      imageUrl: normalizeImageUrl(p.imageUrl),
    }));
    return NextResponse.json({ success: true, photos });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal mengambil data galeri" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, titleAr, category, categoryAr, imageBase64, imageUrl, location, year } = body;

    let finalImageUrl = normalizeImageUrl(imageUrl) || "";

    // If an image file base64 data URL is uploaded, validate type & size strictly
    if (imageBase64) {
      const { validateBase64Image } = await import("@/lib/validations");
      const validation = validateBase64Image(imageBase64);
      if (!validation.valid || !validation.buffer || !validation.extension) {
        return NextResponse.json({ error: validation.error || "File gambar tidak valid" }, { status: 400 });
      }

      const safeUuid = crypto.randomUUID().replace(/-/g, "").substring(0, 12);
      const filename = `pilgrim-${Date.now()}-${safeUuid}.${validation.extension}`;
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "gallery");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, validation.buffer);
        finalImageUrl = `/uploads/gallery/${filename}`;
      } catch (fsErr) {
        // Fallback to validated data URI in read-only environments
        finalImageUrl = imageBase64;
      }
    }

    if (!finalImageUrl) {
      return NextResponse.json({ error: "Silakan pilih atau unggah foto jamaah" }, { status: 400 });
    }

    const newPhoto = await prisma.pilgrimPhoto.create({
      data: {
        title: title || "Foto Dokumentasi Jamaah UBK",
        titleAr: titleAr || "توثيق رحلة معتمري عمر بن الخطاب للعمرة",
        category: category || "MAKKAH",
        categoryAr: categoryAr || "مكة المكرمة",
        imageUrl: finalImageUrl,
        location: location || "المشاعر المقدسة",
        year: year ? parseInt(year, 10) : new Date().getFullYear(),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, photo: newPhoto });
  } catch (error: any) {
    console.error("Failed to add pilgrim photo:", error);
    return NextResponse.json({ error: error.message || "Gagal menyimpan foto" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "", 10);
    if (!id) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    await prisma.pilgrimPhoto.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menghapus foto" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, isActive, sortOrder, title, titleAr } = body;
    if (!id) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }

    const updated = await prisma.pilgrimPhoto.update({
      where: { id },
      data: {
        ...(typeof isActive === "boolean" ? { isActive } : {}),
        ...(typeof sortOrder === "number" ? { sortOrder } : {}),
        ...(title ? { title } : {}),
        ...(titleAr ? { titleAr } : {}),
      },
    });

    return NextResponse.json({ success: true, photo: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memperbarui foto" }, { status: 500 });
  }
}
