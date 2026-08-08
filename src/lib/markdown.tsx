import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Markdown 渲染器
 * 支持：标题(h1-h3)、无序列表、有序列表、引用块、代码块(带语言标识)、
 *       表格(GFM)、段落、粗体、斜体、链接、图片、行内代码
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

const slugify = (text: string) => text.replace(/<[^>]*>/g, "").replace(/[^\w\u4e00-\u9fff\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);

// 切分表格行："| 模块 | 说明 |"  → ["模块", "说明"]
function splitTableRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((cell) => cell.replace(/\\\|/g, "|").trim());
}

// 判断是否为分隔行（| --- | :-- | --: | :---: |），并返回每列对齐方式
function parseSeparatorRow(line: string): ("left" | "center" | "right")[] | null {
  if (!line.includes("|")) return null;
  const cells = splitTableRow(line);
  if (cells.length === 0) return null;
  const aligns: ("left" | "center" | "right")[] = [];
  for (const cell of cells) {
    const c = cell.trim();
    if (!/^:?-{3,}:?$/.test(c)) return null;
    const left = c.startsWith(":");
    const right = c.endsWith(":");
    if (left && right) aligns.push("center");
    else if (right) aligns.push("right");
    else aligns.push("left");
  }
  return aligns;
}

function alignClass(align: "left" | "center" | "right"): string {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
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

  // 表格累积状态
  let tableHeader: string[] | null = null;
  let tableAligns: ("left" | "center" | "right")[] | null = null;
  let tableBody: string[][] = [];

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

  const flushLists = () => {
    flushUnordered();
    flushOrdered();
  };

  const flushTable = () => {
    if (!tableHeader || !tableAligns) return;
    const colCount = Math.max(tableHeader.length, tableAligns.length, ...tableBody.map((r) => r.length));
    const header = [...tableHeader];
    const body = tableBody.map((row) => [...row]);
    const aligns = [...tableAligns];
    while (header.length < colCount) header.push("");
    while (aligns.length < colCount) aligns.push("left");
    for (const row of body) while (row.length < colCount) row.push("");

    const tableIdx = elements.length;
    elements.push(
      <div key={`table-wrap-${tableIdx}`} className="my-6 overflow-x-auto rounded-xl border border-warm-200 bg-white shadow-card-sm">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-brand-50/70">
              {header.map((cell, idx) => (
                <th
                  key={`th-${idx}`}
                  className={`border-b border-warm-200 px-4 py-3 font-semibold text-gray-900 ${alignClass(aligns[idx])}`}
                >
                  {renderInline(cell, `tbl-${tableIdx}-th-${idx}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rIdx) => (
              <tr key={`tr-${rIdx}`} className={rIdx % 2 === 1 ? "bg-warm-50/40" : ""}>
                {row.map((cell, cIdx) => (
                  <td
                    key={`td-${rIdx}-${cIdx}`}
                    className={`border-b border-warm-100 px-4 py-3 align-top text-gray-600 last:border-b-0 ${alignClass(aligns[cIdx])}`}
                  >
                    {renderInline(cell, `tbl-${tableIdx}-td-${rIdx}-${cIdx}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    tableHeader = null;
    tableAligns = null;
    tableBody = [];
  };

  // 在切换任何块级元素之前，先 flush 所有累积结构
  const flushAllBlocks = () => {
    flushLists();
    flushTable();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      flushAllBlocks();
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

    // 表格开始/继续判定
    const trimmed = line.trim();
    if (trimmed !== "" && trimmed.includes("|")) {
      // 正在表格中，继续累积 body
      if (tableHeader !== null && tableAligns !== null) {
        tableBody.push(splitTableRow(line));
        continue;
      }
      // 还不在表格中：尝试「表头 + 下一行分隔」组合（GFM 标准）
      const nextLine = lines[i + 1];
      if (nextLine !== undefined) {
        const aligns = parseSeparatorRow(nextLine);
        if (aligns !== null) {
          const headerCells = splitTableRow(line);
          if (headerCells.length > 0 && headerCells.length === aligns.length) {
            flushAllBlocks();
            tableHeader = headerCells;
            tableAligns = aligns;
            tableBody = [];
            i++; // 跳过已消费的分隔行
            continue;
          }
        }
      }
    }

    if (line.startsWith("# ")) {
      flushAllBlocks();
      elements.push(<h1 key={i} id={slugify(line.slice(2))} className="mb-4 mt-8 scroll-mt-20 text-3xl font-bold text-gray-900">{renderInline(line.slice(2), `h1-${i}`)}</h1>);
    } else if (line.startsWith("## ")) {
      flushAllBlocks();
      elements.push(<h2 key={i} id={slugify(line.slice(3))} className="mb-3 mt-6 scroll-mt-20 text-xl font-semibold text-gray-900">{renderInline(line.slice(3), `h2-${i}`)}</h2>);
    } else if (line.startsWith("### ")) {
      flushAllBlocks();
      elements.push(<h3 key={i} id={slugify(line.slice(4))} className="mb-2 mt-4 scroll-mt-20 text-lg font-medium text-gray-900">{renderInline(line.slice(4), `h3-${i}`)}</h3>);
    } else if (line.startsWith("> ")) {
      flushAllBlocks();
      elements.push(<blockquote key={i} className="my-4 border-l-4 border-brand-200 bg-brand-50/50 py-2 pl-4 italic text-gray-600">{renderInline(line.slice(2), `bq-${i}`)}</blockquote>);
    } else if (line.startsWith("- ")) {
      flushTable();
      flushOrdered();
      unorderedList.push(line.slice(2));
    } else if (line.startsWith("* ") && !line.startsWith("** ")) {
      flushTable();
      flushOrdered();
      unorderedList.push(line.slice(2));
    } else if (trimmed === "") {
      flushAllBlocks();
    } else {
      const numMatch = line.match(/^\d+\.\s(.+)/);
      if (numMatch) {
        flushTable();
        flushUnordered();
        orderedList.push(numMatch[1]);
      } else {
        flushAllBlocks();
        elements.push(<p key={i} className="my-2 leading-relaxed text-gray-600">{renderInline(line, `p-${i}`)}</p>);
      }
    }
  }
  flushAllBlocks();
  flushCode();
  return elements;
}
