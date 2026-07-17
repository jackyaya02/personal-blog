import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <p className="text-lg text-gray-600">页面未找到</p>
      <Link
        href="/"
        className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
      >
        返回首页
      </Link>
    </div>
  );
}
