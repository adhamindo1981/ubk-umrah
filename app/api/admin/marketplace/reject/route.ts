import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { posterId } = await req.json();

    const updated = await prisma.marketerPoster.update({
      where: { id: Number(posterId) },
      data: {
        paymentStatus: "REJECTED",
      },
    });

    return NextResponse.json({ success: true, poster: updated });
  } catch (error) {
    console.error("Reject poster error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
