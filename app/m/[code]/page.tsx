import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MarketerPageView } from "@/components/MarketerPageView";

interface MarketerPageProps {
  params: {
    code: string;
  };
}

export default async function MarketerPersonalPage({ params }: MarketerPageProps) {
  const { code } = params;

  // Find marketer by referralCode along with their featured posters
  const marketer = await prisma.user.findUnique({
    where: { referralCode: code },
    select: {
      username: true,
      referralCode: true,
      whatsapp: true,
      isApproved: true,
      purchasedPosters: {
        where: { isFeaturedOnPage: true },
        select: {
          id: true,
          customizedImageUrl: true,
          licenseKey: true,
          template: {
            select: {
              title: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!marketer || !marketer.isApproved || !marketer.referralCode) {
    notFound();
  }

  const featuredPosters = marketer.purchasedPosters.map((p) => ({
    id: p.id,
    imageUrl: p.customizedImageUrl || "",
    title: p.template.title,
    description: p.template.description || "",
    licenseKey: p.licenseKey,
  }));

  return (
    <MarketerPageView
      marketer={{
        username: marketer.username,
        referralCode: marketer.referralCode,
        whatsapp: marketer.whatsapp,
        featuredPosters,
      }}
    />
  );
}
