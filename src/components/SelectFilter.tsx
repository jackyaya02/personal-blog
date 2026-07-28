"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Option {
  label: string;
  value: string;
}

interface SelectFilterProps {
  /** 标签文字 */
  label?: string;
  /** URL 查询参数名 */
  paramName: string;
  /** 选项列表 */
  options: Option[];
  /** placeholder 选项（value 为空字符串） */
  placeholder?: string;
}

export default function SelectFilter({
  label,
  paramName,
  options,
  placeholder,
}: SelectFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = searchParams.get(paramName) || "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }
    params.delete("page"); // 切换筛选时重置到第 1 页
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      {label && <span className="text-gray-600">{label}</span>}
      <select
        value={current}
        onChange={handleChange}
        className="rounded-lg border border-warm-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
