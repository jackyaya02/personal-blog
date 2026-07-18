"use client";

import { useRef, useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";

interface MultiImageUploaderProps {
  /** 当前图片 URL 数组 */
  value?: string[] | null;
  /** 值变化回调 */
  onChange: (urls: string[]) => void;
  /** 标签文字 */
  label?: string;
  /** 提示文字 */
  hint?: string;
  /** 每张图片预览的宽高比，如 "16/10" 或 "1/1" */
  aspect?: string;
  /** 最大图片数量，默认 10 */
  max?: number;
}

export default function MultiImageUploader({
  value = [],
  onChange,
  label,
  hint,
  aspect = "16/10",
  max = 10,
}: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const images = Array.isArray(value) ? value : [];

  async function uploadFiles(files: FileList) {
    setError("");
    const validFiles: File[] = [];
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        setError(`文件 ${file.name} 类型不支持，仅支持 jpg/png/webp/gif`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`文件 ${file.name} 过大，最大支持 5MB`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    if (images.length + validFiles.length > max) {
      setError(`最多 ${max} 张图片，当前已有 ${images.length} 张`);
      return;
    }

    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "部分图片上传失败");
          continue;
        }
        newUrls.push(data.data.url);
      }
      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  }

  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="flex flex-wrap gap-3">
        {/* 已上传图片列表 */}
        {images.map((url, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg border border-warm-200 bg-gray-50"
            style={{ width: 140, aspectRatio: aspect }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`图片 ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {/* 删除按钮 */}
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
              aria-label="删除图片"
            >
              <X size={12} />
            </button>
            {/* 序号 */}
            <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
              {index + 1}
            </span>
            {/* 移动按钮 */}
            <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => moveImage(index, index - 1)}
                disabled={index === 0}
                className="rounded bg-black/60 px-1.5 py-0.5 text-xs text-white disabled:opacity-30 hover:bg-black/80"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => moveImage(index, index + 1)}
                disabled={index === images.length - 1}
                className="rounded bg-black/60 px-1.5 py-0.5 text-xs text-white disabled:opacity-30 hover:bg-black/80"
              >
                →
              </button>
            </div>
          </div>
        ))}

        {/* 添加按钮 */}
        {images.length < max && (
          <button
            type="button"
            onClick={() => !uploading && inputRef.current?.click()}
            disabled={uploading}
            className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-warm-200 bg-gray-50 text-gray-400 transition-colors hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ width: 140, aspectRatio: aspect }}
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {hint && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
