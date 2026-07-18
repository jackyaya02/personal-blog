"use client";

import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  /** 当前图片 URL */
  value?: string | null;
  /** 值变化回调 */
  onChange: (url: string) => void;
  /** 标签文字 */
  label?: string;
  /** 提示文字 */
  hint?: string;
  /** 预览区域宽高比，如 "16/10" 或 "1/1" */
  aspect?: string;
  /** 是否允许手动输入 URL，默认 true */
  allowManualUrl?: boolean;
}

export default function ImageUploader({
  value,
  onChange,
  label,
  hint,
  aspect = "16/10",
  allowManualUrl = true,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file: File) {
    setError("");

    // 客户端预校验
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("仅支持 jpg/png/webp/gif 格式");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("文件过大，最大支持 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "上传失败");
        return;
      }
      onChange(data.data.url);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    // 重置 input，便于重复上传同一文件
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }

  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* 预览区 / 上传区 */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
          dragOver
            ? "border-brand-400 bg-brand-50"
            : "border-warm-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/40"
        }`}
        style={{ aspectRatio: aspect }}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="预览"
              className="h-full w-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
            {/* 删除按钮 */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
              aria-label="删除图片"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
            ) : (
              <Upload className="h-8 w-8" />
            )}
            <p className="text-xs">
              {uploading ? "上传中..." : "点击上传或拖拽图片到此处"}
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 手动输入 URL */}
      {allowManualUrl && (
        <div className="mt-2 flex items-center gap-2">
          <ImageIcon size={14} className="text-gray-400" />
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="或粘贴图片 URL"
            className="flex-1 rounded border border-warm-200 px-2 py-1 text-xs outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
          />
        </div>
      )}

      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
