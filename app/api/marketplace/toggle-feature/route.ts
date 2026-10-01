import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number((session.user as any).id);

  try {
    const { templateId, isFeaturedOnPage } = await req.json();

    const poster = await prisma.marketerPoster.findFirst({
      where: {
        marketerId: userId,
        templateId: Number(templateId),
      },
    });

    if (!poster) {
      return NextResponse.json({ error: "Poster not found" }, { status: 404 });
    }

    const updated = await prisma.marketerPoster.update({
      where: { id: poster.id },
      data: { isFeaturedOnPage: Boolean(isFeaturedOnPage) },
    });

    return NextResponse.json({ success: true, poster: updated });
  } catch (error) {
    console.error("Toggle feature poster error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
