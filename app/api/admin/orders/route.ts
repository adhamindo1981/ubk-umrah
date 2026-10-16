import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { sendMail } from "@/lib/email";



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

    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Tidak diizinkan / غير مصرح لك كمسؤول" }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, status } = body;

    const ALLOWED_ORDER_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELED"];
    if (!orderId || !status || !ALLOWED_ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "ID Pesanan dan Status yang valid wajib diisi (PENDING, IN_PROGRESS, COMPLETED, CANCELED)" },
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
    let shouldRevokeReward = false;

    if (status === "COMPLETED" && existingOrder.marketerId && !existingOrder.rewardAwarded) {
      shouldAwardReward = true;
    } else if (status !== "COMPLETED" && existingOrder.rewardAwarded) {
      // If order was previously completed and now changed to CANCELED/PENDING/IN_PROGRESS, revoke rewards
      shouldRevokeReward = true;
    }

    if (shouldRevokeReward) {
      // Revoke and delete rewards awarded to both direct marketer and parent marketer
      await prisma.reward.deleteMany({
        where: { orderId: existingOrder.id },
      });
    }

    // 2. Update order status in DB
    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        status,
        rewardAwarded: shouldAwardReward ? true : shouldRevokeReward ? false : existingOrder.rewardAwarded,
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

/**
 * DELETE endpoint for Admin to delete a pilgrim booking/order.
 * - Deletes the Order.
 * - Automatically deletes and revokes all Reward records linked to this order
 *   (both for direct marketer and parent/sponsor marketer).
 * - Cleans up the client record if they have no other bookings.
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Tidak diizinkan / غير مصرح لك كمسؤول" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderIdParam = searchParams.get("orderId");

    let orderId: number | null = orderIdParam ? Number(orderIdParam) : null;
    if (!orderId) {
      try {
        const body = await request.json();
        orderId = body.orderId ? Number(body.orderId) : null;
      } catch (_) {}
    }

    if (!orderId || isNaN(orderId)) {
      return NextResponse.json(
        { error: "ID Pesanan tidak valid / معرف الطلب غير صالح" },
        { status: 400 }
      );
    }

    // 1. Fetch existing order with relations
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
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
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan / الحجز غير موجود" },
        { status: 404 }
      );
    }

    // 2. Delete and revoke all Reward records associated with this order
    // This revokes the direct marketer commission and the sponsor/parent marketer's team commission
    const deletedRewards = await prisma.reward.deleteMany({
      where: { orderId: orderId },
    });

    // 3. Delete the Order record
    await prisma.order.delete({
      where: { id: orderId },
    });

    // 4. Clean up client record if no other orders exist for this client
    let clientCleanedUp = false;
    const remainingClientOrders = await prisma.order.count({
      where: { clientId: existingOrder.clientId },
    });

    if (remainingClientOrders === 0) {
      try {
        await prisma.client.delete({
          where: { id: existingOrder.clientId },
        });
        clientCleanedUp = true;
      } catch (clientErr) {
        console.warn("Client cleanup notice:", clientErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Pesanan berhasil dihapus dan seluruh komisi terkait telah dibatalkan",
      deletedOrderId: orderId,
      revokedRewardsCount: deletedRewards.count,
      clientName: existingOrder.client?.name,
      marketerName: existingOrder.marketer?.username || null,
      parentMarketerName: existingOrder.marketer?.parent?.username || null,
      clientCleanedUp,
    });
  } catch (error: any) {
    console.error("Failed to delete order:", error);
    return NextResponse.json(
      { error: "Gagal menghapus pesanan / حدث خطأ أثناء حذف الحجز" },
      { status: 500 }
    );
  }
}

