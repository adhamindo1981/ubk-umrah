import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publicTabunganLeadSchema } from "@/lib/validations/sales-engine";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // 1. IP-based rate limiting for public endpoints (max 10 submissions per 5 minutes)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (isRateLimited(`tabungan-public:${ip}`, 10, 300)) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak permintaan simulasi. Silakan tunggu beberapa menit / يرجى الانتظار قليلاً قبل المحاولة مجدداً.",
        },
        { status: 429 }
      );
    }

    // 2. Parse & Validate body with Zod v4
    const body = await req.json();
    const parseResult = publicTabunganLeadSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMsg =
        parseResult.error.issues[0]?.message || "Data formulir tidak valid";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const {
      marketerCode,
      clientName,
      whatsappNumber,
      packageChoice,
      jamaahCount,
      installmentMonths,
      totalPrice,
      dpAmount,
      monthlyInstallment,
    } = parseResult.data;

    // 3. Find target marketer
    const marketer = await prisma.user.findUnique({
      where: { referralCode: marketerCode },
      select: {
        id: true,
        username: true,
        whatsapp: true,
        referralCode: true,
        isApproved: true,
      },
    });

    if (!marketer || !marketer.isApproved) {
      return NextResponse.json(
        { error: "Mitra pemasar tidak ditemukan atau belum aktif." },
        { status: 404 }
      );
    }

    // 4. Upsert or create MarketerLead record
    const leadNotes = `Simulasi Tabungan Umrah: ${jamaahCount} Jamaah | Angsuran ${installmentMonths} Bulan | Estimasi/Bulan: Rp ${monthlyInstallment.toLocaleString(
      "id-ID"
    )} | Total: Rp ${totalPrice.toLocaleString("id-ID")}`;

    const lead = await prisma.marketerLead.create({
      data: {
        marketerId: marketer.id,
        clientName,
        whatsappNumber,
        source: "TABUNGAN_CALCULATOR",
        status: "NEW",
        packageInterest: packageChoice,
        dpAmount,
        monthlyPlan: monthlyInstallment,
        notes: leadNotes,
      },
    });

    // 5. Update marketer's daily mission contacts count if mission exists today
    const today = new Date().toISOString().split("T")[0];
    try {
      await prisma.dailyMission.upsert({
        where: {
          marketerId_missionDate: {
            marketerId: marketer.id,
            missionDate: today,
          },
        },
        create: {
          marketerId: marketer.id,
          missionDate: today,
          contactsAddedCount: 1,
        },
        update: {
          contactsAddedCount: { increment: 1 },
        },
      });
    } catch (e) {
      console.warn("Failed to update daily mission on public lead capture:", e);
    }

    // 6. Build pre-filled WhatsApp text for the marketer
    const rawMarketerPhone = marketer.whatsapp || "6281234567890";
    const cleanMarketerPhone = rawMarketerPhone.replace(/\D/g, "");
    const finalMarketerWa = cleanMarketerPhone.startsWith("0")
      ? "62" + cleanMarketerPhone.substring(1)
      : cleanMarketerPhone;

    const waPitchMessage = encodeURIComponent(
      `Assalamu'alaikum Bapak/Ibu ${marketer.username},\n\nSaya *${clientName}*, telah melakukan *Simulasi Tabungan Umrah UBK* melalui halaman kemitraan resmi Anda:\n\n` +
        `🕋 *Pilihan Program:* ${packageChoice}\n` +
        `👥 *Jumlah Jamaah:* ${jamaahCount} Orang\n` +
        `🔒 *Cukup DP:* Rp ${dpAmount.toLocaleString("id-ID")} (Kunci Seat)\n` +
        `📅 *Rencana Angsuran:* ${installmentMonths} Bulan\n` +
        `💰 *Estimasi Tabungan/Bulan:* Rp ${monthlyInstallment.toLocaleString(
          "id-ID"
        )}\n` +
        `✨ *Total Nilai Paket:* Rp ${totalPrice.toLocaleString("id-ID")}\n\n` +
        `Mohon dibantu informasi resmi pendaftaran, jadwal keberangkatan, dan jadwal angsuran lengkapnya. Terima kasih banyak!\n\n` +
        `—\n` +
        `_Simulasi Mandiri via UBK Umrah (Izin PPIU No. U-271 Tahun 2021)_`
    );

    const waUrl = `https://wa.me/${finalMarketerWa}?text=${waPitchMessage}`;

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      waUrl,
      marketerName: marketer.username,
      summary: {
        packageChoice,
        jamaahCount,
        installmentMonths,
        dpAmount,
        monthlyInstallment,
        totalPrice,
      },
    });
  } catch (error) {
    console.error("Public Tabungan Lead API Error:", error);
    return NextResponse.json(
      { error: "Terjadi kendala pada server saat memproses simulasi tabungan." },
      { status: 500 }
    );
  }
}
