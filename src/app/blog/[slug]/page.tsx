import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { renderMarkdown } from "@/lib/markdown";
import { ArrowLeft, ChevronRight } from "lucide-react";
import CodeHighlighter from "@/components/CodeHighlighter";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  return prisma.post.findFirst({
    where: { slug, status: { in: ["PUBLISHED", "PINNED"] } },
    include: { category: true, postTags: { include: { tag: true } } },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "未找到" };
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    title: post.title,
    description: post.excerpt || "",
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      type: "article",
      url: `${baseUrl}/blog/${post.slug}`,
      ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {}),
    },
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-[720px]">
      {/* 面包屑：首页 > 博客 > 分类名称 > 文章标题 */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="transition-colors hover:text-gray-700">首页</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <Link href="/blog" className="transition-colors hover:text-gray-700">博客</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <Link href={`/blog/category/${post.category.slug}`} className="transition-colors hover:text-gray-700">
          {post.category.name}
        </Link>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="truncate text-gray-700">{post.title}</span>
      </nav>

      <article>
        <header className="mb-8">
          {post.coverImage && (
            <div className="mb-6 overflow-hidden rounded-xl bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span>{post.createdAt.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span>·</span>
            <Link href={`/blog/category/${post.category.slug}`} className="rounded bg-warm-100 px-2 py-0.5 text-gray-600 transition-colors hover:bg-warm-200">
              {post.category.name}
            </Link>
            <span>·</span>
            <span>{post.readingTime} 分钟阅读</span>
            {post.postTags.length > 0 && (
              <>
                <span>·</span>
                <span className="flex flex-wrap items-center gap-1">
                  {post.postTags.map((pt) => (
                    <Link
                      key={pt.tag.id}
                      href={`/blog/tag/${pt.tag.slug}`}
                      className="text-gray-400 transition-colors hover:text-brand-600"
                    >
                      #{pt.tag.name}
                    </Link>
                  ))}
                </span>
              </>
            )}
          </div>
          {post.excerpt && <p className="mt-4 text-lg text-gray-500">{post.excerpt}</p>}
        </header>

        <div className="prose prose-gray max-w-none">{renderMarkdown(post.content)}</div>
      </article>

      {/* 底部标签 */}
      {post.postTags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-gray-100 pt-6">
          {post.postTags.map((pt) => (
            <Link
              key={pt.tag.id}
              href={`/blog/tag/${pt.tag.slug}`}
              className="tag"
            >
              #{pt.tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* 底部返回按钮 */}
      <div className="mt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft size={16} /> 返回博客列表
        </Link>
      </div>

      <CodeHighlighter />
    </div>
  );
}
