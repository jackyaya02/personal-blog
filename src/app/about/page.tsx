import Link from "next/link";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "关于",
};

async function getProfile() {
  return prisma.profile.findFirst({
    include: { socialLinks: { orderBy: { order: "asc" } }, resume: true },
  });
}

export default async function AboutPage() {
  const profile = await getProfile();
  if (!profile) return <div className="py-20 text-center text-gray-500">暂无信息</div>;

  const experiences = Array.isArray(profile.resume?.experiences)
    ? profile.resume!.experiences as Array<{
        company: string; title: string; startDate: string; endDate: string; description: string; highlights: string[];
      }>
    : [];

  const years = [...new Set(experiences.map(exp => exp.startDate.split("-")[0]))].sort((a, b) => parseInt(b) - parseInt(a));

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

          <p className="leading-relaxed text-gray-600">{profile.bio}</p>

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
                    className="rounded-lg border border-warm-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-brand-200 hover:text-brand-600"
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
      {experiences.length > 0 && (
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
                  {experiences
                    .filter((exp) => exp.startDate.startsWith(year))
                    .map((exp, idx) => (
                      <div
                        key={idx}
                        className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-brand-200 hover:shadow-md"
                      >
                        <div className="mb-1 flex items-baseline justify-between">
                          <h3 className="font-medium text-gray-900">{exp.title}</h3>
                          <span className="text-xs text-gray-400">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <p className="mb-2 text-sm font-medium text-gray-500">{exp.company}</p>
                        <p className="text-sm text-gray-600">{exp.description}</p>
                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-gray-500">
                            {exp.highlights.map((h, j) => (
                              <li key={j}>{h}</li>
                            ))}
                          </ul>
                        )}
                      </div>
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
