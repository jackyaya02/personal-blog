// 骨架占位组件 —— 空数据时保持页面排版结构
// 使用 Tailwind 内置 animate-pulse 实现呼吸感

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-cream-200/70 ${className}`} />;
}

// ── 博客/生活页：文章卡片骨架（纵向列表，带封面图）──
export function PostCardSkeleton() {
  return (
    <div className="card-editorial flex h-full flex-col overflow-hidden p-0">
      <Block className="aspect-[16/9] w-full rounded-none" />
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-2">
          <Block className="h-5 w-16 rounded-full" />
          <Block className="h-3 w-24" />
        </div>
        <Block className="h-6 w-3/4" />
        <div className="mt-3 flex-1 space-y-2">
          <Block className="h-4 w-full" />
          <Block className="h-4 w-5/6" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-cream-200 pt-3">
          <Block className="h-3 w-20" />
          <Block className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

// ── 首页：文章卡片骨架（3列网格，无封面图）──
export function HomePostSkeleton() {
  return (
    <div className="card-editorial flex h-full flex-col p-7">
      <div className="mb-4 flex items-center gap-3">
        <Block className="h-5 w-16 rounded-full" />
        <Block className="h-3 w-24" />
      </div>
      <Block className="h-6 w-4/5" />
      <div className="mt-3 flex-1 space-y-2">
        <Block className="h-4 w-full" />
        <Block className="h-4 w-full" />
        <Block className="h-4 w-2/3" />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-cream-200 pt-4">
        <Block className="h-3 w-20" />
        <Block className="h-3 w-12" />
      </div>
    </div>
  );
}

// ── 首页/作品页：作品卡片骨架 ──
export function ProjectCardSkeleton({ variant = "grid" }: { variant?: "grid" | "featured" }) {
  if (variant === "featured") {
    return (
      <div className="card-editorial h-full overflow-hidden p-0">
        <Block className="aspect-[16/10] w-full rounded-none" />
        <div className="p-8">
          <Block className="mb-2 h-4 w-20" />
          <Block className="h-7 w-3/4" />
          <div className="mt-3 space-y-2">
            <Block className="h-4 w-full" />
            <Block className="h-4 w-4/5" />
          </div>
          <div className="mt-5 flex items-center gap-4 border-t border-cream-200 pt-5">
            <Block className="h-3 w-24" />
            <Block className="ml-auto h-3 w-28" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-card">
      <Block className="aspect-[16/10] w-full rounded-none" />
      <div className="p-5">
        <Block className="mb-2 h-4 w-16 rounded-full" />
        <Block className="h-5 w-4/5" />
        <div className="mt-2 space-y-2">
          <Block className="h-3 w-full" />
          <Block className="h-3 w-3/4" />
        </div>
        <Block className="mt-3 h-3 w-32" />
      </div>
    </div>
  );
}

// ── 文章列表骨架（blog/life 页面用）──
export function PostListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
