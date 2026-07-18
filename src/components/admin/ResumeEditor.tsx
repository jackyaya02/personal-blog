"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface Experience {
  company?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  highlights?: string[];
}

interface Education {
  school?: string;
  major?: string;
  degree?: string;
  startDate?: string;
  endDate?: string;
}

interface Skill {
  name?: string;
  level?: string;
}

interface ResumeData {
  id?: number;
  summary?: string | null;
  experiences?: Experience[];
  education?: Education[];
  skills?: Skill[];
}

export default function ResumeEditor({ initialResume }: { initialResume?: ResumeData }) {
  const router = useRouter();

  const [summary, setSummary] = useState(initialResume?.summary || "");
  const [experiences, setExperiences] = useState<Experience[]>(
    initialResume?.experiences || []
  );
  const [education, setEducation] = useState<Education[]>(
    initialResume?.education || []
  );
  const [skills, setSkills] = useState<Skill[]>(initialResume?.skills || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 经历操作
  function addExperience() {
    setExperiences([
      ...experiences,
      { company: "", title: "", startDate: "", endDate: "", description: "", highlights: [] },
    ]);
  }
  function updateExperience(idx: number, field: keyof Experience, value: any) {
    const next = [...experiences];
    (next[idx] as any)[field] = value;
    setExperiences(next);
  }
  function removeExperience(idx: number) {
    setExperiences(experiences.filter((_, i) => i !== idx));
  }

  // 教育操作
  function addEducation() {
    setEducation([...education, { school: "", major: "", degree: "", startDate: "", endDate: "" }]);
  }
  function updateEducation(idx: number, field: keyof Education, value: string) {
    const next = [...education];
    (next[idx] as any)[field] = value;
    setEducation(next);
  }
  function removeEducation(idx: number) {
    setEducation(education.filter((_, i) => i !== idx));
  }

  // 技能操作
  function addSkill() {
    setSkills([...skills, { name: "", level: "" }]);
  }
  function updateSkill(idx: number, field: keyof Skill, value: string) {
    const next = [...skills];
    (next[idx] as any)[field] = value;
    setSkills(next);
  }
  function removeSkill(idx: number) {
    setSkills(skills.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/resume", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: summary || null,
          experiences,
          education,
          skills,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "保存失败");
        return;
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-warm-200 px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200";

  return (
    <div>
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ArrowLeft size={16} /> 返回仪表板
      </Link>

      <h1 className="mb-8 text-2xl font-bold text-gray-900">简历管理</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* 个人总结 */}
        <div className="rounded-xl border border-warm-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">个人总结</h2>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            className={inputCls}
            placeholder="一段话总结你的经验和优势..."
          />
        </div>

        {/* 工作经历 */}
        <div className="rounded-xl border border-warm-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">工作经历</h2>
            <button
              type="button"
              onClick={addExperience}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus size={16} /> 添加经历
            </button>
          </div>
          {experiences.length === 0 ? (
            <p className="text-sm text-gray-400">暂无工作经历</p>
          ) : (
            <div className="space-y-4">
              {experiences.map((exp, idx) => (
                <div key={idx} className="rounded-lg border border-warm-100 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">经历 #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={exp.company || ""}
                      onChange={(e) => updateExperience(idx, "company", e.target.value)}
                      className={inputCls}
                      placeholder="公司"
                    />
                    <input
                      type="text"
                      value={exp.title || ""}
                      onChange={(e) => updateExperience(idx, "title", e.target.value)}
                      className={inputCls}
                      placeholder="职位"
                    />
                    <input
                      type="text"
                      value={exp.startDate || ""}
                      onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                      className={inputCls}
                      placeholder="开始时间 2024.01"
                    />
                    <input
                      type="text"
                      value={exp.endDate || ""}
                      onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                      className={inputCls}
                      placeholder="结束时间 2024.06 或 至今"
                    />
                  </div>
                  <textarea
                    value={exp.description || ""}
                    onChange={(e) => updateExperience(idx, "description", e.target.value)}
                    rows={2}
                    className={`mt-3 ${inputCls}`}
                    placeholder="工作描述"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 教育经历 */}
        <div className="rounded-xl border border-warm-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">教育经历</h2>
            <button
              type="button"
              onClick={addEducation}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus size={16} /> 添加教育
            </button>
          </div>
          {education.length === 0 ? (
            <p className="text-sm text-gray-400">暂无教育经历</p>
          ) : (
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="rounded-lg border border-warm-100 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">教育 #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={edu.school || ""}
                      onChange={(e) => updateEducation(idx, "school", e.target.value)}
                      className={inputCls}
                      placeholder="学校"
                    />
                    <input
                      type="text"
                      value={edu.major || ""}
                      onChange={(e) => updateEducation(idx, "major", e.target.value)}
                      className={inputCls}
                      placeholder="专业"
                    />
                    <input
                      type="text"
                      value={edu.degree || ""}
                      onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                      className={inputCls}
                      placeholder="学位 本科/硕士"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={edu.startDate || ""}
                        onChange={(e) => updateEducation(idx, "startDate", e.target.value)}
                        className={inputCls}
                        placeholder="开始"
                      />
                      <input
                        type="text"
                        value={edu.endDate || ""}
                        onChange={(e) => updateEducation(idx, "endDate", e.target.value)}
                        className={inputCls}
                        placeholder="结束"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 技能 */}
        <div className="rounded-xl border border-warm-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">技能</h2>
            <button
              type="button"
              onClick={addSkill}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus size={16} /> 添加技能
            </button>
          </div>
          {skills.length === 0 ? (
            <p className="text-sm text-gray-400">暂无技能</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {skills.map((skill, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={skill.name || ""}
                    onChange={(e) => updateSkill(idx, "name", e.target.value)}
                    className={inputCls}
                    placeholder="技能名称"
                  />
                  <input
                    type="text"
                    value={skill.level || ""}
                    onChange={(e) => updateSkill(idx, "level", e.target.value)}
                    className={`${inputCls} sm:w-32`}
                    placeholder="熟练度"
                  />
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        {success && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
            保存成功
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "保存中..." : "保存简历"}
        </button>
      </form>
    </div>
  );
}
