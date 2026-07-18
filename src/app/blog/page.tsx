import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import Pagination from "@/components/Pagination";
import SearchBox from "@/components/SearchBox";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "博客",
  description: "AI 产品、用户体验、产品方法论",
};

const PAGE_SIZE = 10;

async function getBlogData(searchParams: { page?: string; q?: string }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const q = searchParams.q?.trim() || "";

  // 构造查询条件
  const where: Prisma.PostWhereInput = q.length > 0
    ? {
        AND: [
          { status: { in: ["PUBLISHED", "PINNED"] } },
          {
            OR: [
              { title: { contains: q } },
              { excerpt: { contains: q } },
              { content: { contains: q } },
            ],
          },
        ],
      }
    : { status: { in: ["PUBLISHED", "PINNED"] } };

  const [posts, total, categories, tags] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { category: true, postTags: { include: { tag: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.post.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return {
    posts,
    categories,
    tags,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
    total,
    q,
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const { posts, categories, tags, page, totalPages, total, q } = await getBlogData(searchParams);

  // 生成分页链接（保留搜索参数）
  const getPageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">博客</h1>
      <p className="mb-6 text-gray-600">关于 AI 产品、用户体验、产品方法论的思考与分享。</p>

      {/* 搜索框 */}
      <div className="mb-8 max-w-md">
        <SearchBox placeholder="搜索文章标题、摘要或内容..." paramName="q" />
      </div>

      <div className="grid gap-10 md:grid-cols-[1fr_220px]">
        {/* Posts */}
        <div className="space-y-1">
          {/* 搜索结果提示 */}
          {q && (
            <p className="mb-4 text-sm text-gray-500">
              找到 <span className="font-medium text-gray-900">{total}</span> 篇包含 “
              <span className="font-medium text-brand-600">{q}</span>” 的文章
            </p>
          )}

          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <article className="group flex flex-col gap-4 border-b border-gray-100 py-5 transition-colors hover:bg-gray-50/50 -mx-4 px-4 rounded-lg sm:flex-row">
                {post.coverImage && (
                  <div className="flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-40 w-full rounded-lg object-cover sm:h-24 sm:w-36"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2 text-xs text-gray-400">
                    <span>{post.createdAt.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</span>
                    <span>·</span>
                    <span className="rounded bg-warm-100 px-2 py-0.5 text-gray-500">{post.category.name}</span>
                    {post.status === "PINNED" && (
                      <span className="rounded bg-brand-50 px-2 py-0.5 text-brand-600">置顶</span>
                    )}
                  </div>
                  <h2 className="mb-1.5 text-lg font-semibold text-gray-900 group-hover:text-brand-600">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <span>{post.readingTime} 分钟阅读</span>
                    {post.postTags.length > 0 && (
                      <>
                        <span>·</span>
                        {post.postTags.map((pt) => (
                          <span key={pt.tag.id} className="text-gray-400 hover:text-indigo-600">#{pt.tag.name}</span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}

          {posts.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400">
                {q ? "未找到匹配的文章，换个关键词试试" : "暂无文章"}
              </p>
              {q && (
                <Link href="/blog" className="mt-3 inline-block text-sm text-brand-600 hover:underline">
                  查看全部文章
                </Link>
              )}
            </div>
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
          {/* Categories */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">分类</h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blog/category/${cat.slug}`}
                  className="block rounded px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-600"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">标签</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog/tag/${tag.slug}`}
                  className="tag"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
