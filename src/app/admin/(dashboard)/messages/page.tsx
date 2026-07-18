import Link from "next/link";
import prisma from "@/lib/prisma";
import { Mail, MailOpen, Reply, Archive } from "lucide-react";

export const dynamic = "force-dynamic";

async function getMessages() {
  const [messages, unreadCount] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.contactMessage.count({ where: { status: "UNREAD" } }),
  ]);
  return { messages, unreadCount };
}

const statusConfig: Record<string, { text: string; className: string; icon: typeof Mail }> = {
  UNREAD: { text: "未读", className: "bg-brand-50 text-brand-600", icon: Mail },
  READ: { text: "已读", className: "bg-gray-100 text-gray-600", icon: MailOpen },
  REPLIED: { text: "已回复", className: "bg-emerald-50 text-emerald-600", icon: Reply },
  ARCHIVED: { text: "已归档", className: "bg-warm-100 text-gray-500", icon: Archive },
};

export default async function AdminMessagesPage() {
  const { messages, unreadCount } = await getMessages();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">留言管理</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-brand-600">
              {unreadCount} 条未读留言
            </p>
          )}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-warm-200 bg-white p-12 text-center text-gray-500">
          暂无留言
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const cfg = statusConfig[msg.status] || statusConfig.UNREAD;
            const StatusIcon = cfg.icon;
            return (
              <Link
                key={msg.id}
                href={`/admin/messages/${msg.id}`}
                className={`block rounded-xl border bg-white p-5 transition-all hover:shadow-md ${
                  msg.status === "UNREAD"
                    ? "border-brand-200 hover:border-brand-300"
                    : "border-warm-200 hover:border-brand-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      {msg.status === "UNREAD" && (
                        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                      )}
                      <h3 className={`truncate ${msg.status === "UNREAD" ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                        {msg.subject || `来自 ${msg.name} 的留言`}
                      </h3>
                    </div>
                    <p className="mb-2 line-clamp-2 text-sm text-gray-500">
                      {msg.message}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="font-medium text-gray-600">{msg.name}</span>
                      <span>·</span>
                      <span>{msg.email}</span>
                      <span>·</span>
                      <span>{msg.createdAt.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${cfg.className}`}>
                    <StatusIcon size={12} />
                    {cfg.text}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
