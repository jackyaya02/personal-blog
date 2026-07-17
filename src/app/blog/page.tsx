import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "博客",
  description: "AI 产品、用户体验、产品方法论",
};

async function getPostsAndCategories() {
  const [posts, categories, tags] = await Promise.all([
    prisma.post.findMany({
      where: { status: { in: ["PUBLISHED", "PINNED"] } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { category: true, postTags: { include: { tag: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { posts, categories, tags };
}

export default async function BlogPage() {
  const { posts, categories, tags } = await getPostsAndCategories();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">博客</h1>
      <p className="mb-10 text-gray-600">关于 AI 产品、用户体验、产品方法论的思考与分享。</p>

      <div className="grid gap-10 md:grid-cols-[1fr_220px]">
        {/* Posts */}
        <div className="space-y-1">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <article className="group border-b border-gray-100 py-5 transition-colors hover:bg-gray-50/50 -mx-4 px-4 rounded-lg">
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
              </article>
            </Link>
          ))}
          {posts.length === 0 && (
            <p className="py-20 text-center text-gray-400">暂无文章</p>
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
