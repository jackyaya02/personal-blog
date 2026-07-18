import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import MessageActions from "@/components/admin/MessageActions";

export const dynamic = "force-dynamic";

async function getMessage(id: number) {
  return prisma.contactMessage.findUnique({ where: { id } });
}

export default async function MessageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const message = await getMessage(Number(params.id));
  if (!message) notFound();

  return (
    <div>
      <Link
        href="/admin/messages"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ArrowLeft size={16} /> 返回留言列表
      </Link>

      <div className="max-w-3xl">
        <div className="rounded-xl border border-warm-200 bg-white p-6">
          {/* 标题 */}
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            {message.subject || `来自 ${message.name} 的留言`}
          </h1>

          {/* 元信息 */}
          <div className="mb-6 border-b border-warm-100 pb-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">姓名</p>
                <p className="font-medium text-gray-900">{message.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">邮箱</p>
                <a
                  href={`mailto:${message.email}`}
                  className="font-medium text-brand-600 hover:underline"
                >
                  {message.email}
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">提交时间</p>
                <p className="text-sm text-gray-700">
                  {message.createdAt.toLocaleString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">状态</p>
                <MessageStatusBadge status={message.status} />
              </div>
            </div>
          </div>

          {/* 留言内容 */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              留言内容
            </h2>
            <div className="whitespace-pre-wrap rounded-lg bg-warm-50 p-4 text-gray-700">
              {message.message}
            </div>
          </div>
        </div>

        {/* 操作区 */}
        <div className="mt-6 rounded-xl border border-warm-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
            操作
          </h2>
          <MessageActions messageId={message.id} currentStatus={message.status} email={message.email} />

          <div className="mt-4 border-t border-warm-100 pt-4">
            <a
              href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject || "您的留言")}`}
              className="btn-primary inline-block"
            >
              通过邮箱回复
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageStatusBadge({ status }: { status: string }) {
  const config: Record<string, { text: string; className: string }> = {
    UNREAD: { text: "未读", className: "bg-brand-50 text-brand-600" },
    READ: { text: "已读", className: "bg-gray-100 text-gray-600" },
    REPLIED: { text: "已回复", className: "bg-emerald-50 text-emerald-600" },
    ARCHIVED: { text: "已归档", className: "bg-warm-100 text-gray-500" },
  };
  const cfg = config[status] || config.UNREAD;
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${cfg.className}`}>
      {cfg.text}
    </span>
  );
}
