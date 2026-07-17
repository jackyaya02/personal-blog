"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface SiteLayoutProps {
  name: string;
  email?: string | null;
  socialLinks?: Array<{ platform: string; url: string }>;
  children: React.ReactNode;
}

// 后台路径不需要展示型网站的 Header/Footer
function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export default function SiteLayout({
  name,
  email,
  socialLinks,
  children,
}: SiteLayoutProps) {
  const pathname = usePathname();

  // 后台页面（包括登录页）不渲染公共 Header/Footer
  if (isAdminPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <Header name={name} />
      <main className="container-main min-h-[calc(100vh-8rem)] pt-24 pb-16">
        {children}
      </main>
      <Footer name={name} email={email} socialLinks={socialLinks} />
    </>
  );
}
