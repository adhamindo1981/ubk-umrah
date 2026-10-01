import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const templateId = searchParams.get("templateId");

  if (!templateId) {
    return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
  }

  const userId = Number((session.user as any).id);

  // Verify that the user has purchased/licensed this poster and it is approved
  const purchase = await prisma.marketerPoster.findFirst({
    where: {
      marketerId: userId,
      templateId: Number(templateId),
      paymentStatus: "APPROVED",
    },
    include: {
      template: true,
      marketer: true,
    },
  });

  if (!purchase || !purchase.customizedImageUrl) {
    return NextResponse.json(
      { error: "Poster belum dibeli atau belum disetujui admin." },
      { status: 403 }
    );
  }

  // Extract raw SVG text
  let svgContent = "";
  if (purchase.customizedImageUrl.startsWith("data:image/svg+xml;utf8,")) {
    svgContent = decodeURIComponent(purchase.customizedImageUrl.replace("data:image/svg+xml;utf8,", ""));
  } else {
    svgContent = purchase.customizedImageUrl;
  }

  const safeFilename = `UBK-Poster-${purchase.licenseKey || purchase.id}.svg`;

  return new NextResponse(svgContent, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeFilename}"`,
      "Cache-Control": "no-cache",
    },
  });
}
