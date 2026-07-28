import Link from "next/link";
import { Mail, Globe } from "lucide-react";
import { GithubIcon, TwitterIcon, LinkedinIcon } from "@/components/BrandIcons";

interface FooterProps {
  name?: string;
  email?: string | null;
  socialLinks?: Array<{ platform: string; url: string }>;
}

// 根据平台名称返回对应图标
function getPlatformIcon(platform: string) {
  const lower = platform.toLowerCase();
  if (lower.includes("github")) return <GithubIcon size={18} />;
  if (lower.includes("linkedin")) return <LinkedinIcon size={18} />;
  if (lower.includes("twitter") || lower.includes("即刻") || lower.includes("x")) return <TwitterIcon size={18} />;
  if (lower.includes("邮箱") || lower.includes("email") || lower.includes("mail")) return <Mail size={18} />;
  // 小红书 / 其他平台用通用图标
  return <Globe size={18} />;
}

export default function Footer({ name = "yaya", email, socialLinks = [] }: FooterProps) {
  return (
    <footer className="border-t border-cream-200 bg-cream-100/40 backdrop-blur-sm">
      <div className="container-main py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="font-serif text-lg font-semibold text-gray-900">{name}</p>
            <p className="mt-1 text-xs text-gray-500">
              &copy; {new Date().getFullYear()} · 用心生活，持续创造
            </p>
          </div>
          <div className="flex items-center gap-1">
            {socialLinks.map((link) => (
              <Link
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.platform}
                title={link.platform}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-500 transition-all duration-300 ease-soft hover:bg-brand-50 hover:text-brand-600"
              >
                {getPlatformIcon(link.platform)}
              </Link>
            ))}
            {email && (
              <Link
                href={`mailto:${email}`}
                aria-label="发送邮件"
                title="Email"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-500 transition-all duration-300 ease-soft hover:bg-brand-50 hover:text-brand-600"
              >
                <Mail size={18} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
