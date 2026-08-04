import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { ProjectCardSkeleton } from "@/components/Skeleton";

export const metadata: Metadata = {
  title: "作品",
  description: "我的产品设计作品集",
  openGraph: {
    title: "作品集",
    description: "我的产品设计作品集",
    type: "website",
  },
};

async function getProjects() {
  return prisma.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { order: "asc" }],
  });
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">作品</h1>
      <p className="mb-10 text-gray-600">我参与过的产品项目。</p>

      {projects.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`}>
              <div className="group overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover hover:border-brand-300">
                <div className="aspect-[16/10] flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-100 via-brand-50 to-warm-100 text-5xl font-bold text-brand-300">
                  {project.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="drop-shadow-sm">{project.title.charAt(0)}</span>
                  )}
                </div>
                <div className="p-5">
                  {project.featured && (
                    <span className="mb-2 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600">
                      精选
                    </span>
                  )}
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-600">{project.title}</h3>
                  <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">{project.description}</p>
                  {project.role && (
                    <p className="mt-3 text-xs text-gray-400">{project.role} · {project.duration}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
