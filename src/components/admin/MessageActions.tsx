"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Reply, Archive, Trash2, Loader2 } from "lucide-react";

interface MessageActionsProps {
  messageId: number;
  currentStatus: string;
  email: string;
}

const statusOptions = [
  { value: "READ", label: "标记已读", icon: Reply },
  { value: "REPLIED", label: "标记已回复", icon: Reply },
  { value: "ARCHIVED", label: "归档", icon: Archive },
];

export default function MessageActions({
  messageId,
  currentStatus,
}: MessageActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(status: string) {
    setLoading(status);
    try {
      const res = await fetch(`/api/admin/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    if (!confirm("确定删除这条留言吗？此操作不可恢复。")) return;

    setLoading("DELETE");
    try {
      const res = await fetch(`/api/admin/messages/${messageId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/messages");
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {statusOptions.map((opt) => {
        const Icon = opt.icon;
        const isActive = currentStatus === opt.value;
        const isLoading = loading === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateStatus(opt.value)}
            disabled={isLoading || isActive}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive
                ? "bg-brand-100 text-brand-700"
                : "border border-warm-200 text-gray-600 hover:border-brand-200 hover:text-brand-600"
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Icon size={14} />
            )}
            {opt.label}
          </button>
        );
      })}

      <button
        type="button"
        onClick={handleDelete}
        disabled={loading === "DELETE"}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading === "DELETE" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 size={14} />
        )}
        删除
      </button>
    </div>
  );
}
