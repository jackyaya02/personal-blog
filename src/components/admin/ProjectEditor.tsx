"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ImageUploader from "./ImageUploader";
import MultiImageUploader from "./MultiImageUploader";

interface ProjectData {
  id?: number;
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  role?: string | null;
  duration?: string | null;
  url?: string | null;
  coverImage?: string | null;
  images?: string[] | null;
  status?: string;
  featured?: boolean;
  order?: number;
}

export default function ProjectEditor({ project }: { project?: ProjectData }) {
  const router = useRouter();
  const isEdit = !!project?.id;

  const [title, setTitle] = useState(project?.title || "");
  const [slug, setSlug] = useState(project?.slug || "");
  const [description, setDescription] = useState(project?.description || "");
  const [content, setContent] = useState(project?.content || "");
  const [role, setRole] = useState(project?.role || "");
  const [duration, setDuration] = useState(project?.duration || "");
  const [url, setUrl] = useState(project?.url || "");
  const [coverImage, setCoverImage] = useState(project?.coverImage || "");
  const [images, setImages] = useState<string[]>(
    Array.isArray(project?.images) ? project!.images! : []
  );
  const [status, setStatus] = useState(project?.status || "DRAFT");
  const [featured, setFeatured] = useState(project?.featured || false);
  const [order, setOrder] = useState(project?.order ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title || !slug || !description || !content) {
      setError("标题、slug、描述、内容为必填");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        slug,
        description,
        content,
        role: role || null,
        duration: duration || null,
        url: url || null,
        coverImage: coverImage || null,
        images,
        status,
        featured,
        order: Number(order),
      };

      const apiUrl = isEdit ? `/api/admin/projects/${project!.id}` : "/api/admin/projects";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "保存失败");
        return;
      }
      router.push("/admin/projects");
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
        href="/admin/projects"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ArrowLeft size={16} /> 返回作品列表
      </Link>

      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        {isEdit ? "编辑作品" : "新建作品"}
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
              placeholder="作品标题"
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
              placeholder="my-project"
            />
            <p className="mt-1 text-xs text-gray-400">将用于 /projects/{slug || "..."}</p>
          </div>

          <div className="mb-4">
            <ImageUploader
              label="封面图"
              value={coverImage}
              onChange={setCoverImage}
              aspect="16/10"
              hint="建议尺寸 1600x1000，最大 5MB，支持 jpg/png/webp/gif"
            />
          </div>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">角色</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
                placeholder="产品经理"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">时长</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
                placeholder="2024.01 - 2024.06"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">链接</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
              placeholder="https://..."
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">简短描述 *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
              className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
              placeholder="一句话描述作品"
            />
          </div>

          <div className="mb-4">
            <MultiImageUploader
              label="作品图片集"
              value={images}
              onChange={setImages}
              aspect="16/10"
              max={10}
              hint="最多 10 张图片，每张最大 5MB，支持 jpg/png/webp/gif。可拖拽缩略图左右箭头调整顺序"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">详细内容 *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={14}
              className="w-full rounded-lg border border-warm-200 px-3 py-2 font-mono text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
              placeholder="支持 Markdown 语法..."
            />
          </div>
        </div>

        <div className="rounded-xl border border-warm-200 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">状态</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
              >
                <option value="DRAFT">草稿</option>
                <option value="PUBLISHED">已发布</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">排序</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
              />
              <p className="mt-1 text-xs text-gray-400">数字越小越靠前</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">精选</label>
              <label className="flex h-[38px] cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-warm-300 text-brand-500 focus:ring-brand-200"
                />
                <span className="text-sm text-gray-600">设为精选作品</span>
              </label>
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
            {loading ? "保存中..." : isEdit ? "保存修改" : "创建作品"}
          </button>
          <Link href="/admin/projects" className="btn-secondary">
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
