import Link from "next/link";
import { LayoutDashboard, FileText, Briefcase, LogOut, ExternalLink } from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";

const navItems = [
  { label: "仪表板", href: "/admin", icon: LayoutDashboard },
  { label: "文章", href: "/admin/posts", icon: FileText },
  { label: "作品", href: "/admin/projects", icon: Briefcase },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-50">
      {/* 侧边栏 */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-warm-200 bg-white">
        <div className="flex h-16 items-center border-b border-warm-200 px-6">
          <Link href="/admin" className="text-lg font-semibold text-brand-700">
            管理后台
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-warm-100 hover:text-gray-900"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-warm-200 p-4">
          <Link
            href="/"
            target="_blank"
            className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-warm-100 hover:text-gray-900"
          >
            <ExternalLink size={18} />
            查看网站
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* 主内容 */}
      <main className="ml-60 p-8">{children}</main>
    </div>
  );
}
