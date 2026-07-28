import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import SiteLayout from "@/components/SiteLayout";
import prisma from "@/lib/prisma";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

async function getProfile() {
  return prisma.profile.findFirst({
    include: { socialLinks: { orderBy: { order: "asc" } } },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile?.name || "yaya";
  const title = profile?.title || "AI 产品经理";
  const bio = profile?.bio || "在智能与人之间，设计有温度的 AI 产品。";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: {
      default: `${name} — ${title}`,
      template: `%s · ${name}`,
    },
    description: bio,
    keywords: ["AI 产品", "产品经理", "用户体验", "产品设计", "AI", "智能产品"],
    authors: [{ name }],
    creator: name,
    publisher: name,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: `${name} — ${title}`,
      description: bio,
      type: "website",
      siteName: name,
      locale: "zh_CN",
      url: baseUrl,
      ...(profile?.avatar ? { images: [{ url: profile.avatar, width: 1200, height: 630, alt: name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — ${title}`,
      description: bio,
      ...(profile?.avatar ? { images: [profile.avatar] } : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  const name = profile?.name || "yaya";

  return (
    <html lang="zh-CN" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-cream-50 font-sans text-gray-800 antialiased">
        <SiteLayout
          name={name}
          email={profile?.email}
          socialLinks={
            profile?.socialLinks.map((l) => ({
              platform: l.platform,
              url: l.url,
            })) || []
          }
        >
          {children}
        </SiteLayout>
      </body>
    </html>
  );
}
