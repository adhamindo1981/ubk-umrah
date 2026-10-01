import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

/**
 * PATCH endpoint for Admin to manually adjust marketer points
 * Body: { marketerId, pointsToAdd }
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { marketerId, pointsToAdd } = body;

    if (!marketerId || typeof pointsToAdd !== "number") {
      return NextResponse.json(
        { error: "معرف المسوق وعدد النقاط مطلوبان" },
        { status: 400 }
      );
    }

    // Create a new Reward record with the points adjustment
    const reward = await prisma.reward.create({
      data: {
        marketerId: Number(marketerId),
        points: Number(pointsToAdd),
        amount: Number(pointsToAdd) * 1000,
      },
    });

    return NextResponse.json({ success: true, reward });
  } catch (error: any) {
    console.error("Points adjustment error:", error);
    return NextResponse.json(
      { error: "تعذر تعديل النقاط" },
      { status: 500 }
    );
  }
}
