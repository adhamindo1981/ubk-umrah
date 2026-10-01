import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";



export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number((session.user as any).id);

  // Fetch user with rewards, payouts, and poster purchases to calculate available balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      rewards: true,
      payoutRequests: true,
      purchasedPosters: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const totalEarned = user.rewards.reduce((sum, r) => sum + (r.amount || r.points * 1000), 0);
  const totalRedeemed = user.payoutRequests
    .filter((p) => p.status !== "REJECTED")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPosterPurchases = user.purchasedPosters
    .filter((p) => p.paymentMethod === "COMMISSION_BALANCE" && p.paymentStatus === "APPROVED")
    .reduce((sum, p) => sum + p.pricePaid, 0);

  const availableBalance = Math.max(0, totalEarned - totalRedeemed - totalPosterPurchases);

  // Has the user ever claimed their free starter poster?
  const hasUsedFreeStarter = user.purchasedPosters.some(
    (p) => p.paymentMethod === "FREE_STARTER" && p.paymentStatus === "APPROVED"
  );

  // Fetch company bank account settings
  const bankSettings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: ["companyBankName", "companyBankAccountNumber", "companyBankAccountName"],
      },
    },
  });

  const companyBank = {
    bankName: bankSettings.find((s) => s.key === "companyBankName")?.value || "Bank Central Asia (BCA)",
    accountNumber: bankSettings.find((s) => s.key === "companyBankAccountNumber")?.value || "8830-1928-3190",
    accountName: bankSettings.find((s) => s.key === "companyBankAccountName")?.value || "UMAR BIN AL-KHATTAB FOR UMRAH",
  };

  const templates = await prisma.posterTemplate.findMany({
    orderBy: { id: "asc" },
    include: {
      purchases: {
        where: { marketerId: userId },
      },
    },
  });

  const formatted = templates.map((t) => {
    const userPurchase = t.purchases[0] || null;
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      price: t.price,
      category: t.category,
      previewImageUrl: t.previewImageUrl,
      isPurchased: !!userPurchase && userPurchase.paymentStatus === "APPROVED",
      paymentStatus: userPurchase?.paymentStatus || null,
      paymentMethod: userPurchase?.paymentMethod || null,
      receiptImageUrl: userPurchase?.receiptImageUrl || null,
      customizedImageUrl: userPurchase?.customizedImageUrl || null,
      licenseKey: userPurchase?.licenseKey || null,
      isFeaturedOnPage: userPurchase?.isFeaturedOnPage ?? false,
      purchasedAt: userPurchase?.createdAt || null,
    };
  });

  return NextResponse.json({
    templates: formatted,
    userBalance: availableBalance,
    hasUsedFreeStarter,
    companyBank,
  });
}
