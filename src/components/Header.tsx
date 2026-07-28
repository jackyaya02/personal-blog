"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "首页", href: "/" },
  { label: "关于", href: "/about" },
  { label: "作品", href: "/projects" },
  { label: "笔记", href: "/blog" },
  { label: "生活", href: "/life" },
  { label: "简历", href: "/resume" },
  { label: "联系", href: "/contact" },
];

export default function Header({ name = "Your Name" }: { name?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // 路由切换时关闭移动端菜单
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    // 首页仅在根路径高亮，避免所有子路径都高亮"首页"
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-cream-200/60 bg-cream-50/80 backdrop-blur-md">
      <div className="container-main flex h-16 items-center justify-between">
        <Link
          href="/"
          className="group flex items-baseline gap-2 transition-opacity hover:opacity-80"
        >
          <span className="font-serif text-xl font-semibold tracking-tight text-gray-900">
            {name}
          </span>
          <span className="hidden text-xs font-medium tracking-[0.2em] text-brand-400 sm:inline">
            · AI 产品经理
          </span>
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-9">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative text-sm font-medium transition-colors hover:text-brand-600 ${
                isActive(item.href) ? "text-brand-600" : "text-gray-600"
              }`}
            >
              {item.label}
              <span
                className={`absolute -bottom-[21px] left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-brand-400 transition-all duration-300 ease-soft ${
                  isActive(item.href) ? "w-6 opacity-100" : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-60"
                }`}
              />
            </Link>
          ))}
        </nav>

        <button
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-600 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* 移动端侧边导航 */}
      {menuOpen && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 top-16 z-40 bg-brand-900/10 backdrop-blur-sm md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          {/* 侧边导航列表 */}
          <div className="fixed right-0 top-16 z-50 h-[calc(100vh-4rem)] w-72 max-w-[85vw] border-l border-cream-200 bg-cream-50/95 shadow-2xl backdrop-blur-md md:hidden">
            <nav className="flex flex-col gap-1 p-5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-[44px] items-center rounded-xl px-4 py-3 text-sm transition-colors hover:bg-brand-50 ${
                    isActive(item.href) ? "bg-brand-50 text-brand-700" : "text-gray-700"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
