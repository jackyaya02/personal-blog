"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface Category {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

interface PostData {
  id?: number;
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string | null;
  categoryId?: number;
  status?: string;
  postTags?: { tag: Tag }[];
}

export default function PostEditor({
  post,
  categories,
  tags,
}: {
  post?: PostData;
  categories: Category[];
  tags: Tag[];
}) {
  const router = useRouter();
  const isEdit = !!post?.id;

  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [categoryId, setCategoryId] = useState(post?.categoryId || categories[0]?.id || 0);
  const [status, setStatus] = useState(post?.status || "DRAFT");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    post?.postTags?.map((pt) => pt.tag.id) || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleTag(tagId: number) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title || !slug || !content || !categoryId) {
      setError("标题、slug、内容、分类为必填");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        categoryId,
        status,
        tagIds: selectedTagIds,
      };

      const url = isEdit ? `/api/admin/posts/${post!.id}` : "/api/admin/posts";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "保存失败");
        return;
      }
      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link
        href="/admin/posts"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ArrowLeft size={16} /> 返回文章列表
      </Link>

      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        {isEdit ? "编辑文章" : "新建文章"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-warm-200 bg-white p-6">
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
              placeholder="文章标题"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">URL slug *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
              placeholder="my-first-post"
            />
            <p className="mt-1 text-xs text-gray-400">将用于 /blog/{slug || "..."}</p>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">摘要</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
              placeholder="文章摘要（可选）"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">内容 *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={18}
              className="w-full rounded-lg border border-warm-200 px-3 py-2 font-mono text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
              placeholder="支持 Markdown 语法..."
            />
          </div>
        </div>

        <div className="rounded-xl border border-warm-200 bg-white p-6">
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">分类 *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">状态</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
              >
                <option value="DRAFT">草稿</option>
                <option value="PUBLISHED">已发布</option>
                <option value="PINNED">置顶</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">标签</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full px-3 py-1 text-xs transition-colors ${
                      selected
                        ? "bg-brand-500 text-white"
                        : "bg-warm-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
              {tags.length === 0 && (
                <p className="text-xs text-gray-400">暂无标签</p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "保存中..." : isEdit ? "保存修改" : "创建文章"}
          </button>
          <Link href="/admin/posts" className="btn-secondary">
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
