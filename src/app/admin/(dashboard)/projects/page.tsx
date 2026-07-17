import Link from "next/link";
import prisma from "@/lib/prisma";
import { Plus, Edit3, Trash2, Star } from "lucide-react";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";

export const dynamic = "force-dynamic";

async function getProjects() {
  return prisma.project.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
}

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">作品管理</h1>
        <Link href="/admin/projects/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> 新建作品
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-warm-200 bg-white p-12 text-center text-gray-500">
          暂无作品，点击右上角新建
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-warm-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-warm-200 bg-warm-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">标题</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">角色</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">精选</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">排序</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-warm-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="font-medium text-gray-900 hover:text-brand-600"
                    >
                      {project.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{project.role || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        project.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {project.status === "PUBLISHED" ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {project.featured ? (
                      <Star size={16} className="fill-amber-400 text-amber-400" />
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{project.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-warm-100 hover:text-brand-600"
                        title="编辑"
                      >
                        <Edit3 size={16} />
                      </Link>
                      <DeleteProjectButton projectId={project.id} projectTitle={project.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
