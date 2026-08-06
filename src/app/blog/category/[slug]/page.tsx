import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) return { title: "未找到" };
  const desc = category.description || `${category.name}分类下的所有文章`;
  return {
    title: category.name + " - 博客",
    description: desc,
    openGraph: {
      title: `${category.name} - 博客`,
      description: desc,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      posts: {
        where: { status: { in: ["PUBLISHED", "PINNED"] } },
        orderBy: { createdAt: "desc" },
        include: { category: true, postTags: { include: { tag: true } } },
      },
    },
  });
  if (!category) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/blog" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> 全部文章
      </Link>
      <h1 className="mb-2 text-2xl font-bold text-gray-900">{category.name}</h1>
      {category.description && <p className="mb-8 text-gray-500">{category.description}</p>}
      <div className="space-y-1">
        {category.posts.map((post) => (
          <Link key={post.id} href={"/blog/" + post.slug}>
            <article className="group flex gap-4 border-b border-warm-200 py-4 transition-colors hover:bg-brand-50/30 -mx-4 px-4 rounded-lg">
              {post.coverImage && (
                <div className="flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-xs text-gray-400">
                  {post.createdAt.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}
                </div>
                <h2 className="font-medium text-gray-900 group-hover:text-brand-600">{post.title}</h2>
                {post.excerpt && <p className="mt-1 text-sm text-gray-500 line-clamp-1">{post.excerpt}</p>}
              </div>
            </article>
          </Link>
        ))}
        {category.posts.length === 0 && <p className="py-10 text-center text-gray-400">暂无文章</p>}
      </div>
    </div>
  );
}
