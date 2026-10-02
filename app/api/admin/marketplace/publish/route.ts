import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { normalizeImageUrl } from "@/lib/imageUtils";
import fs from "fs";
import path from "path";

/**
 * Generate SVG with Watermark for previewing
 */
function createWatermarkedSvgWrapper(imageUrl: string, title: string, category: string): { cleanSvg: string; previewSvg: string } {
  // Determine aspect ratio dimensions based on category
  let width = 1080;
  let height = 1080;
  let imgHeight = 940;
  let slotY = 940;
  let slotHeight = 140;

  if (category === "INSTAGRAM_STORY") {
    width = 1080;
    height = 1920;
    imgHeight = 1740;
    slotY = 1740;
    slotHeight = 180;
  } else if (category === "BANNER") {
    width = 1920;
    height = 1080;
    imgHeight = 930;
    slotY = 930;
    slotHeight = 150;
  }

  const watermarkOverlay = `
    <g transform="rotate(-32 ${width / 2} ${height / 2})" opacity="0.32">
      <rect x="-300" y="${height / 2 - 60}" width="${width + 600}" height="120" fill="rgba(220, 38, 38, 0.3)" rx="20"/>
      <text x="${width / 2}" y="${height / 2 + 15}" font-family="Arial, sans-serif" font-size="40" font-weight="900" fill="#dc2626" text-anchor="middle" letter-spacing="4">
        UBK UMRAH • PRATINJAU DESAIN RESMI • HAK CIPTA DILINDUNGI
      </text>
    </g>
  `;

  const brandingSlot = `
    <g id="marketer-branding-slot">
      <!-- Dark Emerald & Gold Luxury Footer Strip -->
      <rect x="0" y="${slotY}" width="${width}" height="${slotHeight}" fill="#022c22" stroke="#d97706" stroke-width="3"/>
      
      <!-- Marketer QR Code Slot (Dynamic) -->
      <g transform="translate(30, ${slotY + 15})">
        <rect width="${slotHeight - 30}" height="${slotHeight - 30}" rx="12" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
        <image id="branding-qr" href="{{MARKETER_QR}}" x="4" y="4" width="${slotHeight - 38}" height="${slotHeight - 38}" preserveAspectRatio="xMidYMid meet"/>
      </g>

      <!-- Marketer Profile Info -->
      <g transform="translate(${slotHeight + 25}, ${slotY + 35})">
        <text font-family="'Cairo', sans-serif" font-size="14" font-weight="800" fill="#fbbf24" letter-spacing="1">
          KONSULTAN RESMI BERLISENSI / المسوق المعتمد:
        </text>
        <text id="branding-name" y="32" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="900" fill="#ffffff">
          {{MARKETER_NAME}}
        </text>
        <text id="branding-wa" y="62" font-family="monospace" font-size="16" font-weight="700" fill="#34d399">
          📲 WhatsApp: {{MARKETER_WHATSAPP}} | Kode: {{MARKETER_CODE}}
        </text>
      </g>

      <!-- Security Digital License Badge -->
      <g transform="translate(${width - 270}, ${slotY + 22})">
        <rect width="245" height="${slotHeight - 44}" rx="16" fill="rgba(15, 23, 42, 0.85)" stroke="#fbbf24" stroke-width="1.5"/>
        <text x="122" y="24" font-family="sans-serif" font-size="11" font-weight="800" fill="#94a3b8" text-anchor="middle">
          LISENSI RESMI UBK UMRAH
        </text>
        <text id="branding-lic" x="122" y="48" font-family="monospace" font-size="12" font-weight="900" fill="#fef08a" text-anchor="middle">
          {{LICENSE_KEY}}
        </text>
        <text x="122" y="70" font-family="sans-serif" font-size="9" font-weight="700" fill="#34d399" text-anchor="middle">
          PPIU Kemenag No. U-271/2021
        </text>
      </g>
    </g>
  `;

  const cleanSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <!-- Designer's Master Artwork -->
      <image href="${imageUrl}" x="0" y="0" width="${width}" height="${imgHeight}" preserveAspectRatio="xMidYMid slice" />
      ${brandingSlot}
    </svg>
  `.trim();

  const previewSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <!-- Designer's Master Artwork -->
      <image href="${imageUrl}" x="0" y="0" width="${width}" height="${imgHeight}" preserveAspectRatio="xMidYMid slice" />
      ${brandingSlot}
      ${watermarkOverlay}
    </svg>
  `.trim();

  return { cleanSvg, previewSvg };
}

function generateStudioTemplateSvg(title: string, subtitle: string, price: string, bgStart: string, bgEnd: string, isWatermarked = false) {
  const watermarkOverlay = isWatermarked
    ? `
    <g transform="rotate(-35 540 540)" opacity="0.38">
      <rect x="-200" y="480" width="1500" height="120" fill="rgba(239, 68, 68, 0.25)" rx="20"/>
      <text x="540" y="555" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="#dc2626" text-anchor="middle" letter-spacing="4">
        UBK PREVIEW • DILARANG MENYALIN • HAK CIPTA DILINDUNGI
      </text>
    </g>
  `
    : "";

  return `
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 1080" width="1080" height="1080">
    <defs>
      <linearGradient id="bg_dyn" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgStart}"/>
        <stop offset="100%" stop-color="${bgEnd}"/>
      </linearGradient>
      <linearGradient id="gold_dyn" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b"/>
        <stop offset="50%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
    </defs>
    <rect width="1080" height="1080" fill="url(#bg_dyn)"/>
    <circle cx="540" cy="-200" r="540" fill="none" stroke="rgba(251, 191, 36, 0.2)" stroke-width="3"/>
    <rect x="340" y="70" width="400" height="48" rx="24" fill="rgba(255,255,255,0.08)" stroke="rgba(251, 191, 36, 0.4)" stroke-width="1.5"/>
    <text x="540" y="102" font-family="sans-serif" font-size="16" font-weight="800" fill="#fef08a" text-anchor="middle" letter-spacing="3">
      UMAR BIN AL-KHATTAB FOR UMRAH (UBK)
    </text>
    <text x="540" y="220" font-family="sans-serif" font-size="36" font-weight="900" fill="#ffffff" text-anchor="middle">
      ${title}
    </text>
    <text x="540" y="270" font-family="sans-serif" font-size="20" font-weight="600" fill="#a7f3d0" text-anchor="middle">
      ${subtitle}
    </text>
    <g transform="translate(440, 320)">
      <rect x="0" y="0" width="200" height="200" rx="24" fill="#09090b" stroke="url(#gold_dyn)" stroke-width="4"/>
      <rect x="0" y="40" width="200" height="18" fill="url(#gold_dyn)"/>
      <polygon points="100,85 120,135 80,135" fill="url(#gold_dyn)"/>
      <circle cx="100" cy="155" r="8" fill="url(#gold_dyn)"/>
    </g>
    <rect x="290" y="560" width="500" height="90" rx="45" fill="rgba(0,0,0,0.4)" stroke="url(#gold_dyn)" stroke-width="2.5"/>
    <text x="540" y="600" font-family="sans-serif" font-size="16" font-weight="700" fill="#cbd5e1" text-anchor="middle">
      HARGA MULAI DARI
    </text>
    <text x="540" y="635" font-family="sans-serif" font-size="32" font-weight="900" fill="#fbbf24" text-anchor="middle">
      ${price}
    </text>
    <g transform="translate(180, 690)">
      <rect x="0" y="0" width="720" height="180" rx="24" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
      <text x="50" y="50" font-family="sans-serif" font-size="19" font-weight="700" fill="#ffffff">✈️ Penerbangan PP Direct Tanpa Transit</text>
      <text x="50" y="90" font-family="sans-serif" font-size="19" font-weight="700" fill="#ffffff">🏨 Hotel Pilihan Dekat Masjid</text>
      <text x="50" y="130" font-family="sans-serif" font-size="19" font-weight="700" fill="#ffffff">🕋 Muthawif Berpengalaman Sesuai Sunnah</text>
      <text x="50" y="165" font-family="sans-serif" font-size="19" font-weight="700" fill="#ffffff">🛡️ Visa Umrah Resmi & Asuransi Perjalanan</text>
    </g>
    <g id="marketer-branding-slot">
      <rect x="40" y="900" width="1000" height="140" rx="28" fill="#ffffff" stroke="url(#gold_dyn)" stroke-width="3"/>
      
      <!-- Marketer QR Code Slot -->
      <g transform="translate(60, 915)">
        <rect width="110" height="110" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
        <image id="branding-qr" href="{{MARKETER_QR}}" x="5" y="5" width="100" height="100" preserveAspectRatio="xMidYMid meet"/>
      </g>

      <text x="190" y="948" font-family="sans-serif" font-size="15" font-weight="800" fill="#047857" letter-spacing="1">
        KONSULTASI RESMI BERSAMA MITRA:
      </text>
      <text id="branding-name" x="190" y="980" font-family="sans-serif" font-size="26" font-weight="900" fill="#0f172a">
        {{MARKETER_NAME}}
      </text>
      <text id="branding-wa" x="190" y="1012" font-family="monospace" font-size="18" font-weight="700" fill="#15803d">
        📲 WhatsApp: {{MARKETER_WHATSAPP}} | Kode: {{MARKETER_CODE}}
      </text>
      <rect x="790" y="920" width="225" height="100" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="902" y="955" font-family="sans-serif" font-size="12" font-weight="800" fill="#64748b" text-anchor="middle">
        LISENSI DIGITAL RESMI
      </text>
      <text id="branding-lic" x="902" y="982" font-family="monospace" font-size="13" font-weight="800" fill="#047857" text-anchor="middle">
        {{LICENSE_KEY}}
      </text>
      <text x="902" y="1005" font-family="sans-serif" font-size="10" font-weight="600" fill="#94a3b8" text-anchor="middle">
        PT. UMAR BIN ALKHATTAB FOR UMRAH
      </text>
    </g>
    ${watermarkOverlay}
  </svg>
  `.trim();
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Hanya Admin / Desainer yang berhak menerbitkan poster." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      title,
      subtitle,
      packagePrice,
      posterPrice,
      description,
      category,
      bgStart,
      bgEnd,
      imageBase64,
      uploadedImageUrl,
    } = body;

    if (!title || posterPrice === undefined || posterPrice === null) {
      return NextResponse.json({ error: "Judul dan harga poster wajib diisi" }, { status: 400 });
    }

    let finalImageUrl = normalizeImageUrl(uploadedImageUrl) || "";

    // If an image file was uploaded as base64, save to public/uploads/posters/
    if (imageBase64 && imageBase64.startsWith("data:image")) {
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1].split("/")[1] || "jpg";
        const buffer = Buffer.from(matches[2], "base64");
        const filename = `poster-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads", "posters");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer);
        finalImageUrl = `/uploads/posters/${filename}`;
      }
    }

    let cleanImageUrl = "";
    let previewImageUrl = "";

    // CASE A: Designer uploaded their own custom image (Photoshop / Canva / Figma)
    if (finalImageUrl) {
      const { cleanSvg, previewSvg } = createWatermarkedSvgWrapper(
        finalImageUrl,
        title,
        category || "INSTAGRAM_FEED"
      );
      cleanImageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;
      previewImageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(previewSvg)}`;
    } else {
      // CASE B: Studio automatic generated SVG template
      const cleanSvg = generateStudioTemplateSvg(
        title,
        subtitle || "Program Ibadah Khusyuk UBK Umrah",
        packagePrice || "Rp 29.900.000",
        bgStart || "#064e3b",
        bgEnd || "#022c22",
        false
      );

      const previewSvg = generateStudioTemplateSvg(
        title,
        subtitle || "Program Ibadah Khusyuk UBK Umrah",
        packagePrice || "Rp 29.900.000",
        bgStart || "#064e3b",
        bgEnd || "#022c22",
        true
      );

      cleanImageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;
      previewImageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(previewSvg)}`;
    }

    const newTemplate = await prisma.posterTemplate.create({
      data: {
        title,
        description: description || "Desain materi promosi resmi PT. Umar Bin Alkhattab for Umrah (UBK).",
        price: Number(posterPrice),
        category: category || "INSTAGRAM_FEED",
        previewImageUrl,
        cleanImageUrl,
      },
    });

    return NextResponse.json({ success: true, template: newTemplate });
  } catch (error) {
    console.error("Publish template error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
