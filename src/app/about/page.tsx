import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { renderMarkdown } from "@/lib/markdown";
import TimelineNode from "@/components/TimelineNode";

export const metadata: Metadata = {
  title: "关于",
  description: "了解我更多 — 个人介绍、技能与职业经历",
  openGraph: {
    title: "关于我",
    description: "了解我更多 — 个人介绍、技能与职业经历",
    type: "profile",
  },
};

interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
  projectSlug?: string;
  projectTitle?: string;
}

async function getProfile() {
  return prisma.profile.findFirst({
    include: { socialLinks: { orderBy: { order: "asc" } }, resume: true },
  });
}

export default async function AboutPage() {
  const profile = await getProfile();
  if (!profile) return <div className="py-20 text-center text-gray-500">暂无信息</div>;

  const experiences: Experience[] = Array.isArray(profile.resume?.experiences)
    ? (profile.resume!.experiences as unknown as Experience[])
    : [];

  // 按时间倒序排序（先按 endDate 降序，再按 startDate 降序）
  const sortedExperiences = [...experiences].sort((a, b) => {
    const aEnd = a.endDate || "9999";
    const bEnd = b.endDate || "9999";
    if (aEnd !== bEnd) return bEnd.localeCompare(aEnd);
    return (b.startDate || "").localeCompare(a.startDate || "");
  });

  const years = [...new Set(sortedExperiences.map((exp) => exp.startDate.split("-")[0]))].sort(
    (a, b) => parseInt(b) - parseInt(a)
  );

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">关于我</h1>

      <div className="grid gap-12 md:grid-cols-[200px_1fr]">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-5xl font-bold text-gray-400">
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar}
                alt={profile.name || "头像"}
                className="h-full w-full object-cover"
              />
            ) : (
              profile.name?.charAt(0) || "?"
            )}
          </div>
          {profile.location && (
            <span className="text-sm text-gray-500">{profile.location}</span>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{profile.name}</h2>
            <p className="text-gray-500">{profile.title}</p>
          </div>

          {/* 个人介绍：Markdown 渲染 */}
          {profile.bio && (
            <div className="leading-relaxed text-gray-600 [&_a]:text-brand-600 [&_a]:underline [&_h1]:mb-3 [&_h1]:mt-4 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-lg [&_h2]:font-medium [&_p]:my-2 [&_ul]:my-2 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1">
              {renderMarkdown(profile.bio)}
            </div>
          )}

          {/* Skills */}
          {profile.resume?.skills && Array.isArray(profile.resume.skills) && profile.resume.skills.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">技能</h3>
              <div className="flex flex-wrap gap-2">
                {(profile.resume.skills as Array<{ name: string; level: string }>).map((skill) => (
                  <span
                    key={skill.name}
                    className="tag text-sm"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {profile.socialLinks.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">社交</h3>
              <div className="flex flex-wrap gap-3">
                {profile.socialLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center rounded-lg border border-warm-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-brand-200 hover:text-brand-600"
                  >
                    {link.platform}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {profile.email && (
            <Link
              href={`mailto:${profile.email}`}
              className="btn-primary inline-block"
            >
              发送邮件
            </Link>
          )}
        </div>
      </div>

      {/* Timeline */}
      {sortedExperiences.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-8 text-xl font-semibold text-gray-900">职业时间线</h2>
          <div className="relative">
            <div className="absolute left-[29px] top-0 h-full w-0.5 bg-gray-200" />
            {years.map((year) => (
              <div key={year} className="mb-8">
                <div className="mb-4 flex items-center">
                  <div className="z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-300 bg-white">
                    <span className="text-sm font-bold text-brand-600">{year}</span>
                  </div>
                  <span className="ml-4 text-lg font-semibold text-gray-900">{year}年</span>
                </div>
                <div className="ml-16 space-y-4">
                  {sortedExperiences
                    .filter((exp) => exp.startDate.startsWith(year))
                    .map((exp, idx) => (
                      <TimelineNode key={idx} experience={exp} index={idx} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
