import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Mail, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "联系",
};

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
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900">联系我</h1>
      <p className="mb-10 text-gray-600">
        有任何想法或合作意向，欢迎通过以下方式联系我。
      </p>

      <div className="space-y-6">
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
              <ExternalLink size={20} className="text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{link.platform}</p>
              <p className="text-sm text-gray-500">{link.url.replace(/^https?:\/\//, "")}</p>
            </div>
            <ExternalLink size={16} className="text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
