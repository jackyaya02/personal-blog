"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit3 } from "lucide-react";

interface Tag {
  id: number;
  name: string;
  slug: string;
  _count?: { postTags: number };
}

export default function TagsManager({
  initialTags,
}: {
  initialTags: Tag[];
}) {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name || !slug) {
      setError("名称和 slug 为必填");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "创建失败");
        return;
      }
      setTags([...tags, { ...data.data, _count: { postTags: 0 } }].sort((a, b) =>
        a.name.localeCompare(b.name)
      ));
      setName(""); setSlug("");
      setShowAdd(false);
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(tag: Tag) {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditSlug(tag.slug);
    setError("");
  }

  async function handleSaveEdit(id: number) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, slug: editSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "保存失败");
        return;
      }
      setTags(
        tags
          .map((t) => (t.id === id ? { ...t, ...data.data } : t))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`确定删除标签「${name}」吗？关联将一并移除。`)) return;
    try {
      const res = await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "删除失败");
        return;
      }
      setTags(tags.filter((t) => t.id !== id));
      router.refresh();
    } catch {
      setError("网络错误");
    }
  }

  const inputCls =
    "w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200";

  return (
    <div>
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ArrowLeft size={16} /> 返回仪表板
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">标签管理</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> 新建标签
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="mb-6 rounded-xl border border-warm-200 bg-white p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">名称 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputCls}
                placeholder="Next.js"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className={inputCls}
                placeholder="nextjs"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
              {loading ? "创建中..." : "创建"}
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">
              取消
            </button>
          </div>
        </form>
      )}

      {tags.length === 0 ? (
        <div className="rounded-xl border border-warm-200 bg-white p-12 text-center text-gray-500">
          暂无标签
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-warm-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-warm-200 bg-warm-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">文章数</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-warm-50">
                  {editingId === tag.id ? (
                    <td colSpan={4} className="px-4 py-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={inputCls}
                          placeholder="名称"
                        />
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className={inputCls}
                          placeholder="slug"
                        />
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(tag.id)}
                          disabled={loading}
                          className="btn-primary disabled:opacity-60"
                        >
                          {loading ? "保存中..." : "保存"}
                        </button>
                        <button onClick={() => setEditingId(null)} className="btn-secondary">
                          取消
                        </button>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{tag.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{tag.slug}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{tag._count?.postTags || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(tag)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-warm-100 hover:text-brand-600"
                            title="编辑"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(tag.id, tag.name)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            title="删除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
