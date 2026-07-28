import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Markdown 渲染器
 * 支持：标题(h1-h3)、无序列表、有序列表、引用块、代码块(带语言标识)、
 *       段落、粗体、斜体、链接、图片
 */
function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // 正则匹配：图片 ![alt](url) / 链接 [text](url) / 粗体 **text** / 斜体 *text* / 行内代码 `code`
  const regex = /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined && match[2] !== undefined) {
      // 图片
      nodes.push(
        // eslint-disable-next-line @next/next/no-img-element
        <img key={`${keyBase}-img-${i}`} src={match[2]} alt={match[1]} className="my-4 mx-auto rounded-lg" />
      );
    } else if (match[3] !== undefined && match[4] !== undefined) {
      // 链接
      nodes.push(
        <Link key={`${keyBase}-a-${i}`} href={match[4]} className="text-brand-600 underline hover:text-brand-700" target="_blank" rel="noopener noreferrer">
          {match[3]}
        </Link>
      );
    } else if (match[5] !== undefined) {
      // 粗体
      nodes.push(<strong key={`${keyBase}-b-${i}`} className="font-semibold text-gray-900">{match[5]}</strong>);
    } else if (match[6] !== undefined) {
      // 斜体
      nodes.push(<em key={`${keyBase}-i-${i}`}>{match[6]}</em>);
    } else if (match[7] !== undefined) {
      // 行内代码
      nodes.push(
        <code key={`${keyBase}-c-${i}`} className="rounded bg-gray-100 px-1.5 py-0.5 text-sm text-brand-700">
          {match[7]}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
    i++;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

export function renderMarkdown(content: string): ReactNode[] {
  if (!content) return [];
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let inCodeBlock = false;
  let codeLang = "";
  let codeLines: string[] = [];
  let unorderedList: string[] = [];
  let orderedList: string[] = [];

  const flushCode = () => {
    if (codeLines.length > 0) {
      const langClass = codeLang ? ` language-${codeLang}` : "";
      elements.push(
        <pre key={`code-${elements.length}`} className="my-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
          <code className={langClass}>{codeLines.join("\n")}</code>
        </pre>
      );
      codeLines = [];
      codeLang = "";
    }
  };

  const flushUnordered = () => {
    if (unorderedList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2 ml-5 list-disc space-y-1 text-gray-600">
          {unorderedList.map((item, idx) => <li key={idx}>{renderInline(item, `ul-${elements.length}-${idx}`)}</li>)}
        </ul>
      );
      unorderedList = [];
    }
  };

  const flushOrdered = () => {
    if (orderedList.length > 0) {
      elements.push(
        <ol key={`ol-${elements.length}`} className="my-2 ml-5 list-decimal space-y-1 text-gray-600">
          {orderedList.map((item, idx) => <li key={idx}>{renderInline(item, `ol-${elements.length}-${idx}`)}</li>)}
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
        codeLang = line.slice(3).trim();
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
      elements.push(<h1 key={i} className="mb-4 mt-8 text-3xl font-bold text-gray-900">{renderInline(line.slice(2), `h1-${i}`)}</h1>);
    } else if (line.startsWith("## ")) {
      flushUnordered();
      flushOrdered();
      elements.push(<h2 key={i} className="mb-3 mt-6 text-xl font-semibold text-gray-900">{renderInline(line.slice(3), `h2-${i}`)}</h2>);
    } else if (line.startsWith("### ")) {
      flushUnordered();
      flushOrdered();
      elements.push(<h3 key={i} className="mb-2 mt-4 text-lg font-medium text-gray-900">{renderInline(line.slice(4), `h3-${i}`)}</h3>);
    } else if (line.startsWith("> ")) {
      flushUnordered();
      flushOrdered();
      elements.push(<blockquote key={i} className="my-4 border-l-4 border-brand-200 bg-brand-50/50 py-2 pl-4 italic text-gray-600">{renderInline(line.slice(2), `bq-${i}`)}</blockquote>);
    } else if (line.startsWith("- ")) {
      flushOrdered();
      unorderedList.push(line.slice(2));
    } else if (line.startsWith("* ") && !line.startsWith("** ")) {
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
        elements.push(<p key={i} className="my-2 leading-relaxed text-gray-600">{renderInline(line, `p-${i}`)}</p>);
      }
    }
  }
  flushUnordered();
  flushOrdered();
  flushCode();
  return elements;
}
