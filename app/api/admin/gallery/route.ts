import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
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
    const photos = await prisma.pilgrimPhoto.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
    });
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

    let finalImageUrl = imageUrl || "";

    // If an image file base64 data URL is uploaded, save it to public/uploads/gallery
    if (imageBase64 && imageBase64.startsWith("data:image")) {
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1].split("/")[1] || "jpg";
        const buffer = Buffer.from(matches[2], "base64");
        const filename = `pilgrim-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "gallery");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer);
        finalImageUrl = `/uploads/gallery/${filename}`;
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
