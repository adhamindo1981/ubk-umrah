import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { isAiStudioEnabled } from "@/lib/ai-studio/flags";

export const dynamic = "force-dynamic";

/**
 * Smart template-based AI fallback generator for UBK Umrah copy
 */
function generateFallbackUmrahCopy(params: {
  prompt: string;
  format: string;
  tone: string;
  targetAudience: string;
  revisionInstructions?: string;
  previousContent?: string;
  marketerName?: string;
  referralCode?: string;
}): string {
  const {
    prompt,
    format,
    tone,
    targetAudience,
    revisionInstructions,
    previousContent,
    marketerName = "Konsultan Resmi",
    referralCode = "",
  } = params;

  if (previousContent && revisionInstructions) {
    return (
      `${previousContent}\n\n` +
      `---\n` +
      `✨ *[Revisi AI Berdasarkan: "${revisionInstructions}"]*\n\n` +
      `Tambahan Penting: Layanan eksklusif UBK Umrah menjamin Hotel Dekat Masjidil Haram & Nabawi (*Jalan Kaki Santai Tanpa Antre Shuttle Bus*), serta penerbangan bintang lima terbaik *Qatar Airways*. Hubungi kami hari ini untuk konsultasi langsung!`
    );
  }

  if (format === "WHATSAPP") {
    return (
      `Assalamu'alaikum Warahmatullahi Wabarakatuh Bapak/Ibu,\n\n` +
      `Semoga senantiasa dalam limpahan nikmat sehat dan keberkahan dari Allah Ta'ala. Izin bersilaturahmi, saya ${marketerName} dari *PT. Umar Bin Alkhattab for Umrah (UBK)* - PPIU No. U-271 Tahun 2021.\n\n` +
      `Mengenai niat suci ibadah Umrah keluarga Anda (${prompt || "Musim Umrah 2026"}), kami ingin berbagi kabar gembira mengenai program unggulan kami:\n\n` +
      `✈️ *Penerbangan Bintang 5:* Menggunakan maskapai terbaik dunia *Qatar Airways*\n` +
      `🏨 *Hotel Jalan Kaki Santai:* Bebas lelah, *Tanpa Antre Shuttle Bus*\n` +
      `💰 *Cukup DP Rp 5.000.000:* Langsung amankan kuota seat Anda hari ini\n` +
      `🍗 *Bonus Spesial:* Gratis hidangan khas Saudi (*Free Albaik*) di Tanah Suci\n\n` +
      `Untuk bimbingan simulasi tabungan dan pendaftaran langsung, Bapak/Ibu dapat membalas pesan ini atau membuka tautan resmi saya:\n` +
      `https://ubk-umrah.com/m/${referralCode || "resmi"}\n\n` +
      `Apakah ada waktu sebentar jika kami bantu cek ketersediaan seat terbaiknya? Terima kasih. 🙏`
    );
  }

  if (format === "INSTAGRAM") {
    return (
      `Rindu Menatap Ka'bah Tanpa Khawatir Lelah Fisik? 🕋✨\n\n` +
      `Bagi kita yang ingin beribadah khusyuk bersama keluarga dan orang tua tercinta, jarak hotel adalah penentu kenyamanan.\n\n` +
      `Di UBK Umrah, kami memastikan:\n` +
      `✔️ Hotel Dekat Masjid (Tinggal jalan kaki santai, *TANPA SHUTTLE BUS*)\n` +
      `✔️ Maskapai Bintang 5 *Qatar Airways*\n` +
      `✔️ Kemudahan pendaftaran cukup *DP 5 JUTA*\n` +
      `✔️ Menu nikmat legendaris *FREE ALBAIK*\n\n` +
      `Kini impian ke Tanah Suci bukan lagi sekadar angan. Mulai langkah pertama Anda hari ini!\n\n` +
      `📲 Klik link di bio untuk konsultasi & simulasi tabungan resmi bersama kami.\n\n` +
      `#Umrah2026 #UBKUmrah #UmrahRamahLansia #UmrahKeluarga #TanpaShuttleBus #QatarAirways #TabunganUmrah`
    );
  }

  // Default General / TikTok / Story Script
  return (
    `[HOOK 3 DETIK PERTAMA]: "Jangan booking Umrah dulu sebelum tahu rahasia ini!"\n\n` +
    `Tahukah Anda hal yang paling sering dikeluhkan jamaah di Tanah Suci? Antre bus shuttle berjam-jam saat waktu salat tiba!\n\n` +
    `Makanya di UBK Umrah, semua program kami mengutamakan *Hotel Dekat Masjid Tanpa Shuttle Bus*. Keluar hotel, tinggal jalan kaki santai langsung sampai pelataran Masjidil Haram & Nabawi.\n\n` +
    `Plus, penerbangannya pakai *Qatar Airways* dan cukup *DP 5 Juta* untuk amankan seat Anda!\n\n` +
    `[CALL TO ACTION]: Klik tombol pesan sekarang sebelum kuota promo 2026 habis terisi!`
  );
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

    const body = await req.json();
    const {
      prompt,
      format = "WHATSAPP",
      tone = "ISLAMI_SANTUN",
      targetAudience = "KELUARGA",
      revisionInstructions,
      previousContent,
      outputLanguage = "id", // "id" | "ar"
    } = body;

    if (!prompt && !revisionInstructions) {
      return NextResponse.json(
        { error: outputLanguage === "ar" ? "يرجى كتابة موضوع أو فكرة المحتوى." : "Topik atau instruksi copywriting wajib diisi." },
        { status: 400 }
      );
    }

    const marketerName = (session.user as any).name || (session.user as any).username || "Konsultan UBK";
    const referralCode = (session.user as any).referralCode || "";

    const groqApiKey = process.env.GROQ_API_KEY || "";
    let finalCopy = "";
    let providerUsed = "UBK AI Studio Engine";

    if (groqApiKey) {
      try {
        const isArabicOutput = outputLanguage === "ar";
        const systemPrompt = isArabicOutput
          ? `أنت خبير تسويق وكاتب محتوى إعلاني محترف (Master Copywriter) متخصص في حملات برامج العمرة المعتمدة لدى "شركة عمر بن الخطاب للعمرة - UBK Umrah" (ترخيص وزارة الشؤون الدينية الإندونيسية PPIU رقم U-271).
مهمتك كتابة نصوص إعلانية وتسويقية راقية باللغة العربية الفصحى، مؤثرة وعالية الإقناع والتحويل (High-Converting Copy).

المزايا التنافسية الرئيسية الواجب تضمينها بأسلوب طبيعي جذاب:
1. دفعة أولى ميسرة فقط (DP 5 Juta / ما يعادل 5 ملايين روبية لتأكيد حجز المقعد فوراً).
2. فنادق قريبة جداً من ساحات الحرم المكي والمسجد النبوي (سيراً على الأقدام بدون الحاجة لباصات التردد Shuttle Bus).
3. خطوط طيران عالمية 5 نجوم (الخطوط الجوية القطرية - Qatar Airways).
4. وجبة البيك الشهيرة مجاناً كضيافة خاصة للمعتمرين في مكة المكرمة.

بيانات المستشار/المسوق:
- اسم المستشار: ${marketerName}
- رابط الصفحة المعتمدة: https://ubk-umrah.com/m/${referralCode || "resmi"}

اكتب باللغة العربية الفصحى البليغة والواضحة مع تنسيق احترافي واستخدام متوازن للرموز التعبيرية وخاتمة تحث على المبادرة بالحجز.`
          : `Anda adalah Master Copywriter & Sales Funnel Strategist profesional khusus Biro Perjalanan Umrah resmi "UBK Umrah" (PT. Umar Bin Alkhattab for Umrah, Izin Kemenag PPIU No. U-271).
Tugas Anda adalah menulis materi copywriting bahasa Indonesia yang sangat persuasif, santun, berkelas, menyentuh hati (emotional resonance), dan menghasilkan konversi tinggi (High-Converting Copy).

PANDUAN NILAI JUAL UTAMA (USPs WAJIB MUNCUL SECARA NATURAL):
1. DP Cukup Rp 5.000.000 (Langsung amankan kuota seat tanpa ribet).
2. Hotel Dekat Masjidil Haram & Nabawi (Jalan Kaki Santai, TANPA PERLU ANTISIPASI / ANTISIPASI SHUTTLE BUS).
3. Penerbangan Kelas Dunia Maskapai Bintang 5: Qatar Airways.
4. Bonus Khas Kuliner Saudi: Free Hidangan Legendaris Albaik di Tanah Suci.

DATA KONSULTAN:
- Nama Konsultan: ${marketerName}
- Tautan Pendaftaran / Portal: https://ubk-umrah.com/m/${referralCode || "resmi"}

Gunakan Bahasa Indonesia yang elegan, tata bahasa yang rapi, penggunaan emoji yang proporsional, dan akhiri dengan Call to Action (CTA) yang jelas.`;

        let userPrompt = "";
        if (previousContent && revisionInstructions) {
          userPrompt = isArabicOutput
            ? `إليك المسودة الإعلانية السابقة:\n"""\n${previousContent}\n"""\n\nيرجى إعادة صياغة وتنقيح المسودة السابقة وفق التوجيهات التالية بدقة:\n"${revisionInstructions}"\n\nمع الحفاظ على المزايا التنافسية (DP 5 ملايين، فندق بدون باص، طيران القطرية، وجبة البيك مجاناً).`
            : `Berikut adalah draft copywriting sebelumnya:\n"""\n${previousContent}\n"""\n\nTOLONG REVISI DRAFT DI ATAS DENGAN INSTRUKSI SPESIFIK BERIKUT:\n"${revisionInstructions}"\n\nPastikan tetap mempertahankan keunggulan UBK Umrah (DP 5 Juta, Hotel Tanpa Shuttle, Qatar Airways, Free Albaik).`;
        } else {
          userPrompt = isArabicOutput
            ? `اكتب نصاً إعلانياً بالمواصفات التالية:
- موضوع الإعلان / الفكرة: ${prompt}
- المنصة والتنسيق: ${format} (رسالة واتساب، منشور إنستغرام، سيناريو فيديو تيك توك، بوست فيسبوك)
- نبرة الحديث: ${tone} (إسلامية مهذبة، إقناعية للحجز السريع، تعليمية ملهمة، ودية)
- الجمهور المستهدف: ${targetAudience} (عائلات، كبار سن، شباب وموظفون، مجموعات)`
            : `Tuliskan naskah copywriting dengan spesifikasi:
- Topik / Fokus: ${prompt}
- Format Konten: ${format} (contoh: WhatsApp Closing, Instagram Caption, Script Video TikTok, Facebook Feed)
- Gaya Bahasa / Tone: ${tone} (Islami Santun, Persuasif Halus, Edukatif Inspiratif, Santai Akrab)
- Target Audiens: ${targetAudience} (Keluarga, Jamaah Lansia, Milenial Muda, Komunitas Pengajian)`;
        }

        const groqRes = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${groqApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.7,
              max_tokens: 1200,
            }),
          }
        );

        if (groqRes.ok) {
          const data = await groqRes.json();
          finalCopy = data.choices?.[0]?.message?.content?.trim() || "";
          providerUsed = "Groq (Llama-3.3-70B)";
        } else {
          console.warn("Groq API returned non-200, falling back:", groqRes.status);
        }
      } catch (groqErr) {
        console.error("Groq API error:", groqErr);
      }
    }

    // Fallback if Groq key is not present or API fails
    if (!finalCopy) {
      finalCopy = generateFallbackUmrahCopy({
        prompt,
        format,
        tone,
        targetAudience,
        revisionInstructions,
        previousContent,
        marketerName,
        referralCode,
      });
    }

    return NextResponse.json({
      success: true,
      copywriting: finalCopy,
      provider: providerUsed,
      isRevision: Boolean(previousContent && revisionInstructions),
    });
  } catch (error: any) {
    console.error("AI Studio Copywriting POST Error:", error);
    return NextResponse.json(
      { error: "Gagal memproses copywriting AI." },
      { status: 500 }
    );
  }
}
