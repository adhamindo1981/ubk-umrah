import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { isAiStudioEnabled } from "@/lib/ai-studio/flags";

export const dynamic = "force-dynamic";

const DAILY_MAX_QUOTA = 3;

/**
 * Generates an SVG fallback image if external HF API is unreachable or no API key is provided
 */
function generateFallbackStudioGraphic(prompt: string, title: string): string {
  const cleanPrompt = prompt.slice(0, 70).replace(/[<>&"]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <defs>
      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#021B1A" />
        <stop offset="50%" stop-color="#064E3B" />
        <stop offset="100%" stop-color="#09141B" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE047" />
        <stop offset="50%" stop-color="#F59E0B" />
        <stop offset="100%" stop-color="#D97706" />
      </linearGradient>
      <radialGradient id="glowGrad" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#F59E0B" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
      <filter id="softGlow">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    <rect width="1024" height="1024" fill="url(#skyGrad)" />
    <circle cx="512" cy="420" r="380" fill="url(#glowGrad)" />

    <!-- Islamic Dome & Minaret Silhouette -->
    <path d="M 512 240 C 440 330 390 400 390 520 L 634 520 C 634 400 584 330 512 240 Z" fill="#032D27" opacity="0.9" />
    <circle cx="512" cy="220" r="8" fill="url(#goldGrad)" />
    <!-- Crescent Moon -->
    <path d="M 510 160 A 30 30 0 1 0 540 215 A 25 25 0 1 1 510 160 Z" fill="url(#goldGrad)" filter="url(#softGlow)" />

    <!-- Minaret Left -->
    <rect x="280" y="380" width="36" height="240" fill="#043831" rx="4" />
    <polygon points="298,340 274,380 322,380" fill="url(#goldGrad)" />

    <!-- Minaret Right -->
    <rect x="708" y="380" width="36" height="240" fill="#043831" rx="4" />
    <polygon points="726,340 702,380 750,380" fill="url(#goldGrad)" />

    <!-- Kaaba Center Graphic -->
    <rect x="432" y="470" width="160" height="180" fill="#111827" stroke="#1F2937" stroke-width="4" rx="4" />
    <rect x="432" y="500" width="160" height="18" fill="url(#goldGrad)" filter="url(#softGlow)" />
    <line x1="432" y1="504" x2="592" y2="504" stroke="#FFFBEB" stroke-width="2" stroke-dasharray="4 4" />

    <!-- Subtle Stars -->
    <circle cx="200" cy="180" r="2" fill="#FEF08A" opacity="0.7"/>
    <circle cx="340" cy="120" r="2.5" fill="#FEF08A" opacity="0.9"/>
    <circle cx="780" cy="190" r="2" fill="#FEF08A" opacity="0.6"/>
    <circle cx="860" cy="130" r="3" fill="#FEF08A" opacity="0.8"/>
    <circle cx="680" cy="100" r="1.5" fill="#FEF08A" opacity="0.5"/>

    <!-- Bottom Studio Card -->
    <rect x="80" y="700" width="864" height="240" rx="24" fill="#021815" fill-opacity="0.9" stroke="#059669" stroke-width="2" />
    
    <text x="512" y="755" text-anchor="middle" font-family="system-ui, sans-serif" font-size="28" font-weight="900" fill="url(#goldGrad)" letter-spacing="2">
      UBK UMRAH AI STUDIO
    </text>
    
    <text x="512" y="805" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#ECFDF5">
      ${cleanPrompt || "Desain Promosi Resmi Jamaah Umrah 2026"}
    </text>
    
    <text x="512" y="850" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="500" fill="#6EE7B7">
      DP 5 Juta • Hotel Tanpa Shuttle • Qatar Airways • Free Albaik
    </text>
    
    <rect x="362" y="880" width="300" height="34" rx="17" fill="url(#goldGrad)" />
    <text x="512" y="903" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="800" fill="#064E3B">
      PPIU NO. U-271 TAHUN 2021
    </text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
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
    const stylePreset = body.style || "realistic";

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

    // 3. GENERATE IMAGE VIA HUGGING FACE OR STUDIO GRAPHIC GENERATOR
    const hfToken =
      process.env.HUGGINGFACE_API_KEY ||
      process.env.HF_TOKEN ||
      process.env.HUGGING_FACE_HUB_TOKEN ||
      "";

    let finalImageUrl = "";
    let providerUsed = "UBK AI Studio Engine";

    // Enrich prompt with Islamic & high aesthetic photography descriptors
    const enrichedPrompt = `Stunning professional photo, ${prompt}, ${
      stylePreset === "poster"
        ? "luxurious islamic poster design, gold typography accents, modern elegant umrah travel agency"
        : "hyper-realistic 8k, golden hour, cinematic lighting, peaceful, emotional, dignified, Canon EOS R5 photography"
    }, highly detailed, respectful, Islamic pilgrimage context`;

    if (hfToken) {
      try {
        const modelEndpoint =
          "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";

        const hfRes = await fetch(modelEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: enrichedPrompt,
            parameters: {
              num_inference_steps: 4,
              guidance_scale: 3.5,
            },
          }),
        });

        if (hfRes.ok) {
          const buffer = await hfRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          finalImageUrl = `data:image/jpeg;base64,${base64}`;
          providerUsed = "Hugging Face (FLUX.1-schnell)";
        } else {
          console.warn("Hugging Face API non-200 response:", hfRes.status);
        }
      } catch (hfErr) {
        console.error("Hugging Face API Call failed, falling back:", hfErr);
      }
    }

    // If HF is not configured or rate-limited, provide premium Studio Graphic
    if (!finalImageUrl) {
      finalImageUrl = generateFallbackStudioGraphic(prompt, "UBK UMRAH");
    }

    // 4. ATOMIC QUOTA INCREMENT
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
      imageUrl: finalImageUrl,
      provider: providerUsed,
      quota: {
        usedCount: updatedQuota.count,
        maxQuota: DAILY_MAX_QUOTA,
        remaining,
        isExhausted: updatedQuota.count >= DAILY_MAX_QUOTA,
      },
      message:
        remaining > 0
          ? `Gambar AI berhasil dibuat! Sisa kuota gratis Anda hari ini: ${remaining} gambar.`
          : "Gambar AI berhasil dibuat! Ini adalah gambar gratis terakhir Anda untuk hari ini.",
    });
  } catch (error: any) {
    console.error("AI Studio Image POST Error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pembuatan gambar AI." },
      { status: 500 }
    );
  }
}
