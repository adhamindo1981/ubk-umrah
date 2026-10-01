import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";



function generateCustomTemplateSvg(title: string, subtitle: string, price: string, bgStart: string, bgEnd: string, isWatermarked = false) {
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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
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
      <circle cx="110" cy="970" r="42" fill="#047857"/>
      <text x="110" y="982" font-family="sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">🕋</text>
      <text x="180" y="948" font-family="sans-serif" font-size="15" font-weight="800" fill="#047857" letter-spacing="1">
        KONSULTASI RESMI BERSAMA MITRA:
      </text>
      <text id="branding-name" x="180" y="980" font-family="sans-serif" font-size="26" font-weight="900" fill="#0f172a">
        {{MARKETER_NAME}}
      </text>
      <text id="branding-wa" x="180" y="1012" font-family="monospace" font-size="18" font-weight="700" fill="#15803d">
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
    const { title, subtitle, packagePrice, posterPrice, description, category, bgStart, bgEnd } = await req.json();

    if (!title || !posterPrice) {
      return NextResponse.json({ error: "Judul dan harga poster wajib diisi" }, { status: 400 });
    }

    const cleanSvg = generateCustomTemplateSvg(
      title,
      subtitle || "Program Ibadah Khusyuk UBK Umrah",
      packagePrice || "Rp 29.900.000",
      bgStart || "#064e3b",
      bgEnd || "#022c22",
      false
    );

    const previewSvg = generateCustomTemplateSvg(
      title,
      subtitle || "Program Ibadah Khusyuk UBK Umrah",
      packagePrice || "Rp 29.900.000",
      bgStart || "#064e3b",
      bgEnd || "#022c22",
      true
    );

    const cleanImageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;
    const previewImageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(previewSvg)}`;

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
