import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import Pagination from "@/components/Pagination";
import SearchBox from "@/components/SearchBox";
import PostCard from "@/components/PostCard";
import { PostListSkeleton } from "@/components/Skeleton";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "博客",
  description: "AI 产品、用户体验、产品方法论",
  openGraph: {
    title: "博客",
    description: "AI 产品、用户体验、产品方法论",
    type: "website",
  },
};

const PAGE_SIZE = 10;

async function getBlogData(searchParams: { page?: string; q?: string }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const q = searchParams.q?.trim() || "";

  // 构造查询条件：排除生活分类（生活类文章在 /life 页面展示）
  const where: Prisma.PostWhereInput = q.length > 0
    ? {
        AND: [
          { status: { in: ["PUBLISHED", "PINNED"] } },
          { category: { slug: { not: "life" } } },
          {
            OR: [
              { title: { contains: q } },
              { excerpt: { contains: q } },
              { content: { contains: q } },
            ],
          },
        ],
      }
    : {
        status: { in: ["PUBLISHED", "PINNED"] },
        category: { slug: { not: "life" } },
      };

  const [posts, total, categories, tags] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { category: true, postTags: { include: { tag: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.post.count({ where }),
    prisma.category.findMany({
      where: { slug: { not: "life" } },
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: { where: { status: { in: ["PUBLISHED", "PINNED"] } } } } } },
    }),
    // 标签按文章数倒序排序
    prisma.tag.findMany({
      orderBy: { postTags: { _count: "desc" } },
      include: { _count: { select: { postTags: { where: { post: { status: { in: ["PUBLISHED", "PINNED"] } } } } } } },
    }),
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

      {/* 分类 Tab（横向滚动） */}
      <div className="mb-6 -mx-4 overflow-x-auto px-4 pb-2">
        <div className="flex min-w-max gap-2">
          <Link
            href="/blog"
            className={`inline-flex min-h-[36px] items-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !q ? "bg-brand-600 text-white" : "bg-warm-100 text-gray-600 hover:bg-warm-200"
            }`}
          >
            全部
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/blog/category/${cat.slug}`}
              className={`inline-flex min-h-[36px] items-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                "bg-warm-100 text-gray-600 hover:bg-warm-200"
              }`}
            >
              {cat.name}
              {cat._count.posts > 0 && (
                <span className="ml-1.5 text-xs opacity-60">{cat._count.posts}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* 搜索框 */}
      <div className="mb-8 max-w-md">
        <SearchBox placeholder="搜索文章标题、摘要或内容..." paramName="q" />
      </div>

      <div className="grid gap-10 md:grid-cols-[1fr_220px]">
        {/* Posts */}
        <div>
          {/* 搜索结果提示 */}
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
          ) : q ? (
            <div className="py-20 text-center">
              <p className="text-gray-400">未找到匹配的文章，换个关键词试试</p>
              <Link href="/blog" className="mt-3 inline-block text-sm text-brand-600 hover:underline">
                查看全部文章
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
          {/* Categories */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">分类</h3>
            <div className="space-y-1">
              <Link
                href="/blog"
                className="block rounded px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-600"
              >
                全部
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blog/category/${cat.slug}`}
                  className="flex min-h-[36px] items-center justify-between rounded px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-600"
                >
                  <span>{cat.name}</span>
                  {cat._count.posts > 0 && (
                    <span className="text-xs text-gray-400">{cat._count.posts}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Tags - 按文章数排序 */}
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
                  {tag._count.postTags > 0 && (
                    <span className="ml-1 text-xs opacity-60">{tag._count.postTags}</span>
                  )}
                </Link>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-gray-400">暂无标签</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
