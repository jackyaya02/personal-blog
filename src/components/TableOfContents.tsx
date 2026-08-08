"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, List } from "lucide-react";
import type { HeadingItem } from "@/lib/markdown";

interface Props {
  headings: HeadingItem[];
}

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const [expanded, setExpanded] = useState(true);

  // Scroll spy: track which heading is in view
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden lg:block">
      {/* Header with toggle */}
      <div
        className="mb-3 flex cursor-pointer items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400 select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <List size={14} />
        目录
        <span className="ml-auto">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </div>

      {/* TOC items */}
      {expanded && (
        <ul className="space-y-0.5 border-l border-gray-200 pl-3">
          {headings.map((h) => (
            <li key={h.id}>
              <button
                onClick={() => handleClick(h.id)}
                className={`block w-full py-1 text-left text-sm leading-snug transition-colors hover:text-brand-600 ${
                  h.level === 3 ? "pl-4" : ""
                } ${
                  activeId === h.id
                    ? "font-medium text-brand-600"
                    : "text-gray-500"
                }`}
                title={h.text}
              >
                <span className="line-clamp-2">{h.text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
