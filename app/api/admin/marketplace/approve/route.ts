import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { generateQRCodeDataUrl } from "@/lib/referral";



export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { posterId } = await req.json();

    const poster = await prisma.marketerPoster.findUnique({
      where: { id: Number(posterId) },
      include: {
        marketer: true,
        template: true,
      },
    });

    if (!poster) {
      return NextResponse.json({ error: "Poster record not found" }, { status: 404 });
    }

    // Generate live QR code for marketer's personal page
    const personalPageUrl = poster.marketer.referralCode
      ? `https://ubk-umrah.vercel.app/m/${poster.marketer.referralCode}`
      : "https://ubk-umrah.vercel.app";
    const qrDataUrl = await generateQRCodeDataUrl(personalPageUrl);

    // Stamp branding
    const cleanSvg = decodeURIComponent(poster.template.cleanImageUrl.replace("data:image/svg+xml;utf8,", ""));
    const brandedSvg = cleanSvg
      .replace("{{MARKETER_NAME}}", poster.marketer.username.toUpperCase())
      .replace("{{MARKETER_WHATSAPP}}", poster.marketer.whatsapp || "Hubungi Admin UBK")
      .replace("{{MARKETER_CODE}}", poster.marketer.referralCode || "UBK-PARTNER")
      .replace("{{MARKETER_QR}}", qrDataUrl)
      .replace("{{LICENSE_KEY}}", poster.licenseKey);

    const customizedImageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(brandedSvg)}`;

    const updated = await prisma.marketerPoster.update({
      where: { id: poster.id },
      data: {
        paymentStatus: "APPROVED",
        customizedImageUrl,
      },
    });

    return NextResponse.json({ success: true, poster: updated });
  } catch (error) {
    console.error("Approve poster error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
