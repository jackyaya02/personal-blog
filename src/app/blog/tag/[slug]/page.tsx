import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tag = await prisma.tag.findUnique({ where: { slug: params.slug } });
  if (!tag) return { title: "未找到" };
  const desc = `标签 #${tag.name} 下的所有文章`;
  return {
    title: "#" + tag.name + " - 博客",
    description: desc,
    openGraph: {
      title: `#${tag.name} - 博客`,
      description: desc,
      type: "website",
    },
  };
}

export default async function TagPage({ params }: { params: { slug: string } }) {
  const tag = await prisma.tag.findUnique({
    where: { slug: params.slug },
    include: {
      postTags: { include: { post: { include: { category: true } } } },
    },
  });
  if (!tag) notFound();

  const posts = tag.postTags
    .filter((pt) => pt.post.status === "PUBLISHED" || pt.post.status === "PINNED")
    .map((pt) => pt.post)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/blog" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> 全部文章
      </Link>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">#{tag.name}</h1>
      <div className="space-y-1">
        {posts.map((post) => (
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
                  <span className="mx-1">·</span>
                  <span className="rounded bg-warm-100 px-1.5 py-0.5 text-gray-500">{post.category.name}</span>
                </div>
                <h2 className="font-medium text-gray-900 group-hover:text-brand-600">{post.title}</h2>
                {post.excerpt && <p className="mt-1 text-sm text-gray-500 line-clamp-1">{post.excerpt}</p>}
              </div>
            </article>
          </Link>
        ))}
        {posts.length === 0 && <p className="py-10 text-center text-gray-400">暂无文章</p>}
      </div>
    </div>
  );
}
