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

    if (
      promptLower.includes("madinah") ||
      promptLower.includes("nabawi") ||
      promptLower.includes("المدينة") ||
      promptLower.includes("النبوي") ||
      promptLower.includes("روضة")
    ) {
      chosenFile = path.join("landmarks", "madinah-nabawi.jpg");
    } else if (
      promptLower.includes("kereta") ||
      promptLower.includes("train") ||
      promptLower.includes("قطار") ||
      promptLower.includes("سفر")
    ) {
      chosenFile = path.join("landmarks", "haramain-train.jpg");
    } else if (
      promptLower.includes("taif") ||
      promptLower.includes("cable") ||
      promptLower.includes("الطائف") ||
      promptLower.includes("تلفريك")
    ) {
      chosenFile = path.join("landmarks", "taif-cablecar.jpg");
    } else if (
      promptLower.includes("makkah") ||
      promptLower.includes("kaaba") ||
      promptLower.includes("ka'bah") ||
      promptLower.includes("مكة") ||
      promptLower.includes("الكعبة") ||
      promptLower.includes("حرم")
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
 * Creates a high-resolution, photorealistic composite poster (1080x1080)
 * embedding the real photograph and the marketer's live scannable QR Code & Contact card.
 */
function createPhotorealisticBrandedPoster(params: {
  realPhotoDataUrl: string;
  qrCodeDataUrl: string;
  marketerName: string;
  marketerPhone: string;
  referralCode: string;
  prompt: string;
}): string {
  const {
    realPhotoDataUrl,
    qrCodeDataUrl,
    marketerName,
    marketerPhone,
    referralCode,
    prompt,
  } = params;

  const cleanPrompt = escapeXml(prompt.slice(0, 90));
  const safeName = escapeXml(marketerName.toUpperCase());
  const safePhone = escapeXml(marketerPhone);
  const safeCode = escapeXml(referralCode || "UBK-OFFICIAL");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
    <defs>
      <linearGradient id="topShadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#021B1A" stop-opacity="0.92" />
        <stop offset="40%" stop-color="#021B1A" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#021B1A" stop-opacity="0" />
      </linearGradient>

      <linearGradient id="bottomShadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0" />
        <stop offset="35%" stop-color="#021815" stop-opacity="0.75" />
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

      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6" />
      </filter>
    </defs>

    <!-- 1. Real Photography Background Layer (1080x1080) -->
    <rect width="1080" height="1080" fill="#042F2E" />
    ${
      realPhotoDataUrl
        ? `<image href="${realPhotoDataUrl}" x="0" y="0" width="1080" height="1080" preserveAspectRatio="xMidYMid slice" />`
        : ""
    }

    <!-- 2. Lighting & Contrast Overlays for Text Legibility -->
    <rect x="0" y="0" width="1080" height="260" fill="url(#topShadow)" />
    <rect x="0" y="520" width="1080" height="560" fill="url(#bottomShadow)" />

    <!-- 3. Top Header: Official UBK Accreditation Badge -->
    <g transform="translate(40, 40)">
      <!-- Glass Pill Badge -->
      <rect x="0" y="0" width="1000" height="74" rx="37" fill="#021A16" fill-opacity="0.82" stroke="#F59E0B" stroke-width="2" filter="url(#softGlow)" />
      
      <circle cx="42" cy="37" r="22" fill="#065F46" stroke="#FBBF24" stroke-width="1.5" />
      <text x="42" y="44" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FDE047" text-anchor="middle">🕋</text>

      <text x="80" y="34" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" letter-spacing="1.5">
        PT. UMAR BIN ALKHATTAB FOR UMRAH (UBK)
      </text>
      <text x="80" y="56" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#6EE7B7">
        IZIN RESMI KEMENAG RI NO. U-271 TAHUN 2021 • PPIU TERAKREDITASI
      </text>

      <rect x="800" y="16" width="176" height="42" rx="21" fill="url(#goldGradient)" />
      <text x="888" y="42" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#022C22" text-anchor="middle" letter-spacing="1">
        PROGRAM 2026
      </text>
    </g>

    <!-- 4. Campaign Highlight & USPs Banner -->
    <g transform="translate(40, 680)">
      <rect x="0" y="0" width="1000" height="88" rx="22" fill="#021A16" fill-opacity="0.88" stroke="#10B981" stroke-width="1.5" />
      
      <text x="30" y="36" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FDE047">
        ✨ ${cleanPrompt || "PAKET RESMI UMRAH 2026 BERKUALITAS & SESUAI SUNNAH"}
      </text>

      <text x="30" y="66" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ECFDF5">
        ✈️ Qatar Airways 5★ • 🏨 Hotel Dekat Tanpa Shuttle Bus • 💰 Cukup DP 5 Juta • 🍗 Free Albaik
      </text>
    </g>

    <!-- 5. Marketer Footer Card with Real Scannable Barcode (QR Code) -->
    <g transform="translate(40, 788)" filter="url(#cardShadow)">
      <!-- Main White Card Container -->
      <rect x="0" y="0" width="1000" height="248" rx="30" fill="#FFFFFF" stroke="#F59E0B" stroke-width="3.5" />

      <!-- QR Code Placement (Real Scannable Barcode) -->
      <rect x="24" y="24" width="200" height="200" rx="20" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" />
      ${
        qrCodeDataUrl
          ? `<image href="${qrCodeDataUrl}" x="34" y="34" width="180" height="180" />`
          : `<rect x="34" y="34" width="180" height="180" fill="#047857" rx="12" />`
      }

      <!-- Marketer Credentials & Contacts -->
      <g transform="translate(250, 48)">
        <text x="0" y="0" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="900" fill="#047857" letter-spacing="1.5">
          KONSULTAN & MITRA PEMASAR RESMI:
        </text>

        <text x="0" y="38" font-family="'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="900" fill="#0F172A">
          ${safeName}
        </text>

        <text x="0" y="74" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#065F46">
          📲 WhatsApp: ${safePhone}  |  Kode Mitra: ${safeCode}
        </text>

        <text x="0" y="102" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#64748B">
          Daftarkan ibadah Umrah Anda melalui tautan resmi terverifikasi di atas.
        </text>

        <text x="0" y="128" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="#047857">
          Scan QR Code di samping untuk simulasi tabungan & amankan seat Anda!
        </text>
      </g>

      <!-- Security / Verified Stamp -->
      <g transform="translate(820, 36)">
        <rect x="0" y="0" width="156" height="176" rx="20" fill="#F0FDF4" stroke="#86EFAC" stroke-width="2" />
        
        <circle cx="78" cy="46" r="26" fill="#059669" />
        <text x="78" y="55" font-family="'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle">✓</text>

        <text x="78" y="98" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#065F46" text-anchor="middle">
          VERIFIKASI
        </text>
        <text x="78" y="116" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#047857" text-anchor="middle">
          MITRA RESMI
        </text>
        <text x="78" y="146" font-family="'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="700" fill="#059669" text-anchor="middle">
          UBK UMRAH
        </text>
      </g>
    </g>
  </svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
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
    if (currentCount >= DAILY_MAX_QUOTA) {
      return NextResponse.json(
        {
          error:
            "Maaf, batas kuota AI Image gratis Anda hari ini sudah habis. Kuota harian Anda adalah maksimal 3 gambar per hari dan akan direset otomatis pada pukul 00:00 WIB esok hari.",
          exhausted: true,
          usedCount: currentCount,
          maxQuota: DAILY_MAX_QUOTA,
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
    const finalPosterUrl = createPhotorealisticBrandedPoster({
      realPhotoDataUrl,
      qrCodeDataUrl,
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

    const remaining = Math.max(0, DAILY_MAX_QUOTA - updatedQuota.count);

    return NextResponse.json({
      success: true,
      imageUrl: finalPosterUrl,
      provider: providerUsed,
      quota: {
        usedCount: updatedQuota.count,
        maxQuota: DAILY_MAX_QUOTA,
        remaining,
        isExhausted: updatedQuota.count >= DAILY_MAX_QUOTA,
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
