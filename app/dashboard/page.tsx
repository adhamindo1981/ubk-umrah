import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { generateQRCodeDataUrl } from "@/lib/referral";
import { DashboardPageView } from "@/components/DashboardPageView";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  // Fetch marketer data with orders, rewards, payouts, and tree downline (sub-marketers)
  const user = await prisma.user.findUnique({
    where: { id: Number((session.user as any).id) },
    include: {
      orders: {
        include: { client: true },
        orderBy: { createdAt: "desc" },
      },
      rewards: {
        orderBy: { createdAt: "desc" },
      },
      payoutRequests: {
        orderBy: { createdAt: "desc" },
      },
      purchasedPosters: true,
      subMarketers: {
        include: {
          orders: true,
          rewards: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Calculate Rupiah balances
  const totalEarnedIDR = user.rewards.reduce((sum, r) => sum + (r.amount || r.points * 1000), 0);
  const totalRedeemedIDR = user.payoutRequests
    .filter((p) => p.status !== "REJECTED")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPosterPurchasesIDR = user.purchasedPosters
    .filter((p) => p.paymentMethod === "COMMISSION_BALANCE" && p.paymentStatus === "APPROVED")
    .reduce((sum, p) => sum + p.pricePaid, 0);

  const availableIDR = Math.max(0, totalEarnedIDR - totalRedeemedIDR - totalPosterPurchasesIDR);

  // Personal page and share link
  const personalPageUrl = user.referralCode ? `http://localhost:3000/m/${user.referralCode}` : "";
  const waShareText = encodeURIComponent(
    `Assalamu'alaikum wr. wb.,\nDaftarkan ibadah Umrah Anda bersama UBK Umrah (Umar Bin Alkhattab for Umrah) melalui halaman resmi kemitraan saya:\n${personalPageUrl}\n\n----------------------------------------\n\nالسلام عليكم ورحمة الله وبركاته،\nيمكنكم الاطلاع على تفاصيل برامج العمرة وطلب الحجز المباشر عبر صفحتي المعتمدة لدى عمر بن الخطاب للعمرة (UBK):\n${personalPageUrl}`
  );
  const waLink = `https://wa.me/?text=${waShareText}`;

  // Generate QR Code data URL for personal page
  let qrCodeDataUrl = "";
  if (personalPageUrl) {
    qrCodeDataUrl = await generateQRCodeDataUrl(personalPageUrl);
  }

  return (
    <DashboardPageView
      user={user}
      totalEarnedIDR={totalEarnedIDR}
      totalRedeemedIDR={totalRedeemedIDR}
      availableIDR={availableIDR}
      personalPageUrl={personalPageUrl}
      waLink={waLink}
      qrCodeDataUrl={qrCodeDataUrl}
    />
  );
}
