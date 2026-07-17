import type { Metadata } from "next";
import "./globals.css";
import SiteLayout from "@/components/SiteLayout";
import prisma from "@/lib/prisma";

async function getProfile() {
  return prisma.profile.findFirst({
    include: { socialLinks: { orderBy: { order: "asc" } } },
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile?.name || "Your Name";
  const title = profile?.title || "AI 产品经理";
  const bio = profile?.bio || "关注 AI 产品、用户体验、产品方法论";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: {
      default: `${name} - ${title}`,
      template: `%s | ${name}`,
    },
    description: bio,
    keywords: ["AI产品", "产品经理", "用户体验", "产品设计", "数据分析"],
    authors: [{ name }],
    creator: name,
    publisher: name,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: `${name} - ${title}`,
      description: bio,
      type: "website",
      siteName: name,
      locale: "zh_CN",
      url: baseUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} - ${title}`,
      description: bio,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  const name = profile?.name || "Your Name";

  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-warm-50">
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
