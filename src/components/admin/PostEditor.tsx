"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Check } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { renderMarkdown } from "@/lib/markdown";

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
  coverImage?: string | null;
  categoryId?: number;
  status?: string;
  postTags?: { tag: Tag }[];
}

type PostStatus = "DRAFT" | "PUBLISHED" | "PINNED";

const STATUS_RADIOS: { value: PostStatus; label: string; color: string }[] = [
  { value: "DRAFT", label: "草稿", color: "text-gray-700" },
  { value: "PUBLISHED", label: "已发布", color: "text-emerald-600" },
  { value: "PINNED", label: "置顶", color: "text-blue-600" },
];

/** 根据标题生成 slug（仅支持 ASCII 字符，中文返回空字符串） */
function generateSlug(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return "";
  // 仅对纯 ASCII 标题自动生成（英文/数字）
  if (/[\u4e00-\u9fa5]/.test(trimmed)) return "";
  return trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** 根据名称生成 tag slug（中文使用时间戳后缀保证唯一） */
function generateTagSlug(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  if (/[\u4e00-\u9fa5]/.test(trimmed)) {
    return `tag-${Date.now()}`;
  }
  return trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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
  const [slugEdited, setSlugEdited] = useState(!!post?.slug);
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [categoryId, setCategoryId] = useState(post?.categoryId || categories[0]?.id || 0);
  const [status, setStatus] = useState<PostStatus>(
    (post?.status as PostStatus) || "DRAFT"
  );
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    post?.postTags?.map((pt) => pt.tag.id) || []
  );
  const [availableTags, setAvailableTags] = useState<Tag[]>(tags);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // 实时预览
  const preview = useMemo(() => renderMarkdown(content), [content]);

  function toggleTag(tagId: number) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slugEdited) {
      const auto = generateSlug(newTitle);
      if (auto) setSlug(auto);
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value);
    setSlugEdited(true);
  }

  async function handleCreateTag(e: React.FormEvent) {
    e.preventDefault();
    const name = newTagName.trim();
    if (!name) return;
    // 已存在（按名称）则直接选中
    const existing = availableTags.find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      if (!selectedTagIds.includes(existing.id)) {
        setSelectedTagIds((prev) => [...prev, existing.id]);
      }
      setNewTagName("");
      return;
    }
    setCreatingTag(true);
    try {
      const tagSlug = generateTagSlug(name);
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: tagSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ type: "error", msg: data.message || "创建标签失败" });
        return;
      }
      const newTag = data.data as Tag;
      setAvailableTags((prev) => [...prev, newTag]);
      setSelectedTagIds((prev) => [...prev, newTag.id]);
      setNewTagName("");
    } catch {
      setToast({ type: "error", msg: "网络错误，创建标签失败" });
    } finally {
      setCreatingTag(false);
    }
  }

  async function handleSubmit(targetStatus: PostStatus) {
    setError("");
    setToast(null);
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
        coverImage: coverImage || null,
        categoryId,
        status: targetStatus,
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
      setToast({
        type: "success",
        msg: targetStatus === "DRAFT" ? "草稿已保存，正在跳转..." : "已发布，正在跳转...",
      });
      setTimeout(() => {
        router.push("/admin/posts");
        router.refresh();
      }, 800);
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

      {/* 顶部：基础信息 */}
      <div className="mb-6 rounded-xl border border-warm-200 bg-white p-6">
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">标题 *</label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
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
            onChange={handleSlugChange}
            required
            className="w-full rounded-lg border border-warm-200 px-3 py-2 font-mono text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
            placeholder="my-first-post（英文标题会自动生成，中文标题请手动输入）"
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
          <ImageUploader
            label="封面图"
            value={coverImage}
            onChange={setCoverImage}
            aspect="16/9"
            hint="建议尺寸 1600x900，最大 5MB，支持 jpg/png/webp/gif"
          />
        </div>
      </div>

      {/* 中部：左右分栏 编辑 + 实时预览 */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-warm-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">内容 * (Markdown)</label>
            <span className="text-xs text-gray-400">{content.length} 字符</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={24}
            className="w-full rounded-lg border border-warm-200 px-3 py-2 font-mono text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
            placeholder="支持 Markdown 语法..."
          />
        </div>
        <div className="rounded-xl border border-warm-200 bg-white p-6">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">实时预览</label>
            <span className="text-xs text-gray-400">与前台展示效果一致</span>
          </div>
          <div className="max-w-[720px] rounded-lg bg-white">
            {preview.length > 0 ? (
              preview
            ) : (
              <p className="text-sm text-gray-300">在左侧输入 Markdown 内容，预览将实时显示...</p>
            )}
          </div>
        </div>
      </div>

      {/* 底部：分类 / 状态 / 标签 */}
      <div className="mb-6 rounded-xl border border-warm-200 bg-white p-6">
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
            <div className="flex h-[38px] items-center gap-4">
              {STATUS_RADIOS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-1.5 text-sm"
                >
                  <input
                    type="radio"
                    name="status"
                    value={opt.value}
                    checked={status === opt.value}
                    onChange={() => setStatus(opt.value)}
                    className="h-4 w-4 text-brand-500 focus:ring-brand-200"
                  />
                  <span className={opt.color}>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">标签</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-colors ${
                    selected
                      ? "bg-brand-500 text-white"
                      : "bg-warm-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                  }`}
                >
                  {selected && <Check size={12} />}
                  {tag.name}
                </button>
              );
            })}
            {availableTags.length === 0 && (
              <p className="text-xs text-gray-400">暂无标签，可在下方新建</p>
            )}
          </div>

          {/* 内联新建标签 */}
          <form onSubmit={handleCreateTag} className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="输入新标签名称，回车新建"
              className="w-56 rounded-lg border border-warm-200 px-3 py-1.5 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
              disabled={creatingTag}
            />
            <button
              type="submit"
              disabled={creatingTag || !newTagName.trim()}
              className="flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm text-brand-600 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={14} /> {creatingTag ? "创建中..." : "新建并选中"}
            </button>
          </form>

          {selectedTagIds.length > 0 && (
            <p className="mt-2 text-xs text-gray-400">
              已选 {selectedTagIds.length} 个标签
            </p>
          )}
        </div>
      </div>

      {/* 错误 / 提示 */}
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {toast && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <Check size={16} />
          ) : (
            <X size={16} />
          )}
          {toast.msg}
        </div>
      )}

      {/* 操作按钮：独立 [保存草稿] / [直接发布] */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleSubmit("DRAFT")}
          disabled={loading}
          className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "保存中..." : "保存草稿"}
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(status === "DRAFT" ? "PUBLISHED" : status)}
          disabled={loading}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "保存中..." : status === "PINNED" ? "置顶发布" : "直接发布"}
        </button>
        <Link
          href="/admin/posts"
          className="rounded-lg px-6 py-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
        >
          取消
        </Link>
      </div>
    </div>
  );
}
