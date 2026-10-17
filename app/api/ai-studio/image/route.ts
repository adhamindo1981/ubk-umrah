import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { isAiStudioEnabled } from "@/lib/ai-studio/flags";
import { getPublicBaseUrl } from "@/lib/urlUtils";
import { escapeXml } from "@/lib/validations";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DAILY_MAX_QUOTA = 3;

/**
 * Reads local real photography files as base64 Data URLs
 */
function getRealPhotoDataUrl(prompt: string): string {
  try {
    const promptLower = prompt.toLowerCase();
    const imagesDir = path.join(process.cwd(), "public", "images");

    let chosenFile = "hero-composite-panorama.jpg";

    // 1. Flight & Airlines (طيران، طائرة، الخطوط القطرية، مطار)
    if (
      promptLower.includes("pesawat") ||
      promptLower.includes("plane") ||
      promptLower.includes("airplane") ||
      promptLower.includes("flight") ||
      promptLower.includes("qatar") ||
      promptLower.includes("airways") ||
      promptLower.includes("طائرة") ||
      promptLower.includes("طيران") ||
      promptLower.includes("القطرية") ||
      promptLower.includes("مطار") ||
      promptLower.includes("airport") ||
      promptLower.includes("تذاكر سفر") ||
      promptLower.includes("حقائب سفر")
    ) {
      chosenFile = path.join("landmarks", "qatar-airways-plane.jpg");
    }
    // 2. Albaik & Meals / Dining (البيك، وجبة، طعام، مطعم)
    else if (
      promptLower.includes("albaik") ||
      promptLower.includes("al-baik") ||
      promptLower.includes("makan") ||
      promptLower.includes("kuliner") ||
      promptLower.includes("البيك") ||
      promptLower.includes("وجبة") ||
      promptLower.includes("طعام") ||
      promptLower.includes("مطعم")
    ) {
      chosenFile = path.join("landmarks", "albaik-pilgrims.jpg");
    }
    // 3. Indonesian Family & Kaaba Pilgrims (عائلة، أسرة، أطفال، الكعبة)
    else if (
      promptLower.includes("keluarga") ||
      promptLower.includes("family") ||
      promptLower.includes("anak") ||
      promptLower.includes("عائلة") ||
      promptLower.includes("أسرة") ||
      promptLower.includes("أطفال") ||
      promptLower.includes("كعبة") ||
      promptLower.includes("kaaba") ||
      promptLower.includes("ka'bah")
    ) {
      chosenFile = path.join("landmarks", "indonesian-family-kaaba.jpg");
    }
    // 4. Madinah & Nabawi Mosque (المدينة المنورة، المسجد النبوي)
    else if (
      promptLower.includes("madinah") ||
      promptLower.includes("nabawi") ||
      promptLower.includes("المدينة") ||
      promptLower.includes("النبوي") ||
      promptLower.includes("روضة")
    ) {
      chosenFile = path.join("landmarks", "madinah-nabawi.jpg");
    }
    // 5. Haramain High-Speed Train (قطار الحرمين السريع)
    else if (
      promptLower.includes("kereta") ||
      promptLower.includes("train") ||
      promptLower.includes("قطار") ||
      promptLower.includes("سريع") ||
      promptLower.includes("حرمين")
    ) {
      chosenFile = path.join("landmarks", "haramain-train.jpg");
    }
    // 6. Taif Cable Car (الطائف، تلفريك)
    else if (
      promptLower.includes("taif") ||
      promptLower.includes("cable") ||
      promptLower.includes("الطائف") ||
      promptLower.includes("تلفريك")
    ) {
      chosenFile = path.join("landmarks", "taif-cablecar.jpg");
    }
    // 7. Makkah & Clock Tower (مكة المكرمة، برج الساعة)
    else if (
      promptLower.includes("makkah") ||
      promptLower.includes("مكة") ||
      promptLower.includes("حرم") ||
      promptLower.includes("ساعة") ||
      promptLower.includes("clock")
    ) {
      chosenFile = path.join("landmarks", "makkah-clock.jpg");
    }

    const fullPath = path.join(imagesDir, chosenFile);
    if (fs.existsSync(fullPath)) {
      const buffer = fs.readFileSync(fullPath);
      return `data:image/jpeg;base64,${buffer.toString("base64")}`;
    }
  } catch (err) {
    console.error("Error reading local real photo:", err);
  }

  // Fallback to panorama
  try {
    const fallbackPath = path.join(process.cwd(), "public", "images", "hero-composite-panorama.jpg");
    if (fs.existsSync(fallbackPath)) {
      const buffer = fs.readFileSync(fallbackPath);
      return `data:image/jpeg;base64,${buffer.toString("base64")}`;
    }
  } catch (e) {
    console.error("Fallback panorama read error:", e);
  }

  return "";
}

/**
 * Reads the official 3D gold UBK emblem logo as base64 Data URL
 */
function getUbkLogoDataUrl(): string {
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "ubk-gold-logo.png");
    if (fs.existsSync(logoPath)) {
      const buffer = fs.readFileSync(logoPath);
      return `data:image/png;base64,${buffer.toString("base64")}`;
    }
  } catch (err) {
    console.error("Error reading UBK gold logo:", err);
  }
  return "";
}

/**
 * Creates a high-resolution, photorealistic composite poster (1080x1080)
 * embedding the real photograph, marketer's live QR Code, and the official 3D UBK emblem logo.
 */
function createPhotorealisticBrandedPoster(params: {
  realPhotoDataUrl: string;
  qrCodeDataUrl: string;
  ubkLogoDataUrl: string;
  marketerName: string;
  marketerPhone: string;
  referralCode: string;
  prompt: string;
}): { dataUrl: string; svgXml: string } {
  const {
    realPhotoDataUrl,
    qrCodeDataUrl,
    ubkLogoDataUrl,
    marketerName,
    marketerPhone,
    referralCode,
    prompt,
  } = params;

  const cleanPrompt = escapeXml(prompt.slice(0, 90));
  const safeName = escapeXml(marketerName.toUpperCase());
  const safePhone = escapeXml(marketerPhone);
  const safeCode = escapeXml(referralCode || "UBK-OFFICIAL");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 1080" width="1080" height="1080" dir="ltr" style="direction: ltr !important; text-align: left !important; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <defs>
      <linearGradient id="topShadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#021B1A" stop-opacity="0.95" />
        <stop offset="45%" stop-color="#021B1A" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#021B1A" stop-opacity="0" />
      </linearGradient>

      <linearGradient id="bottomShadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0" />
        <stop offset="30%" stop-color="#021815" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#010D0C" stop-opacity="0.98" />
      </linearGradient>

      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE047" />
        <stop offset="50%" stop-color="#F59E0B" />
        <stop offset="100%" stop-color="#D97706" />
      </linearGradient>

      <filter id="softGlow">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="120%">
        <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.5" />
      </filter>
    </defs>

    <!-- 1. Real Photography Background Layer (1080x1080) -->
    <rect width="1080" height="1080" fill="#042F2E" />
    ${
      realPhotoDataUrl
        ? `<image href="${realPhotoDataUrl}" xlink:href="${realPhotoDataUrl}" x="0" y="0" width="1080" height="1080" preserveAspectRatio="xMidYMid slice" />`
        : ""
    }

    <!-- 2. Lighting & Contrast Overlays for Text Legibility -->
    <rect x="0" y="0" width="1080" height="250" fill="url(#topShadow)" />
    <rect x="0" y="520" width="1080" height="560" fill="url(#bottomShadow)" />

    <!-- 3. Top Header: Official UBK Accreditation Badge -->
    <g transform="translate(40, 36)" dir="ltr" style="direction: ltr !important;">
      <rect x="0" y="0" width="1000" height="84" rx="42" fill="#021A16" fill-opacity="0.9" stroke="#F59E0B" stroke-width="2.5" filter="url(#softGlow)" />
      
      <!-- 3D Gold UBK Emblem Logo -->
      ${
        ubkLogoDataUrl
          ? `<image href="${ubkLogoDataUrl}" xlink:href="${ubkLogoDataUrl}" x="16" y="8" width="68" height="68" preserveAspectRatio="xMidYMid meet" filter="url(#softGlow)" />`
          : `<circle cx="44" cy="42" r="26" fill="#065F46" stroke="#FBBF24" stroke-width="1.5" /><text x="44" y="50" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#FDE047" text-anchor="middle" direction="ltr">🕋</text>`
      }

      <text x="96" y="38" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" letter-spacing="1.2" text-anchor="start" direction="ltr">
        PT. UMAR BIN ALKHATTAB FOR UMRAH (UBK)
      </text>
      <text x="96" y="62" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#6EE7B7" text-anchor="start" direction="ltr">
        IZIN RESMI KEMENAG RI NO. U-271 TAHUN 2021 • PPIU TERAKREDITASI
      </text>

      <rect x="790" y="18" width="186" height="48" rx="24" fill="url(#goldGradient)" />
      <text x="883" y="48" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="900" fill="#022C22" text-anchor="middle" letter-spacing="1" direction="ltr">
        PROGRAM 2026
      </text>
    </g>

    <!-- Luxury Floating UBK 3D Watermark Emblem Badge (Top Right Sub-layer) -->
    ${
      ubkLogoDataUrl
        ? `<g transform="translate(940, 140)" opacity="0.9" filter="url(#cardShadow)" dir="ltr">
            <circle cx="45" cy="45" r="42" fill="#021A16" fill-opacity="0.75" stroke="#F59E0B" stroke-width="2" />
            <image href="${ubkLogoDataUrl}" xlink:href="${ubkLogoDataUrl}" x="12" y="10" width="66" height="66" preserveAspectRatio="xMidYMid meet" />
           </g>`
        : ""
    }

    <!-- 4. Campaign Highlight & USPs Banner -->
    <g transform="translate(40, 670)" dir="ltr" style="direction: ltr !important;">
      <rect x="0" y="0" width="1000" height="96" rx="24" fill="#021A16" fill-opacity="0.9" stroke="#10B981" stroke-width="2" />
      
      <text x="32" y="40" font-family="'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="900" fill="#FDE047" text-anchor="start" direction="ltr">
        ✨ ${cleanPrompt || "PAKET RESMI UMRAH 2026 BERKUALITAS &amp; SESUAI SUNNAH"}
      </text>

      <text x="32" y="74" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ECFDF5" text-anchor="start" direction="ltr">
        ✈️ Qatar Airways 5★  •  🏨 Hotel Dekat Tanpa Shuttle Bus  •  💰 Cukup DP 5 Juta  •  🍗 Free Albaik
      </text>
    </g>

    <!-- 5. Marketer Footer Card with Real Scannable Barcode (QR Code) -->
    <g transform="translate(40, 786)" filter="url(#cardShadow)" dir="ltr" style="direction: ltr !important;">
      <!-- Main White Card Container -->
      <rect x="0" y="0" width="1000" height="254" rx="28" fill="#FFFFFF" stroke="#F59E0B" stroke-width="3" />

      <!-- QR Code Container (Left Side) -->
      <rect x="24" y="24" width="206" height="206" rx="20" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" />
      ${
        qrCodeDataUrl
          ? `<image href="${qrCodeDataUrl}" xlink:href="${qrCodeDataUrl}" x="37" y="32" width="180" height="180" />`
          : `<rect x="37" y="32" width="180" height="180" fill="#047857" rx="12" />`
      }
      <rect x="34" y="196" width="186" height="24" rx="8" fill="#065F46" />
      <text x="127" y="213" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#FDE047" text-anchor="middle" direction="ltr">
        SCAN ME • DAFTAR SEKARANG
      </text>

      <!-- Marketer Credentials & Contacts (Middle Section) -->
      <g transform="translate(254, 28)" dir="ltr" style="direction: ltr !important; text-align: left !important;">
        <!-- Badge -->
        <rect x="0" y="0" width="300" height="28" rx="14" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1.5" />
        <text x="150" y="18" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#065F46" text-anchor="middle" direction="ltr">
          KONSULTAN &amp; MITRA PEMASAR RESMI
        </text>

        <!-- Marketer Name -->
        <text x="0" y="58" font-family="'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="900" fill="#0F172A" text-anchor="start" direction="ltr">
          ${safeName}
        </text>

        <!-- WhatsApp & Code -->
        <rect x="0" y="74" width="530" height="34" rx="12" fill="#F0FDF4" stroke="#BBF7D0" stroke-width="1" />
        <text x="16" y="96" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#047857" text-anchor="start" direction="ltr">
          WhatsApp: ${safePhone}   |   Kode Mitra: ${safeCode}
        </text>

        <!-- Guidance -->
        <text x="0" y="132" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#64748B" text-anchor="start" direction="ltr">
          Daftarkan ibadah Umrah Anda melalui konsultasi resmi terverifikasi Kemenag RI.
        </text>

        <text x="0" y="156" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="#047857" text-anchor="start" direction="ltr">
          Scan QR Barcode di samping untuk simulasi tabungan &amp; amankan seat Anda!
        </text>
      </g>

      <!-- Security / Verified Stamp (Right Side with UBK 3D Logo) -->
      <g transform="translate(820, 26)" dir="ltr" style="direction: ltr !important;">
        <rect x="0" y="0" width="156" height="202" rx="22" fill="#F0FDF4" stroke="#86EFAC" stroke-width="2" />
        
        ${
          ubkLogoDataUrl
            ? `<image href="${ubkLogoDataUrl}" xlink:href="${ubkLogoDataUrl}" x="38" y="12" width="80" height="80" preserveAspectRatio="xMidYMid meet" filter="url(#softGlow)" />`
            : `<circle cx="78" cy="48" r="28" fill="#059669" /><text x="78" y="58" font-family="'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="900" fill="#FFFFFF" text-anchor="middle" direction="ltr">✓</text>`
        }

        <text x="78" y="112" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#065F46" text-anchor="middle" direction="ltr">
          TERVERIFIKASI
        </text>
        <text x="78" y="132" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#047857" text-anchor="middle" direction="ltr">
          MITRA RESMI
        </text>
        <text x="78" y="160" font-family="'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="700" fill="#059669" text-anchor="middle" direction="ltr">
          UBK UMRAH 2026
        </text>
      </g>
    </g>
  </svg>`.trim();

  return {
    dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    svgXml: svg,
  };
}

export async function POST(req: NextRequest) {
  try {
    if (!isAiStudioEnabled()) {
      return NextResponse.json(
        { error: "AI Studio saat ini dinonaktifkan via Feature Flag." },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marketerId = String((session.user as any).id);
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const body = await req.json();
    const prompt = (body.prompt || "").trim();

    if (!prompt || prompt.length < 3) {
      return NextResponse.json(
        { error: "Deskripsi gambar (prompt) wajib diisi minimal 3 karakter." },
        { status: 400 }
      );
    }

    const userRole = (session.user as any)?.role || "MARKETER";
    const effectiveMaxQuota = userRole === "ADMIN" ? 100 : DAILY_MAX_QUOTA;

    // 1. QUOTA CHECK: Query current daily usage
    const quotaRecord = await prisma.dailyImageQuota.findUnique({
      where: {
        marketerId_date: {
          marketerId,
          date: todayStr,
        },
      },
    });

    const currentCount = quotaRecord ? quotaRecord.count : 0;

    // 2. DAILY QUOTA EXHAUSTION GUARD
    if (currentCount >= effectiveMaxQuota) {
      return NextResponse.json(
        {
          error:
            "Maaf, batas kuota AI Image gratis Anda hari ini sudah habis. Kuota harian Anda adalah maksimal 3 gambar per hari dan akan direset otomatis pada pukul 00:00 WIB esok hari.",
          exhausted: true,
          usedCount: currentCount,
          maxQuota: effectiveMaxQuota,
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // 3. RETRIEVE MARKETER DETAILS FOR REAL BRANDING & QR CODE
    const user = await prisma.user.findUnique({
      where: { id: Number(marketerId) },
      select: {
        username: true,
        whatsapp: true,
        referralCode: true,
      },
    });

    const marketerName = user?.username || "Konsultan UBK";
    const marketerPhone = user?.whatsapp || "0812-3456-7890";
    const referralCode = user?.referralCode || "UBK-PARTNER";

    // Build real public URL for QR Code
    const reqHost = req.headers.get("host") || "ubk-umrah.com";
    const reqProto = req.headers.get("x-forwarded-proto") || (reqHost.includes("localhost") ? "http" : "https");
    const baseUrl = getPublicBaseUrl(`${reqProto}://${reqHost}`);
    const personalPageUrl = `${baseUrl}/m/${referralCode}`;

    // Generate real scannable QR Code Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(personalPageUrl, {
      width: 250,
      margin: 1,
      color: {
        dark: "#064E3B",
        light: "#FFFFFF",
      },
    });

    // 4. FETCH PHOTOREALISTIC IMAGE
    let realPhotoDataUrl = "";
    let providerUsed = "UBK Photorealistic Engine";

    const hfToken =
      process.env.HUGGINGFACE_API_KEY ||
      process.env.HF_TOKEN ||
      process.env.HUGGING_FACE_HUB_TOKEN ||
      "";

    // Attempt Hugging Face if token provided
    if (hfToken) {
      try {
        const enrichedPrompt = `Authentic ultra-realistic 8K photograph, ${prompt}, real people pilgrims in Makkah/Madinah, emotional, dignified, golden hour, genuine Canon EOS R5 photo, high resolution`;
        const hfRes = await fetch(
          "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${hfToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: enrichedPrompt,
              parameters: { num_inference_steps: 4, guidance_scale: 3.5 },
            }),
          }
        );

        if (hfRes.ok) {
          const buffer = await hfRes.arrayBuffer();
          realPhotoDataUrl = `data:image/jpeg;base64,${Buffer.from(buffer).toString("base64")}`;
          providerUsed = "Hugging Face (FLUX.1-schnell)";
        }
      } catch (err) {
        console.error("HF Inference error, falling back to local photo assets:", err);
      }
    }

    // High quality real photography asset fallback
    if (!realPhotoDataUrl) {
      realPhotoDataUrl = getRealPhotoDataUrl(prompt);
      providerUsed = "UBK Verified HD Photography + Real QR Barcode";
    }

    // 5. COMPOSE COMPOSITE POSTER WITH MARKETER'S REAL QR CODE & BRANDING
    const ubkLogoDataUrl = getUbkLogoDataUrl();
    const posterResult = createPhotorealisticBrandedPoster({
      realPhotoDataUrl,
      qrCodeDataUrl,
      ubkLogoDataUrl,
      marketerName,
      marketerPhone,
      referralCode,
      prompt,
    });

    // 6. ATOMIC QUOTA INCREMENT
    const updatedQuota = await prisma.dailyImageQuota.upsert({
      where: {
        marketerId_date: {
          marketerId,
          date: todayStr,
        },
      },
      update: {
        count: { increment: 1 },
      },
      create: {
        marketerId,
        date: todayStr,
        count: 1,
      },
    });

    const remaining = Math.max(0, effectiveMaxQuota - updatedQuota.count);

    return NextResponse.json({
      success: true,
      imageUrl: posterResult.dataUrl,
      svgXml: posterResult.svgXml,
      provider: providerUsed,
      quota: {
        usedCount: updatedQuota.count,
        maxQuota: effectiveMaxQuota,
        remaining,
        isExhausted: updatedQuota.count >= effectiveMaxQuota,
      },
      message:
        remaining > 0
          ? `Gambar poster promosi berhasil dibuat lengkap dengan Barcode QR Code Anda! Sisa kuota hari ini: ${remaining} gambar.`
          : "Gambar poster promosi berhasil dibuat! Ini adalah gambar gratis terakhir Anda untuk hari ini.",
    });
  } catch (error: any) {
    console.error("AI Studio Image POST Error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pembuatan gambar AI." },
      { status: 500 }
    );
  }
}
