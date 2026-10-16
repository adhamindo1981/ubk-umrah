import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAiStudioEnabled } from "@/lib/ai-studio/flags";
import { AiStudioView } from "@/components/ai-studio/AiStudioView";
import { AiStudioHeader } from "@/components/ai-studio/AiStudioHeader";
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
      {/* Interactive Bilingual Header with Language Switcher */}
      <AiStudioHeader />

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
