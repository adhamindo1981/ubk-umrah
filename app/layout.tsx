import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#022c22" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export const metadata: Metadata = {
  title: "UBK for Umrah | عمر بن الخطاب للعمرة",
  description: "خدمات العمرة المتميزة وتطبيقات ومسوقي رحلات العمرة المعتمدة",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UBK Umrah",
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="h-full scroll-smooth">
      <body className="bg-slate-950 min-h-screen text-slate-100 antialiased selection:bg-amber-400 selection:text-slate-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

