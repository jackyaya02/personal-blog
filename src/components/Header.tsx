"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "关于", href: "/about" },
  { label: "简历", href: "/resume" },
  { label: "作品", href: "/projects" },
  { label: "博客", href: "/blog" },
  { label: "联系", href: "/contact" },
];

export default function Header({ name = "Your Name" }: { name?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-warm-200 bg-warm-50/80 backdrop-blur-md">
      <div className="container-main flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight text-brand-700">
          {name}
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="container-main border-t border-gray-100 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
