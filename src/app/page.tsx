import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Home",
};

async function getHomeData() {
  const [profile, latestPosts, featuredProjects] = await Promise.all([
    prisma.profile.findFirst({ include: { socialLinks: true } }),
    prisma.post.findMany({
      where: { status: { in: ["PUBLISHED", "PINNED"] } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { category: true },
      take: 3,
    }),
    prisma.project.findMany({
      where: { status: "PUBLISHED", featured: true },
      orderBy: { order: "asc" },
      take: 3,
    }),
  ]);
  return { profile, latestPosts, featuredProjects };
}

export default async function HomePage() {
  const { profile, latestPosts, featuredProjects } = await getHomeData();

  return (
    <div className="space-y-16">
      <section className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-4xl font-bold text-gray-400">
          {profile?.name?.charAt(0) || "?"}
        </div>
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900">
          {profile?.name || "Your Name"}
        </h1>
        <p className="mb-6 text-lg text-gray-500">{profile?.title || "AI 产品经理"}</p>
        <p className="mx-auto max-w-xl leading-relaxed text-gray-600">
          {profile?.bio || "关注 AI 产品、用户体验、产品方法论"}
        </p>
        {profile && profile.socialLinks.length > 0 && (
          <div className="mt-8 flex justify-center gap-3">
            {profile.socialLinks.map((link) => (
              <Link
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-warm-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-brand-200 hover:text-brand-600"
              >
                {link.platform}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">最新文章</h2>
          <Link href="/blog" className="text-sm text-brand-600 hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <article className="rounded-xl border border-gray-100 bg-white p-5 transition-all hover:border-brand-200 hover:shadow-lg">
                <span className="mb-2 inline-block rounded bg-warm-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                  {post.category.name}
                </span>
                <h3 className="mb-2 text-base font-semibold text-gray-900 group-hover:text-brand-600">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="line-clamp-2 text-sm text-gray-500">
                    {post.excerpt}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>{post.createdAt.toLocaleDateString("zh-CN")}</span>
                  <span>{post.readingTime} min</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">精选作品</h2>
          <Link href="/projects" className="text-sm text-brand-600 hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`} className="group">
              <article className="rounded-xl border border-gray-100 bg-white p-5 transition-all hover:border-brand-200 hover:shadow-lg">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600">
                    {project.role}
                  </span>
                  <span className="text-xs text-gray-400">{project.duration}</span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900 group-hover:text-brand-600">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-500">{project.description}</p>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 p-8 text-center text-white">
        <h2 className="mb-3 text-2xl font-bold">联系我</h2>
        <p className="mb-6 text-brand-100">
          如果你有产品想法、合作机会或只是想聊聊，欢迎随时联系我。
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-brand-600 transition-colors hover:bg-gray-100"
        >
          发送消息
        </Link>
      </section>
    </div>
  );
}