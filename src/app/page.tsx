import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import FadeIn from "@/components/FadeIn";
import { HomePostSkeleton, ProjectCardSkeleton } from "@/components/Skeleton";

export const metadata: Metadata = {
  title: "yaya — AI 产品经理",
  description: "在智能与人之间，设计有温度的 AI 产品。",
  openGraph: {
    title: "yaya — AI 产品经理",
    description: "在智能与人之间，设计有温度的 AI 产品。",
    type: "website",
  },
};

async function getHomeData() {
  // One-time migration: ensure no posts in "生活" category (they belong in "笔记")
  // NOTE: Prisma 7 adapter has a bug where category.slug filter works in findMany but not count/updateMany
  const allCats = await prisma.category.findMany();
  const blogCat = allCats.find(c => c.slug === "blog");
  console.log("[MIGRATE] allCats:", allCats.length, "blogCat:", !!blogCat);
  if (blogCat) {
    const lifePostsToFix = await prisma.post.findMany({
      where: { category: { slug: "life" } },
      include: { category: true },
    });
    console.log("[MIGRATE] lifePostsToFix:", lifePostsToFix.length);
    if (lifePostsToFix.length > 0) {
      const result = await prisma.post.updateMany({
        where: { id: { in: lifePostsToFix.map(p => p.id) } },
        data: { categoryId: blogCat.id },
      });
      console.log("[MIGRATE] Updated:", result.count, "posts from life to blog");
    }
  }

  const [profile, latestPosts, featuredProjects, lifePosts] = await Promise.all([
    prisma.profile.findFirst({ include: { socialLinks: true } }),
    prisma.post.findMany({
      where: { status: { in: ["PUBLISHED", "PINNED"] }, category: { slug: { not: "life" } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { category: true, postTags: { include: { tag: true } } },
      take: 3,
    }),
    prisma.post.findMany({
      where: { status: { in: ["PUBLISHED", "PINNED"] }, category: { slug: "life" } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { category: true, postTags: { include: { tag: true } } },
      take: 4,
    }),
    prisma.project.findMany({
      orderBy: { order: "asc" },
    }),
  ]);
  // Filter featured projects in JS (workaround for Prisma/Supabase where clause issue)
  const filteredProjects = featuredProjects.filter(p => p.status === "PUBLISHED" && p.featured === true).slice(0, 2);
  return { profile, latestPosts, featuredProjects: filteredProjects, lifePosts };
}

// 「我的旅程」时间线数据
const JOURNEY = [
  {
    year: "2022",
    title: "开始探索产品设计",
    desc: "从用户体验研究起步，学习如何用同理心理解用户，把模糊需求转化为清晰的产品决策。",
  },
  {
    year: "2024",
    title: "参与 AI 产品实践",
    desc: "进入 AI 产品领域，主导多个智能助手与 Agent 产品的从 0 到 1 设计，建立 AI 评估方法论。",
  },
  {
    year: "2026",
    title: "持续研究 AI 与用户体验",
    desc: "聚焦 AI 与人类体验的连接点，探索有温度、有意义的智能产品形态。",
  },
];

export default async function HomePage() {
  const data = await getHomeData();
  const { profile, latestPosts, lifePosts } = data;
  let featuredProjects = data.featuredProjects;

  // Filter featured projects in JS (workaround for Prisma/Supabase where clause issue)
  if (featuredProjects.length === 0) {
    const allProjects = await prisma.project.findMany({ orderBy: { order: "asc" } });
    featuredProjects = allProjects.filter(p => p.status === "PUBLISHED" && p.featured === true).slice(0, 2);
  }
  const name = profile?.name || "yaya";
  const title = profile?.title || "AI 产品经理";

  return (
    <div className="overflow-hidden">
      {/* ============ Hero 首屏 ============ */}
      <section className="relative">
        {/* 装饰性柔和光斑 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 top-20 -z-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl animate-soft-blob"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-40 -z-10 h-80 w-80 rounded-full bg-mist-200/40 blur-3xl animate-soft-blob"
          style={{ animationDelay: "-6s" }}
        />

        <div className="container-main flex flex-row items-center gap-4 pb-16 pt-12 lg:gap-16 lg:pb-28 lg:pt-24">
          {/* 左侧：文字介绍 */}
          <div className="flex-1 lg:basis-7/12">
            <h1 className="animate-fade-up font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-gray-900 sm:text-7xl lg:text-8xl">
              <span className="text-gradient-rose">yaya</span>
            </h1>
            <p className="mt-5 max-w-xl animate-fade-up font-serif text-xl italic leading-relaxed text-gray-700 sm:mt-6 sm:text-3xl" style={{ animationDelay: "0.15s" }}>
              在智能与人之间，<br className="hidden sm:block" />
              设计有温度的 AI 产品。
            </p>
            <p className="mt-4 max-w-xl animate-fade-up text-sm leading-relaxed text-gray-600 sm:mt-5 sm:text-base" style={{ animationDelay: "0.3s" }}>
              我相信优秀的 AI 产品，不仅需要智能，<br className="hidden sm:block" />
              也需要理解人的情绪、需求和创造力。
            </p>

            <div className="mt-8 flex animate-fade-up flex-wrap gap-3 sm:mt-10 sm:gap-4" style={{ animationDelay: "0.45s" }}>
              <Link href="/projects" className="btn-primary">
                查看我的作品
                <span aria-hidden>→</span>
              </Link>
              <Link href="/blog" className="btn-secondary">
                阅读我的思考
              </Link>
            </div>

            {/* 小标签：职业方向 */}
            <div className="mt-8 flex animate-fade-up flex-wrap gap-2 sm:mt-12 sm:gap-3" style={{ animationDelay: "0.6s" }}>
              {["AI 产品设计", "用户体验", "智能产品创新"].map((t) => (
                <span key={t} className="rounded-full border border-cream-300 bg-white/60 px-3 py-1 text-[11px] font-medium text-gray-600 backdrop-blur-sm sm:px-4 sm:py-1.5 sm:text-xs">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* 右侧：人物头像 / 杂志封面感 */}
          <div className="w-[7rem] shrink-0 sm:w-[10rem] lg:basis-5/12">
            <div className="relative mx-auto animate-fade-in lg:max-w-sm" style={{ animationDelay: "0.3s" }}>
              {/* 装饰边框 */}
              <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-200/50 via-mist-200/40 to-cream-300/40 blur-xl" />
              <div className="absolute -inset-1 -z-10 rounded-[1.8rem] bg-gradient-to-br from-brand-300/60 to-mist-300/50" />
              <div className="overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-brand-100 via-cream-100 to-mist-100 shadow-rose">
                {profile?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar}
                    alt={name}
                    className="aspect-[4/5] h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/5] h-full w-full items-center justify-center font-serif text-7xl font-semibold text-brand-300">
                    {name.charAt(0)}
                  </div>
                )}
              </div>
              {/* 角标：杂志感 */}
              <div className="absolute -bottom-3 -left-3 rounded-xl bg-white/90 px-3 py-2 shadow-soft backdrop-blur-sm">
                <p className="font-serif text-xs font-semibold text-gray-900 sm:text-sm">{title}</p>
                <p className="text-[10px] text-brand-500 sm:text-xs">个人作品集 · 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 我的旅程 ============ */}
      <section className="container-main py-16 sm:py-24">
        <FadeIn>
          <div className="mb-12 text-center sm:mb-16">
            <p className="eyebrow">我的旅程</p>
            <h2 className="section-title">成长之路</h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-500">成长 · 探索 · 创造</p>
          </div>
        </FadeIn>

        <div className="relative mx-auto max-w-4xl">
          {/* 中线：移动端靠左，桌面端居中 */}
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-brand-200 via-mist-200 to-transparent sm:left-1/2 sm:-translate-x-1/2" />

          <div className="space-y-10 sm:space-y-16">
            {JOURNEY.map((item, i) => {
              const isOdd = i % 2 === 1;
              return (
                <FadeIn key={item.year} delay={i * 100}>
                  {/* 移动端：单列纵向（文字在右）；桌面端：左右交替 */}
                  <div className={`relative flex items-center sm:gap-8 ${isOdd ? "sm:flex-row-reverse" : ""}`}>
                    {/* 节点圆点：移动端 left-4，桌面端居中 */}
                    <div className="absolute left-4 z-10 h-4 w-4 -translate-x-1/2 rounded-full border-4 border-cream-50 bg-brand-400 shadow-rose-soft sm:left-1/2" />
                    {/* 占位（桌面端用，移动端隐藏） */}
                    <div className="hidden w-1/2 sm:block" />
                    {/* 文字卡片 */}
                    <div className={`ml-10 w-full sm:ml-0 sm:w-1/2 ${isOdd ? "sm:pr-12 sm:text-right" : "sm:pl-12 sm:text-left"}`}>
                      <p className="font-serif text-3xl font-semibold text-brand-400 sm:text-4xl">{item.year}</p>
                      <h3 className="mt-2 text-base font-semibold text-gray-900 sm:text-lg">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 精选作品 ============ */}
      <section className="bg-cream-100/50 py-24">
        <div className="container-main">
          <FadeIn>
            <div className="mb-16 flex items-end justify-between">
              <div>
                <p className="eyebrow">精选作品</p>
                <h2 className="section-title">产品案例</h2>
              </div>
              <Link href="/projects" className="hidden text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 sm:block">
                查看全部作品 →
              </Link>
            </div>
          </FadeIn>

          {featuredProjects.length > 0 ? (
            <div className="grid gap-10 lg:grid-cols-2">
              {featuredProjects.map((project, i) => (
                <FadeIn key={project.id} delay={i * 100}>
                  <Link href={`/projects/${project.slug}`} className="group block">
                    <article className="card-editorial h-full overflow-hidden p-0">
                      {/* 封面 */}
                      <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-100 via-cream-100 to-mist-100">
                        {project.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={project.coverImage}
                            alt={project.title}
                            className="h-full w-full object-cover transition-transform duration-600 ease-soft group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-serif text-6xl font-semibold text-brand-300">
                            {project.title.charAt(0)}
                          </div>
                        )}
                      </div>
                      {/* 内容：Case Study 风格 */}
                      <div className="p-8">
                        {project.role && <p className="eyebrow mb-2">{project.role}</p>}
                        <h3 className="font-serif text-2xl font-semibold leading-snug text-gray-900 transition-colors group-hover:text-brand-600">
                          {project.title}
                        </h3>
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
                          {project.description}
                        </p>
                        <div className="mt-5 flex items-center gap-4 border-t border-cream-200 pt-5 text-xs text-gray-400">
                          {project.duration && <span>{project.duration}</span>}
                          <span className="ml-auto font-medium text-brand-500 transition-colors group-hover:text-brand-600">
                            查看案例详情 →
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <ProjectCardSkeleton key={i} variant="featured" />
              ))}
            </div>
          )}

          <div className="mt-12 text-center sm:hidden">
            <Link href="/projects" className="btn-secondary">查看全部作品 →</Link>
          </div>
        </div>
      </section>

      {/* ============ 最新文章 ============ */}
      <section className="container-main py-16">
        <FadeIn>
          <div className="mb-16 flex items-end justify-between">
            <div>
              <p className="eyebrow">最新文章</p>
              <h2 className="section-title">个人专栏</h2>
              <p className="mt-3 text-sm text-gray-500">AI · 产品 · 设计</p>
            </div>
            <Link href="/blog" className="hidden text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 sm:block">
              全部文章 →
            </Link>
          </div>
        </FadeIn>

        {latestPosts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post, i) => (
              <FadeIn key={post.id} delay={i * 100}>
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <article className="card-editorial flex h-full flex-col p-7">
                    <div className="mb-4 flex items-center gap-3 text-xs text-gray-400">
                      <span className="chip">{post.category.name}</span>
                      <span>{post.createdAt.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                    <h3 className="font-serif text-xl font-semibold leading-snug text-gray-900 transition-colors group-hover:text-brand-600">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-500">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-5 flex items-center justify-between border-t border-cream-200 pt-4 text-xs text-gray-400">
                      <span>阅读约 {post.readingTime} 分钟</span>
                      <span className="font-medium text-brand-500 transition-colors group-hover:text-brand-600">阅读 →</span>
                    </div>
                  </article>
                </Link>
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <HomePostSkeleton key={i} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center sm:hidden">
          <Link href="/blog" className="btn-secondary">全部文章 →</Link>
        </div>
      </section>

          {/* ============ 兴趣角落（生活文章） ============ */}
      <section className="border-y border-cream-200 bg-cream-100/40 py-24">
        <div className="container-main">
          <FadeIn>
            <div className="mb-16 text-center">
              <p className="eyebrow">兴趣角落</p>
              <h2 className="section-title">生活的小确幸</h2>
              <p className="mx-auto mt-4 max-w-xl text-gray-500">
                除了产品工作，这些是我生活里的小确幸——它们让我保持好奇与柔软。
              </p>
            </div>
          </FadeIn>

          {false ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {lifePosts.map((post, i) => (
                <FadeIn key={post.id} delay={i * 80}>
                  <Link href={`/blog/${post.slug}`} className="group block h-full">
                    <article className="h-full overflow-hidden rounded-2xl bg-white shadow-soft transition-all duration-400 ease-soft hover:-translate-y-1 hover:shadow-soft-hover">
                      <div className="aspect-[4/3] overflow-hidden bg-cream-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-600 ease-soft group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-serif text-4xl font-semibold text-brand-300">
                            {post.title.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <p className="font-serif text-lg font-semibold text-gray-900 transition-colors group-hover:text-brand-600">{post.title}</p>
                        {post.excerpt && (
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">{post.excerpt}</p>
                        )}
                        <p className="mt-3 text-xs font-medium text-brand-500 transition-colors group-hover:text-brand-600">查看文章 →</p>
                      </div>
                    </article>
                  </Link>
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-full overflow-hidden rounded-2xl bg-white shadow-soft">
                  <div className="aspect-[4/3] animate-pulse bg-cream-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-cream-200" />
                    <div className="space-y-2">
                      <div className="h-3 w-full animate-pulse rounded bg-cream-100" />
                      <div className="h-3 w-2/3 animate-pulse rounded bg-cream-100" />
                    </div>
                    <div className="h-3 w-16 animate-pulse rounded bg-cream-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link href="/life" className="btn-secondary">
              查看更多生活随笔 →
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 联系我 CTA ============ */}
      <FadeIn>
        <section className="container-main py-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-100 via-cream-100 to-mist-100 p-8 text-center sm:p-10">


            <div className="relative">
              <p className="eyebrow">保持联系</p>

              <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-gray-600">
                无论是合作机会、产品讨论，还是想分享一本好书——
                <br className="hidden sm:block" />
                欢迎随时来信，我会认真回复每一条消息。
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact" className="btn-primary">发送消息 →</Link>
                <Link href="/about" className="btn-secondary">了解更多</Link>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
