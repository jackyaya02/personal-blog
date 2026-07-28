"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

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

interface TimelineNodeProps {
  experience: Experience;
  index: number;
}

export default function TimelineNode({ experience: exp, index }: TimelineNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const hasHighlights = exp.highlights && exp.highlights.length > 0;

  return (
    <div
      key={index}
      className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-brand-200 hover:shadow-md"
    >
      <button
        type="button"
        onClick={() => hasHighlights && setExpanded(!expanded)}
        className="flex w-full items-baseline justify-between text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-baseline gap-2">
          <h3 className="font-medium text-gray-900">{exp.title}</h3>
          {exp.projectSlug && (
            <Link
              href={`/projects/${exp.projectSlug}`}
              className="inline-flex items-center gap-0.5 text-xs text-brand-600 hover:text-brand-700"
              onClick={(e) => e.stopPropagation()}
            >
              {exp.projectTitle || "查看项目"} <ExternalLink size={11} />
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{exp.startDate} - {exp.endDate}</span>
          {hasHighlights && (
            <span className="text-gray-400">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          )}
        </div>
      </button>
      <p className="mb-2 mt-1 text-sm font-medium text-gray-500">{exp.company}</p>
      <p className="text-sm text-gray-600">{exp.description}</p>
      {hasHighlights && expanded && (
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-gray-500">
          {exp.highlights.map((h, j) => (
            <li key={j}>{h}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
