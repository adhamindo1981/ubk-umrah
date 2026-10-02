import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MitraLandingView } from "@/components/MitraLandingView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Program Kemitraan & Pemasar Umrah Resmi | UBK Umrah",
  description:
    "Raih penghasilan berkah hingga jutaan rupiah tanpa modal dan tanpa terikat jam kerja bersama UBK Umrah. Dapatkan landing page pribadi dan materi promosi resmi.",
};

interface MitraPageProps {
  searchParams: {
    ref?: string;
  };
}

export default async function MitraPage({ searchParams }: MitraPageProps) {
  const referralCode = searchParams?.ref;
  let marketerName: string | undefined = undefined;
  let marketerPhone: string | undefined = undefined;

  if (referralCode) {
    try {
      const marketer = await prisma.user.findUnique({
        where: { referralCode },
        select: {
          username: true,
          whatsapp: true,
          isApproved: true,
        },
      });

      if (marketer && marketer.isApproved) {
        marketerName = marketer.username;
        marketerPhone = marketer.whatsapp || undefined;
      }
    } catch (err) {
      console.error("Error looking up referral marketer in /mitra:", err);
    }
  }

  return (
    <MitraLandingView
      referralCode={referralCode}
      marketerName={marketerName}
      marketerPhone={marketerPhone}
    />
  );
}
