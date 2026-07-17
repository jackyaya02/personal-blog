"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function DeletePostButton({
  postId,
  postTitle,
}: {
  postId: number;
  postTitle: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`确定删除文章「${postTitle}」吗？此操作不可撤销。`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("删除失败，请重试");
      }
    } catch {
      alert("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
      title="删除"
    >
      <Trash2 size={16} />
    </button>
  );
}
