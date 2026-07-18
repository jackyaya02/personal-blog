import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProjectEditor from "@/components/admin/ProjectEditor";

export const dynamic = "force-dynamic";

async function getProject(id: number) {
  return prisma.project.findUnique({ where: { id } });
}

export default async function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await getProject(Number(params.id));
  if (!project) notFound();

  // Prisma 的 images 字段是 JsonValue，转换为 string[] 给编辑器
  const projectData = {
    ...project,
    images: (project.images as string[] | null) ?? null,
  };

  return <ProjectEditor project={projectData} />;
}
