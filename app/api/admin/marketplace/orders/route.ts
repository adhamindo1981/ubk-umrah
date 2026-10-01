import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";



export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const purchases = await prisma.marketerPoster.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      marketer: {
        select: {
          id: true,
          username: true,
          whatsapp: true,
          referralCode: true,
          email: true,
        },
      },
      template: {
        select: {
          id: true,
          title: true,
          price: true,
          category: true,
          previewImageUrl: true,
        },
      },
    },
  });

  return NextResponse.json({ purchases });
}
