import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import Pagination from "@/components/Pagination";
import SearchBox from "@/components/SearchBox";
import PostCard from "@/components/PostCard";
import { PostListSkeleton } from "@/components/Skeleton";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "生活",
  description: "阅读、摄影、灵感收藏、设计观察——生活里的小确幸。",
  openGraph: {
    title: "生活",
    description: "阅读、摄影、灵感收藏、设计观察——生活里的小确幸。",
    type: "website",
  },
};

const PAGE_SIZE = 10;

async function getLifeData(searchParams: { page?: string; q?: string; tag?: string }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const q = searchParams.q?.trim() || "";
  const tag = searchParams.tag?.trim() || "";

  // 基础条件：生活分类 + 已发布
  const where: Prisma.PostWhereInput = {
    status: { in: ["PUBLISHED", "PINNED"] },
    category: { slug: "life" },
  };

  // 搜索
  if (q.length > 0) {
    where.AND = [
      {
        OR: [
          { title: { contains: q } },
          { excerpt: { contains: q } },
          { content: { contains: q } },
        ],
      },
    ];
  }

  // 标签筛选
  if (tag.length > 0) {
    where.AND = [
      ...(where.AND as Prisma.PostWhereInput[] | undefined || []),
      { postTags: { some: { tag: { slug: tag } } } },
    ];
  }

  const [posts, total, tags] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { category: true, postTags: { include: { tag: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.post.count({ where }),
    // 只展示生活分类下文章用到的标签
    prisma.tag.findMany({
      where: { postTags: { some: { post: { category: { slug: "life" } } } } },
      orderBy: { postTags: { _count: "desc" } },
      include: {
        _count: {
          select: {
            postTags: {
              where: { post: { status: { in: ["PUBLISHED", "PINNED"] }, category: { slug: "life" } } },
            },
          },
        },
      },
    }),
  ]);

  return { posts, tags, page, totalPages: Math.ceil(total / PAGE_SIZE), total, q, tag };
}

export default async function LifePage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; tag?: string };
}) {
  const { posts, tags, page, totalPages, total, q, tag } = await getLifeData(searchParams);

  const activeTag = tags.find((t) => t.slug === tag);

  const getPageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/life?${qs}` : "/life";
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">生活</h1>
      <p className="mb-6 text-gray-600">阅读 · 摄影 · 灵感收藏 · 设计观察——生活里的小确幸。</p>

      {/* 标签筛选 */}
      <div className="mb-6 -mx-4 overflow-x-auto px-4 pb-2">
        <div className="flex min-w-max gap-2">
          <Link
            href="/life"
            className={`inline-flex min-h-[36px] items-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !tag ? "bg-brand-600 text-white" : "bg-warm-100 text-gray-600 hover:bg-warm-200"
            }`}
          >
            全部
          </Link>
          {tags.map((t) => (
            <Link
              key={t.id}
              href={`/life?tag=${t.slug}`}
              className={`inline-flex min-h-[36px] items-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tag === t.slug ? "bg-brand-600 text-white" : "bg-warm-100 text-gray-600 hover:bg-warm-200"
              }`}
            >
              {t.name}
              {t._count.postTags > 0 && (
                <span className="ml-1.5 text-xs opacity-60">{t._count.postTags}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* 搜索框 */}
      <div className="mb-8 max-w-md">
        <SearchBox placeholder="搜索生活文章..." paramName="q" />
      </div>

      <div className="grid gap-10 md:grid-cols-[1fr_220px]">
        {/* Posts */}
        <div>
          {activeTag && (
            <p className="mb-4 text-sm text-gray-500">
              当前标签：<span className="font-medium text-brand-600">#{activeTag.name}</span>
              <Link href="/life" className="ml-2 text-xs text-gray-400 hover:text-gray-600">清除</Link>
            </p>
          )}

          {q && (
            <p className="mb-4 text-sm text-gray-500">
              找到 <span className="font-medium text-gray-900">{total}</span> 篇包含 “
              <span className="font-medium text-brand-600">{q}</span>” 的文章
            </p>
          )}

          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : q || tag ? (
            <div className="py-20 text-center">
              <p className="text-gray-400">未找到匹配的文章</p>
              <Link href="/life" className="mt-3 inline-block text-sm text-brand-600 hover:underline">
                查看全部
              </Link>
            </div>
          ) : (
            <PostListSkeleton count={3} />
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                getPageHref={getPageHref}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">标签</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/life?tag=${t.slug}`}
                  className={`tag ${tag === t.slug ? "bg-brand-100 text-brand-700" : ""}`}
                >
                  {t.name}
                  {t._count.postTags > 0 && (
                    <span className="ml-1 text-xs opacity-60">{t._count.postTags}</span>
                  )}
                </Link>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-gray-400">暂无标签</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-4">
            <p className="font-serif text-sm text-gray-700">工作类文章请看</p>
            <Link href="/blog" className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline">
              前往笔记 →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
