import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageView } from "@/components/AdminPageView";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  // Verify Admin role
  if ((session.user as any).role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            🔒
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Akses Khusus Administrator / وصول خاص بالإدارة
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Anda saat ini masuk sebagai <strong>({session.user.name})</strong> dengan peran Mitra Pemasar. Anda tidak memiliki akses ke panel administrasi.
            <br />
            (أنت مسجل حالياً بحساب مسوّق معتمد، ولا تملك صلاحية الوصول للوحة الإدارة).
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition"
            >
              Menuju Dasbor Mitra / الانتقال للوحة المسوق 🚀
            </Link>
            <Link
              href="/auth/signin?callbackUrl=/admin"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition"
            >
              Masuk sebagai Admin / دخول كمسؤول
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fetch all orders with client and marketer details
  const orders = await prisma.order.findMany({
    include: {
      client: true,
      marketer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch all marketers with their parent and sub-marketers (Tree)
  const marketers = await prisma.user.findMany({
    where: { role: "MARKETER" },
    include: {
      parent: true,
      subMarketers: {
        include: { orders: true },
      },
      orders: {
        include: { client: true },
        orderBy: { createdAt: "desc" },
      },
      rewards: true,
      payoutRequests: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch all payout requests across all marketers
  const payoutRequests = await prisma.payoutRequest.findMany({
    include: {
      marketer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingApprovalsCount = marketers.filter((m) => !m.isApproved).length;
  const pendingPayoutsCount = payoutRequests.filter((p) => p.status === "PENDING").length;

  return (
    <AdminPageView
      orders={orders}
      marketers={marketers}
      payoutRequests={payoutRequests}
      pendingApprovalsCount={pendingApprovalsCount}
      pendingPayoutsCount={pendingPayoutsCount}
    />
  );
}
