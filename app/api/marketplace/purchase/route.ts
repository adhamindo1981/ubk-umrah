import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number((session.user as any).id);

  try {
    const { templateId, paymentMethod, receiptImageUrl } = await req.json();

    if (!templateId || !paymentMethod) {
      return NextResponse.json(
        { error: "Template ID dan metode pembayaran wajib diisi" },
        { status: 400 }
      );
    }

    // Fetch user details and existing purchases
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

    // Fetch template
    const template = await prisma.posterTemplate.findUnique({
      where: { id: Number(templateId) },
    });

    if (!template) {
      return NextResponse.json({ error: "Desain poster tidak ditemukan" }, { status: 404 });
    }

    // Check if already purchased/pending
    const existing = await prisma.marketerPoster.findFirst({
      where: {
        marketerId: userId,
        templateId: template.id,
      },
    });

    if (existing && existing.paymentStatus === "APPROVED") {
      return NextResponse.json({
        message: "Poster sudah dimiliki",
        poster: existing,
      });
    }

    // Handle Payment Pathways:
    let finalPaymentStatus = "APPROVED";
    let pricePaid = 0;

    if (paymentMethod === "FREE_STARTER") {
      // Check if user has already claimed their 1 free starter poster
      const hasUsedFree = user.purchasedPosters.some(
        (p) => p.paymentMethod === "FREE_STARTER" && p.paymentStatus === "APPROVED"
      );

      if (hasUsedFree) {
        return NextResponse.json(
          {
            error:
              "Anda telah menggunakan jatah 1 poster gratis untuk mitra baru. Untuk poster selanjutnya, silakan gunakan saldo komisi atau transfer bank.",
          },
          { status: 400 }
        );
      }

      pricePaid = 0;
      finalPaymentStatus = "APPROVED";
    } else if (paymentMethod === "COMMISSION_BALANCE") {
      // Calculate available balance
      const totalEarned = user.rewards.reduce((sum, r) => sum + (r.amount || r.points * 1000), 0);
      const totalRedeemed = user.payoutRequests
        .filter((p) => p.status !== "REJECTED")
        .reduce((sum, p) => sum + p.amount, 0);
      const totalPosterPurchases = user.purchasedPosters
        .filter((p) => p.paymentMethod === "COMMISSION_BALANCE" && p.paymentStatus === "APPROVED")
        .reduce((sum, p) => sum + p.pricePaid, 0);

      const availableBalance = Math.max(0, totalEarned - totalRedeemed - totalPosterPurchases);

      if (availableBalance < template.price) {
        return NextResponse.json(
          {
            error: `Saldo komisi Anda (Rp ${availableBalance.toLocaleString("id-ID")}) tidak mencukupi untuk harga poster Rp ${template.price.toLocaleString("id-ID")}. Silakan pilih opsi Transfer Bank.`,
          },
          { status: 400 }
        );
      }

      pricePaid = template.price;
      finalPaymentStatus = "APPROVED";
    } else if (paymentMethod === "BANK_TRANSFER") {
      if (!receiptImageUrl) {
        return NextResponse.json(
          { error: "Bukti transfer pembayaran (foto/gambar struk) wajib dilampirkan" },
          { status: 400 }
        );
      }

      pricePaid = template.price;
      finalPaymentStatus = "PENDING_APPROVAL"; // Awaiting Admin/Designer verification
    } else {
      return NextResponse.json({ error: "Metode pembayaran tidak valid" }, { status: 400 });
    }

    // Generate unique official license key
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const licenseKey = `UBK-LIC-${randomHex}-${Date.now().toString(36).toUpperCase()}`;

    // Stamp marketer branding onto clean template (if approved)
    let customizedImageUrl: string | null = null;
    if (finalPaymentStatus === "APPROVED") {
      const cleanSvg = decodeURIComponent(template.cleanImageUrl.replace("data:image/svg+xml;utf8,", ""));
      const brandedSvg = cleanSvg
        .replace("{{MARKETER_NAME}}", user.username.toUpperCase())
        .replace("{{MARKETER_WHATSAPP}}", user.whatsapp || "Hubungi Admin UBK")
        .replace("{{MARKETER_CODE}}", user.referralCode || "UBK-PARTNER")
        .replace("{{LICENSE_KEY}}", licenseKey);

      customizedImageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(brandedSvg)}`;
    }

    let savedPoster;
    if (existing) {
      savedPoster = await prisma.marketerPoster.update({
        where: { id: existing.id },
        data: {
          paymentMethod,
          paymentStatus: finalPaymentStatus,
          receiptImageUrl: receiptImageUrl || null,
          pricePaid,
          customizedImageUrl,
          licenseKey,
          isFeaturedOnPage: true,
        },
      });
    } else {
      savedPoster = await prisma.marketerPoster.create({
        data: {
          marketerId: userId,
          templateId: template.id,
          paymentMethod,
          paymentStatus: finalPaymentStatus,
          receiptImageUrl: receiptImageUrl || null,
          pricePaid,
          customizedImageUrl,
          licenseKey,
          isFeaturedOnPage: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      poster: savedPoster,
      paymentStatus: finalPaymentStatus,
      message:
        finalPaymentStatus === "APPROVED"
          ? "Poster berhasil dilisensikan dan siap digunakan!"
          : "Bukti transfer Anda telah dikirimkan ke Admin / Desainer untuk diverifikasi.",
    });
  } catch (error) {
    console.error("Purchase poster error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
