"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit3 } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { posts: number };
}

export default function CategoriesManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDesc, setEditDesc] = useState("");

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
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "创建失败");
        return;
      }
      setCategories([...categories, { ...data.data, _count: { posts: 0 } }]);
      setName(""); setSlug(""); setDescription("");
      setShowAdd(false);
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDesc(cat.description || "");
    setError("");
  }

  async function handleSaveEdit(id: number) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          slug: editSlug,
          description: editDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "保存失败");
        return;
      }
      setCategories(categories.map((c) => (c.id === id ? { ...c, ...data.data } : c)));
      setEditingId(null);
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, name: string, count: number) {
    if (count > 0) {
      setError(`「${name}」下有 ${count} 篇文章，请先转移或删除文章`);
      return;
    }
    if (!confirm(`确定删除分类「${name}」吗？`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "删除失败");
        return;
      }
      setCategories(categories.filter((c) => c.id !== id));
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
        <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> 新建分类
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
                placeholder="技术笔记"
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
                placeholder="tech"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">描述</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputCls}
              placeholder="可选"
            />
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

      {categories.length === 0 ? (
        <div className="rounded-xl border border-warm-200 bg-white p-12 text-center text-gray-500">
          暂无分类
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-warm-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-warm-200 bg-warm-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">描述</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">文章数</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-warm-50">
                  {editingId === cat.id ? (
                    <td colSpan={5} className="px-4 py-3">
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
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className={`mt-2 ${inputCls}`}
                        placeholder="描述"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(cat.id)}
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
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{cat.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{cat.slug}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{cat.description || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{cat._count?.posts || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(cat)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-warm-100 hover:text-brand-600"
                            title="编辑"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name, cat._count?.posts || 0)}
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
