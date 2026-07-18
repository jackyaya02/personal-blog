"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchBoxProps {
  /** placeholder 文字 */
  placeholder?: string;
  /** URL 查询参数名，默认 "q" */
  paramName?: string;
}

export default function SearchBox({
  placeholder = "搜索...",
  paramName = "q",
}: SearchBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 从 URL 初始化搜索词
  const initial = searchParams.get(paramName) || "";
  const [value, setValue] = useState(initial);

  // URL 变化时同步输入框
  useEffect(() => {
    setValue(searchParams.get(paramName) || "");
  }, [searchParams, paramName]);

  // 提交搜索：写入 URL 查询参数，重置 page
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set(paramName, value.trim());
    } else {
      params.delete(paramName);
    }
    params.delete("page"); // 搜索时重置到第 1 页
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleClear() {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete(paramName);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-warm-200 bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-warm-100 hover:text-gray-600"
          aria-label="清除搜索"
        >
          <X size={14} />
        </button>
      )}
    </form>
  );
}
