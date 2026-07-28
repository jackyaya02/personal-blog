import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import PdfDownloadButton from "@/components/PdfDownloadButton";

export const metadata: Metadata = {
  title: "简历",
  description: "工作经历、教育背景与技能",
  openGraph: {
    title: "简历",
    description: "工作经历、教育背景与技能",
    type: "profile",
  },
};

async function getResume() {
  const profile = await prisma.profile.findFirst({
    include: { resume: true },
  });
  return profile?.resume ?? null;
}

export default async function ResumePage() {
  const resume = await getResume();
  if (!resume) return <div className="py-20 text-center text-gray-500">暂无简历信息</div>;

  const rawExperiences = Array.isArray(resume.experiences) ? resume.experiences as Array<{
    company: string; title: string; startDate: string; endDate: string; description: string; highlights: string[];
  }> : [];
  // 按时间倒序排序（先按 endDate 降序，再按 startDate 降序）
  const experiences = [...rawExperiences].sort((a, b) => {
    const aEnd = a.endDate || "9999";
    const bEnd = b.endDate || "9999";
    if (aEnd !== bEnd) return bEnd.localeCompare(aEnd);
    return (b.startDate || "").localeCompare(a.startDate || "");
  });
  const education = Array.isArray(resume.education) ? resume.education as Array<{
    school: string; major: string; degree: string; startDate: string; endDate: string;
  }> : [];
  const skills = Array.isArray(resume.skills) ? resume.skills as Array<{ name: string; level: string }> : [];

  const levelColor: Record<string, string> = {
    "专家": "bg-brand-100 text-brand-700",
    "精通": "bg-brand-50 text-brand-600",
    "熟练": "bg-warm-100 text-gray-700",
    "了解": "bg-warm-100 text-gray-600",
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">简历</h1>
        <PdfDownloadButton />
      </div>

      {resume.summary && (
        <p className="mb-10 leading-relaxed text-gray-600">{resume.summary}</p>
      )}

      {/* 工作经历 */}
      <section className="mb-10">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">工作经历</h2>
        <div className="relative space-y-8 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-2rem)] before:w-0.5 before:bg-gray-200">
          {experiences.map((exp, i) => (
            <div key={i} className="relative pl-8">
              <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-brand-300 bg-white" />
              <div className="rounded-lg border border-gray-100 bg-white p-4 transition-colors hover:border-gray-200">
                <div className="mb-1 flex items-baseline justify-between">
                  <h3 className="font-medium text-gray-900">{exp.title}</h3>
                  <span className="text-sm text-gray-400">{exp.startDate} - {exp.endDate}</span>
                </div>
                <p className="mb-2 text-sm font-medium text-gray-500">{exp.company}</p>
                <p className="mb-2 text-sm text-gray-600">{exp.description}</p>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-inside list-disc space-y-1 text-sm text-gray-500">
                    {exp.highlights.map((h, j) => <li key={j}>{h}</li>)}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 教育 */}
      <section className="mb-10">
        <h2 className="mb-6 text-xl font-semibold text-gray-900">教育</h2>
        <div className="space-y-4">
          {education.map((edu, i) => (
            <div key={i} className="rounded-lg border border-gray-100 bg-white p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="font-medium text-gray-900">{edu.school}</h3>
                <span className="text-sm text-gray-400">{edu.startDate} - {edu.endDate}</span>
              </div>
              <p className="text-sm text-gray-500">{edu.major} · {edu.degree}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 技能 */}
      <section>
        <h2 className="mb-6 text-xl font-semibold text-gray-900">技能</h2>
        <div className="flex flex-wrap gap-3">
          {skills.map((skill, i) => (
            <span
              key={i}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${levelColor[skill.level] || "bg-gray-100 text-gray-700"}`}
            >
              {skill.name} · {skill.level}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
