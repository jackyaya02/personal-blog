import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  /** 当前页码（从 1 开始） */
  currentPage: number;
  /** 总页数 */
  totalPages: number;
  /** 生成某页的链接 */
  getPageHref: (page: number) => string;
}

/**
 * 生成要显示的页码数组。
 * 例如当前第 5 页，共 10 页：[1, '...', 4, 5, 6, '...', 10]
 */
function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const result: (number | "ellipsis")[] = [];
  // 始终显示第一页
  result.push(1);

  // 中间区间
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) result.push("ellipsis");
  for (let i = left; i <= right; i++) {
    result.push(i);
  }
  if (right < total - 1) result.push("ellipsis");

  // 始终显示最后一页
  result.push(total);
  return result;
}

export default function Pagination({
  currentPage,
  totalPages,
  getPageHref,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="分页">
      {/* 上一页 */}
      {currentPage > 1 ? (
        <Link
          href={getPageHref(currentPage - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-warm-200 text-gray-600 transition-colors hover:border-brand-200 hover:text-brand-600"
          aria-label="上一页"
        >
          <ChevronLeft size={16} />
        </Link>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-warm-100 text-gray-300">
          <ChevronLeft size={16} />
        </span>
      )}

      {/* 页码 */}
      {pageNumbers.map((p, i) => {
        if (p === "ellipsis") {
          return (
            <span
              key={`ellipsis-${i}`}
              className="flex h-9 w-9 items-center justify-center text-gray-400"
            >
              ...
            </span>
          );
        }
        const isActive = p === currentPage;
        return (
          <Link
            key={p}
            href={getPageHref(p)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors ${
              isActive
                ? "bg-brand-500 font-medium text-white"
                : "border border-warm-200 text-gray-600 hover:border-brand-200 hover:text-brand-600"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {p}
          </Link>
        );
      })}

      {/* 下一页 */}
      {currentPage < totalPages ? (
        <Link
          href={getPageHref(currentPage + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-warm-200 text-gray-600 transition-colors hover:border-brand-200 hover:text-brand-600"
          aria-label="下一页"
        >
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-warm-100 text-gray-300">
          <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}
