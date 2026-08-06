import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Mail, Globe, MessageSquare } from "lucide-react";
import { GithubIcon, TwitterIcon, LinkedinIcon } from "@/components/BrandIcons";
import ContactForm from "@/components/ContactForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "联系",
  description: "通过邮箱或社交平台联系我，或在线留言",
  openGraph: {
    title: "联系我",
    description: "通过邮箱或社交平台联系我，或在线留言",
    type: "website",
  },
};

// 根据平台名称返回对应图标
function getPlatformIcon(platform: string) {
  const lower = platform.toLowerCase();
  if (lower.includes("github")) return <GithubIcon size={20} />;
  if (lower.includes("linkedin")) return <LinkedinIcon size={20} />;
  if (lower.includes("twitter") || lower.includes("即刻") || lower.includes("x")) return <TwitterIcon size={20} />;
  if (lower.includes("邮箱") || lower.includes("email") || lower.includes("mail")) return <Mail size={20} />;
  // 小红书 / 其他平台用通用图标
  return <Globe size={20} />;
}

async function getContact() {
  const profile = await prisma.profile.findFirst({
    include: { socialLinks: { orderBy: { order: "asc" } } },
  });
  return profile;
}

export default async function ContactPage() {
  const profile = await getContact();
  if (!profile) return <div className="py-20 text-center text-gray-500">暂无信息</div>;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">联系我</h1>
      <p className="mb-10 text-gray-600">
        有任何想法或合作意向，欢迎通过以下方式联系我，或直接在右侧留言。
      </p>

      <div className="grid gap-10 md:grid-cols-2">
        {/* 左侧：联系方式 */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
            <Mail size={16} /> 联系方式
          </div>

          {profile.email && (
            <Link
              href={`mailto:${profile.email}`}
              className="flex items-center gap-4 rounded-lg border border-warm-200 p-4 transition-colors hover:border-brand-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-100">
                <Mail size={20} className="text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">邮箱</p>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </Link>
          )}

          {profile.socialLinks.map((link) => (
            <Link
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-lg border border-warm-200 p-4 transition-colors hover:border-brand-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warm-100">
                {getPlatformIcon(link.platform)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{link.platform}</p>
                <p className="text-sm text-gray-500">{link.url.replace(/^https?:\/\//, "")}</p>
              </div>
            </Link>
          ))}

          {profile.location && (
            <div className="rounded-lg bg-warm-50 p-4 text-sm text-gray-600">
              当前所在地：{profile.location}
            </div>
          )}
        </div>

        {/* 右侧：留言表单 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
            <MessageSquare size={16} /> 在线留言
          </div>
          <div className="rounded-xl border border-warm-200 bg-white p-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
