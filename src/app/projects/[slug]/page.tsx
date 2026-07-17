import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { renderMarkdown } from "@/lib/markdown";
import { ArrowLeft, ExternalLink } from "lucide-react";

async function getProject(slug: string) {
  return prisma.project.findFirst({ where: { slug, status: "PUBLISHED" } });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getProject(params.slug);
  if (!project) return { title: "未找到" };
  return { title: project.title, description: project.description };
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/projects" className="mb-8 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700">
        <ArrowLeft size={16} /> 返回作品集
      </Link>

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

      <div className="aspect-video mb-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-6xl font-bold text-gray-200">
        {project.title.charAt(0)}
      </div>

      <article className="prose prose-gray max-w-none">
        {renderMarkdown(project.content)}
      </article>
    </div>
  );
}
