import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAiStudioEnabled } from "@/lib/ai-studio/flags";
import { AiStudioView } from "@/components/ai-studio/AiStudioView";
import { BackButton } from "@/components/BackButton";
import { UbkLogo } from "@/components/UbkLogo";
import Link from "next/link";
import { getPublicBaseUrl } from "@/lib/urlUtils";
import { headers } from "next/headers";

export default async function DashboardAiStudioPage() {
  if (!isAiStudioEnabled()) {
    redirect("/dashboard");
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/auth/signin?callbackUrl=/dashboard/ai-studio");
  }

  const user = await prisma.user.findUnique({
    where: { id: Number((session.user as any).id) },
    select: {
      id: true,
      username: true,
      role: true,
      referralCode: true,
      whatsapp: true,
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const headersList = headers();
  const rawHost =
    headersList.get("x-forwarded-host") ||
    headersList.get("host") ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "ubk-umrah.vercel.app";
  const proto =
    headersList.get("x-forwarded-proto") ||
    (rawHost.includes("localhost") ? "http" : "https");
  const rawUrl = rawHost.startsWith("http") ? rawHost : `${proto}://${rawHost}`;
  const baseUrl = getPublicBaseUrl(rawUrl);
  const personalPageUrl = user.referralCode ? `${baseUrl}/m/${user.referralCode}` : "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton fallbackUrl="/dashboard" />
            <Link href="/" className="hover:opacity-90 transition">
              <UbkLogo size="sm" showSubtitle={false} />
            </Link>
            <span className="text-xs font-black bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 px-3 py-1 rounded-full shadow-2xs">
              AI Marketing Studio ✨
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
            >
              ← Kembali ke Dasbor
            </Link>
          </div>
        </div>
      </header>

      {/* Main Studio Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AiStudioView
          marketerName={user.username}
          referralCode={user.referralCode || ""}
          personalLandingUrl={personalPageUrl}
        />
      </main>
    </div>
  );
}
