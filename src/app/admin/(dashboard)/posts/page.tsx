import Link from "next/link";
import prisma from "@/lib/prisma";
import { Plus, Edit3, Trash2 } from "lucide-react";
import DeletePostButton from "@/components/admin/DeletePostButton";

export const dynamic = "force-dynamic";

async function getPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } } },
  });
}

const statusLabel: Record<string, { text: string; className: string }> = {
  DRAFT: { text: "草稿", className: "bg-gray-100 text-gray-600" },
  PUBLISHED: { text: "已发布", className: "bg-emerald-50 text-emerald-600" },
  PINNED: { text: "置顶", className: "bg-amber-50 text-amber-600" },
};

export default async function AdminPostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">文章管理</h1>
        <Link href="/admin/posts/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> 新建文章
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-warm-200 bg-white p-12 text-center text-gray-500">
          暂无文章，点击右上角新建
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-warm-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-warm-200 bg-warm-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">标题</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">分类</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">创建时间</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {posts.map((post) => {
                const st = statusLabel[post.status] || statusLabel.DRAFT;
                return (
                  <tr key={post.id} className="hover:bg-warm-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="font-medium text-gray-900 hover:text-brand-600"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{post.category.name}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${st.className}`}>
                        {st.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {post.createdAt.toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-warm-100 hover:text-brand-600"
                          title="编辑"
                        >
                          <Edit3 size={16} />
                        </Link>
                        <DeletePostButton postId={post.id} postTitle={post.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
