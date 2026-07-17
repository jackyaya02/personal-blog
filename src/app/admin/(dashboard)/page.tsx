import Link from "next/link";
import prisma from "@/lib/prisma";
import { FileText, Briefcase, FolderOpen, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const [posts, projects, categories, tags] = await Promise.all([
    prisma.post.count(),
    prisma.project.count(),
    prisma.category.count(),
    prisma.tag.count(),
  ]);
  return { posts, projects, categories, tags };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "文章", value: stats.posts, href: "/admin/posts", icon: FileText, color: "text-brand-600 bg-brand-50" },
    { label: "作品", value: stats.projects, href: "/admin/projects", icon: Briefcase, color: "text-indigo-600 bg-indigo-50" },
    { label: "分类", value: stats.categories, href: "/admin/posts", icon: FolderOpen, color: "text-amber-600 bg-amber-50" },
    { label: "标签", value: stats.tags, href: "/admin/posts", icon: Tag, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">仪表板</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-xl border border-warm-200 bg-white p-6 transition-all hover:border-brand-200 hover:shadow-sm"
            >
              <div className={`mb-4 inline-flex rounded-lg p-2.5 ${card.color}`}>
                <Icon size={20} />
              </div>
              <div className="mb-1 text-3xl font-bold text-gray-900">{card.value}</div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-warm-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">快速操作</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/posts/new" className="btn-primary">
            新建文章
          </Link>
          <Link href="/admin/projects/new" className="btn-secondary">
            新建作品
          </Link>
        </div>
      </div>
    </div>
  );
}
