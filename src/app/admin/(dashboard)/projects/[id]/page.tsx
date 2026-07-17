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

  return <ProjectEditor project={project} />;
}
