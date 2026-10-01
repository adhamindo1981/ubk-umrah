import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendMail } from "@/lib/email";

const prisma = new PrismaClient();

/**
 * Handle new Umrah booking registrations.
 * Request JSON: { name, email, phone?, referralCode?, package? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, referralCode, package: selectedPackage } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nama dan email wajib diisi / الاسم والبريد الإلكتروني مطلوبان" },
        { status: 400 }
      );
    }

    // 1. Create or find Client
    let client = await prisma.client.findUnique({
      where: { email },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name,
          email,
          phone: phone ? phone.trim() : null,
        },
      });
    } else if (phone && !client.phone) {
      // Update phone if not set
      client = await prisma.client.update({
        where: { id: client.id },
        data: { phone: phone.trim() },
      });
    }

    // 2. Check if a valid marketer referral code was provided
    let marketerId: number | null = null;
    let marketer = null;
    if (referralCode && referralCode.trim() !== "") {
      marketer = await prisma.user.findUnique({
        where: { referralCode: referralCode.trim() },
      });
      if (marketer) {
        marketerId = marketer.id;
      }
    }

    // 3. Create Order
    const order = await prisma.order.create({
      data: {
        clientId: client.id,
        marketerId: marketerId,
        referralCode: referralCode ? referralCode.trim() : null,
        status: "PENDING",
        rewardAwarded: false,
      },
    });

    // 4. Send email notification in Indonesian
    try {
      await sendMail({
        to: email,
        subject: `PT. UBK Umrah - Registrasi Pendaftaran Berhasil (#${order.id})`,
        html: `
          <div dir="ltr" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #047857;">Assalamu'alaikum Warahmatullahi Wabarakatuh, ${name}</h2>
            <p>Terima kasih telah mendaftar layanan Umrah bersama <strong>PT. Umar Bin Alkhattab for Umrah (UBK)</strong>.</p>
            <p>Nomor Registrasi Anda: <strong>#${order.id}</strong></p>
            ${selectedPackage ? `<p>Pilihan Paket: <strong>${selectedPackage}</strong></p>` : ""}
            ${marketer ? `<p>Konsultan Pendamping: <strong>${marketer.username}</strong></p>` : ""}
            <p>Tim konsultan kami akan segera menghubungi Anda melalui WhatsApp untuk konsultasi dan detail jadwal.</p>
            <br />
            <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh,</p>
            <p><em>Manajemen UBK for Umrah</em></p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn("Email notification skipped/failed:", emailErr);
    }

    return NextResponse.json(
      { success: true, orderId: order.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pesanan" },
      { status: 500 }
    );
  }
}
