"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit3, X } from "lucide-react";

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon?: string | null;
  order: number;
}

export default function SocialLinksManager({
  initialLinks,
}: {
  initialLinks: SocialLink[];
}) {
  const router = useRouter();
  const [links, setLinks] = useState(initialLinks);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // 新建表单
  const [platform, setPlatform] = useState("");
  const [url, setUrl] = useState("");
  const [order, setOrder] = useState(0);

  // 编辑表单
  const [editPlatform, setEditPlatform] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editOrder, setEditOrder] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!platform || !url) {
      setError("平台名称和 URL 为必填");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, url, order }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "创建失败");
        return;
      }
      setLinks([...links, data.data]);
      setPlatform("");
      setUrl("");
      setOrder(0);
      setShowAdd(false);
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(link: SocialLink) {
    setEditingId(link.id);
    setEditPlatform(link.platform);
    setEditUrl(link.url);
    setEditOrder(link.order);
    setError("");
  }

  async function handleSaveEdit(id: number) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/social/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: editPlatform,
          url: editUrl,
          order: editOrder,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "保存失败");
        return;
      }
      setLinks(links.map((l) => (l.id === id ? data.data : l)));
      setEditingId(null);
      router.refresh();
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, platform: string) {
    if (!confirm(`确定删除「${platform}」吗？`)) return;
    try {
      const res = await fetch(`/api/admin/social/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLinks(links.filter((l) => l.id !== id));
        router.refresh();
      }
    } catch {
      setError("网络错误");
    }
  }

  return (
    <div>
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ArrowLeft size={16} /> 返回仪表板
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">社交链接</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> 添加链接
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
          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">平台 *</label>
              <input
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                required
                className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
                placeholder="GitHub"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">URL *</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">排序</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
              {loading ? "创建中..." : "创建"}
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="btn-secondary"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {links.length === 0 ? (
        <div className="rounded-xl border border-warm-200 bg-white p-12 text-center text-gray-500">
          暂无社交链接，点击右上角添加
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="rounded-xl border border-warm-200 bg-white p-4"
            >
              {editingId === link.id ? (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      type="text"
                      value={editPlatform}
                      onChange={(e) => setEditPlatform(e.target.value)}
                      className="rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
                      placeholder="平台"
                    />
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
                      placeholder="URL"
                    />
                    <input
                      type="number"
                      value={editOrder}
                      onChange={(e) => setEditOrder(Number(e.target.value))}
                      className="rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
                      placeholder="排序"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(link.id)}
                      disabled={loading}
                      className="btn-primary disabled:opacity-60"
                    >
                      {loading ? "保存中..." : "保存"}
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-secondary">
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{link.platform}</span>
                    <span className="ml-3 text-sm text-gray-500">{link.url}</span>
                    <span className="ml-3 rounded bg-warm-100 px-2 py-0.5 text-xs text-gray-600">
                      排序: {link.order}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(link)}
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-warm-100 hover:text-brand-600"
                      title="编辑"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id, link.platform)}
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
