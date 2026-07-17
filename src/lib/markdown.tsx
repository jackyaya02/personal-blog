import type { ReactNode } from "react";

/**
 * 简易 Markdown 渲染器
 * 支持：标题(h1-h3)、无序列表、有序列表、引用块、代码块、段落
 */
export function renderMarkdown(content: string): ReactNode[] {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let unorderedList: string[] = [];
  let orderedList: string[] = [];

  const flushCode = () => {
    if (codeLines.length > 0) {
      elements.push(
        <pre key={`code-${elements.length}`} className="my-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      codeLines = [];
    }
  };

  const flushUnordered = () => {
    if (unorderedList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2 ml-5 list-disc space-y-1 text-gray-600">
          {unorderedList.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      );
      unorderedList = [];
    }
  };

  const flushOrdered = () => {
    if (orderedList.length > 0) {
      elements.push(
        <ol key={`ol-${elements.length}`} className="my-2 ml-5 list-decimal space-y-1 text-gray-600">
          {orderedList.map((item, idx) => <li key={idx}>{item}</li>)}
        </ol>
      );
      orderedList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      flushUnordered();
      flushOrdered();
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        flushCode();
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }
    if (line.startsWith("# ")) {
      flushUnordered();
      flushOrdered();
      elements.push(<h1 key={i} className="mb-4 mt-8 text-3xl font-bold text-gray-900">{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      flushUnordered();
      flushOrdered();
      elements.push(<h2 key={i} className="mb-3 mt-6 text-xl font-semibold text-gray-900">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      flushUnordered();
      flushOrdered();
      elements.push(<h3 key={i} className="mb-2 mt-4 text-lg font-medium text-gray-900">{line.slice(4)}</h3>);
    } else if (line.startsWith("> ")) {
      flushUnordered();
      flushOrdered();
      elements.push(<blockquote key={i} className="my-4 border-l-4 border-brand-200 bg-brand-50/50 py-2 pl-4 italic text-gray-600">{line.slice(2)}</blockquote>);
    } else if (line.startsWith("- ")) {
      flushOrdered();
      unorderedList.push(line.slice(2));
    } else if (line.trim() === "") {
      flushUnordered();
      flushOrdered();
    } else {
      const numMatch = line.match(/^\d+\.\s(.+)/);
      if (numMatch) {
        flushUnordered();
        orderedList.push(numMatch[1]);
      } else {
        flushUnordered();
        flushOrdered();
        elements.push(<p key={i} className="my-2 leading-relaxed text-gray-600">{line}</p>);
      }
    }
  }
  flushUnordered();
  flushOrdered();
  flushCode();
  return elements;
}
