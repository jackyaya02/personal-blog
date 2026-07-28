import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { renderMarkdown } from "@/lib/markdown";
import { ArrowLeft, ChevronRight, ExternalLink } from "lucide-react";
import CodeHighlighter from "@/components/CodeHighlighter";

async function getProject(slug: string) {
  return prisma.project.findFirst({ where: { slug, status: "PUBLISHED" } });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return { title: "未找到" };
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
      url: `${baseUrl}/projects/${project.slug}`,
      ...(project.coverImage ? { images: [{ url: project.coverImage }] } : {}),
    },
  };
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      {/* 面包屑：首页 > 作品集 > 项目名称 */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="transition-colors hover:text-gray-700">首页</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <Link href="/projects" className="transition-colors hover:text-gray-700">作品集</Link>
        <ChevronRight size={14} className="text-gray-300" />
        <span className="truncate text-gray-700">{project.title}</span>
      </nav>

      <div className="mb-8">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">{project.title}</h1>
        <p className="mb-4 text-lg text-gray-600">{project.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {project.role && <span>角色：{project.role}</span>}
          {project.duration && <span>周期：{project.duration}</span>}
          {project.url && (
            <Link href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700">
              查看链接 <ExternalLink size={14} />
            </Link>
          )}
        </div>
      </div>

      <div className="aspect-video mb-8 flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
        {project.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.coverImage}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-6xl font-bold text-gray-200">
            {project.title.charAt(0)}
          </span>
        )}
      </div>

      <article className="prose prose-gray max-w-none">
        {renderMarkdown(project.content)}
      </article>

      {/* 图片集 */}
      {Array.isArray(project.images) && project.images.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-xl font-bold text-gray-900">作品截图</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {project.images.map((image, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={index}
                src={image as string}
                alt={`${project.title} 截图 ${index + 1}`}
                className="w-full rounded-lg border border-warm-200 object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {/* 底部 CTA */}
      <div className="mt-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 p-8 text-center text-white">
        <h2 className="mb-3 text-2xl font-bold">对这个项目感兴趣？</h2>
        <p className="mb-6 text-brand-100">欢迎联系我，了解更多细节或探讨合作机会。</p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-brand-600 transition-colors hover:bg-gray-100"
        >
          联系我
        </Link>
      </div>

      {/* 返回作品集 */}
      <div className="mt-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft size={16} /> 返回作品集
        </Link>
      </div>

      <CodeHighlighter />
    </div>
  );
}
