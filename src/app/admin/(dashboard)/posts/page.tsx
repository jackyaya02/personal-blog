import Link from "next/link";
import prisma from "@/lib/prisma";
import { Plus, Edit3 } from "lucide-react";
import DeletePostButton from "@/components/admin/DeletePostButton";
import Pagination from "@/components/Pagination";
import SearchBox from "@/components/SearchBox";
import SelectFilter from "@/components/SelectFilter";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

const statusLabel: Record<string, { text: string; className: string }> = {
  DRAFT: { text: "草稿", className: "bg-gray-100 text-gray-600" },
  PUBLISHED: { text: "已发布", className: "bg-emerald-50 text-emerald-600" },
  PINNED: { text: "置顶", className: "bg-blue-50 text-blue-600" },
};

const STATUS_OPTIONS = [
  { label: "已发布", value: "PUBLISHED" },
  { label: "草稿", value: "DRAFT" },
  { label: "置顶", value: "PINNED" },
];

async function getPostsData(searchParams: {
  page?: string;
  q?: string;
  status?: string;
  category?: string;
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const q = searchParams.q?.trim() || "";
  const status = searchParams.status?.trim() || "";
  const category = searchParams.category?.trim() || "";

  const where: Prisma.PostWhereInput = {};
  if (q.length > 0) {
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { content: { contains: q } },
    ];
  }
  if (status && ["DRAFT", "PUBLISHED", "PINNED"].includes(status)) {
    where.status = status as Prisma.PostWhereInput["status"];
  }
  if (category) {
    const catId = Number(category);
    if (!Number.isNaN(catId)) where.categoryId = catId;
  }

  const [posts, total, categories] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.post.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return {
    posts,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
    total,
    q,
    status,
    category,
    categories,
  };
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; status?: string; category?: string };
}) {
  const { posts, page, totalPages, total, q, status, category, categories } =
    await getPostsData(searchParams);

  const getPageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/posts?${qs}` : "/admin/posts";
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">文章管理</h1>
        <Link href="/admin/posts/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> 新建文章
        </Link>
      </div>

      {/* 搜索 + 筛选栏 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="min-w-[240px] flex-1 max-w-md">
          <SearchBox placeholder="搜索文章标题、摘要、内容..." paramName="q" />
        </div>
        <SelectFilter
          paramName="status"
          placeholder="全部状态"
          options={STATUS_OPTIONS}
        />
        <SelectFilter
          paramName="category"
          placeholder="全部分类"
          options={categories.map((c) => ({ label: c.name, value: String(c.id) }))}
        />
      </div>

      {/* 结果统计 */}
      <p className="mb-4 text-sm text-gray-500">
        共 <span className="font-medium text-gray-900">{total}</span> 篇文章
        {q && (
          <>
            {" "}匹配 “<span className="font-medium text-brand-600">{q}</span>”
          </>
        )}
      </p>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-warm-200 bg-white p-12 text-center text-gray-500">
          {q || status || category ? "未找到匹配的文章" : "暂无文章，点击右上角新建"}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-warm-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-warm-200 bg-warm-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 w-16">ID</th>
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
                    <td className="px-4 py-3 text-sm text-gray-400 font-mono">{post.id}</td>
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

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            getPageHref={getPageHref}
          />
        </div>
      )}
    </div>
  );
}
