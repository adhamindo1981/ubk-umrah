import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { sendMail } from "@/lib/email";

const prisma = new PrismaClient();

// Total Umrah booking commission paid by UBK: Rp 500,000 (500 Ribu Rupiah)
const TOTAL_COMMISSION_IDR = 500000;

/**
 * PATCH endpoint for Admin to update an Order status.
 * Body: { orderId, status }
 * When status is set to "COMPLETED" (Client payment confirmed):
 * - If marketer is a Sub-Marketer: splits Rp 500.000 between Sub-marketer and Parent Marketer according to parent's setting.
 * - If marketer is direct (Master Marketer): awards full Rp 500.000 to the marketer.
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Tidak diizinkan / غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "ID Pesanan dan Status wajib diisi" },
        { status: 400 }
      );
    }

    // 1. Fetch current order with marketer and marketer's parent
    const existingOrder = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        client: true,
        marketer: {
          include: {
            parent: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    let shouldAwardReward = false;
    if (status === "COMPLETED" && existingOrder.marketerId && !existingOrder.rewardAwarded) {
      shouldAwardReward = true;
    }

    // 2. Update order status in DB
    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        status,
        ...(shouldAwardReward ? { rewardAwarded: true } : {}),
      },
      include: { client: true, marketer: true },
    });

    // 3. Award Commission in Indonesian Rupiah (Rp 500.000)
    if (shouldAwardReward && existingOrder.marketer) {
      const directMarketer = existingOrder.marketer;

      // Case A: Marketer is a Sub-Marketer (has a parent in the tree)
      if (directMarketer.parentId && directMarketer.parent) {
        const parentMarketer = directMarketer.parent;
        // Sub-marketer gets their share (default Rp 350.000 or custom)
        const subShare = Math.min(parentMarketer.subMarketerShare || 350000, TOTAL_COMMISSION_IDR);
        const parentShare = Math.max(TOTAL_COMMISSION_IDR - subShare, 0);

        // 1. Reward for Sub-Marketer
        await prisma.reward.create({
          data: {
            marketerId: directMarketer.id,
            amount: subShare,
            points: Math.round(subShare / 1000), // backward compatibility
            orderId: existingOrder.id,
            description: `Komisi Booking Jamaah #${existingOrder.id} (${existingOrder.client.name})`,
          },
        });

        // 2. Reward for Parent Marketer (Team Commission)
        if (parentShare > 0) {
          await prisma.reward.create({
            data: {
              marketerId: parentMarketer.id,
              amount: parentShare,
              points: Math.round(parentShare / 1000),
              orderId: existingOrder.id,
              description: `Komisi Tim dari Mitra: ${directMarketer.username} (Booking #${existingOrder.id})`,
            },
          });
        }

        // Notify Sub-Marketer via Email
        try {
          if (directMarketer.email) {
            await sendMail({
              to: directMarketer.email,
              subject: `UBK Umrah - Komisi Rp ${subShare.toLocaleString("id-ID")} Telah Ditambahkan!`,
              html: `<div dir="ltr"><p>Selamat <strong>${directMarketer.username}</strong>!</p><p>Booking jamaah Anda (${existingOrder.client.name}) telah dikonfirmasi. Komisi sebesar <strong>Rp ${subShare.toLocaleString("id-ID")}</strong> telah masuk ke saldo dompet UBK Umrah Anda.</p></div>`,
            });
          }
          if (parentMarketer.email) {
            await sendMail({
              to: parentMarketer.email,
              subject: `UBK Umrah - Komisi Tim Rp ${parentShare.toLocaleString("id-ID")} dari ${directMarketer.username}`,
              html: `<div dir="ltr"><p>Selamat <strong>${parentMarketer.username}</strong>!</p><p>Mitra tim Anda <strong>${directMarketer.username}</strong> berhasil menyelesaikan pesanan jamaah. Anda mendapatkan komisi tim sebesar <strong>Rp ${parentShare.toLocaleString("id-ID")}</strong>.</p></div>`,
            });
          }
        } catch (e) {
          console.warn("Commission email notification warning:", e);
        }
      } else {
        // Case B: Master Marketer (direct with company) receives full Rp 500.000
        await prisma.reward.create({
          data: {
            marketerId: directMarketer.id,
            amount: TOTAL_COMMISSION_IDR,
            points: 500,
            orderId: existingOrder.id,
            description: `Komisi Penuh Booking Jamaah #${existingOrder.id} (${existingOrder.client.name})`,
          },
        });

        try {
          if (directMarketer.email) {
            await sendMail({
              to: directMarketer.email,
              subject: `UBK Umrah - Selamat! Komisi Rp 500.000 Telah Masuk`,
              html: `<div dir="ltr"><p>Selamat <strong>${directMarketer.username}</strong>!</p><p>Booking jamaah (${existingOrder.client.name}) telah selesai. Komisi sebesar <strong>Rp 500.000</strong> telah ditambahkan ke akun Anda.</p></div>`,
            });
          }
        } catch (e) {
          console.warn("Commission email notification warning:", e);
        }
      }
    }

    // 4. Notify client of order status update via Email
    try {
      if (updatedOrder.client?.email) {
        const statusTextIndo =
          status === "COMPLETED"
            ? "Lengkap / Dikonfirmasi (Pembayaran Diterima)"
            : status === "IN_PROGRESS"
            ? "Dalam Proses"
            : status === "CANCELED"
            ? "Dibatalkan"
            : "Menunggu";

        await sendMail({
          to: updatedOrder.client.email,
          subject: `UBK Umrah - Status Pesanan #${updatedOrder.id}`,
          html: `<div dir="ltr"><h2>Pembaruan Status Pesanan</h2><p>Halo ${updatedOrder.client.name}, status pesanan Umrah Anda (#${updatedOrder.id}) telah diperbarui menjadi: <strong>${statusTextIndo}</strong>.</p></div>`,
        });
      }
    } catch (emailErr) {
      console.warn("Client status update email warning:", emailErr);
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status pesanan" },
      { status: 500 }
    );
  }
}
