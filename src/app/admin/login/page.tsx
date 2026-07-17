"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, User } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const from =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("from") || "/admin"
      : "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "登录失败");
        return;
      }
      router.replace(from);
      router.refresh();
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-50 px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft size={16} /> 返回首页
        </Link>

        <div className="rounded-2xl border border-warm-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">管理后台</h1>
          <p className="mb-8 text-sm text-gray-500">请登录以继续</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                用户名
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  className="w-full rounded-lg border border-warm-200 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                密码
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-warm-200 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
                  placeholder="••••••"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            默认账号：admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
