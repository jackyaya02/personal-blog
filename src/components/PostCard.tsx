import Link from "next/link";

type PostCardPost = {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  readingTime: number;
  status: string;
  createdAt: Date;
  category: { name: string };
  postTags: { tag: { id: number; name: string } }[];
};

export default function PostCard({ post }: { post: PostCardPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="card-editorial flex h-full flex-col overflow-hidden p-0">
        {/* 封面图 */}
        {post.coverImage && (
          <div className="aspect-[16/9] overflow-hidden bg-cream-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-600 ease-soft group-hover:scale-105"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col p-6">
          {/* 元信息 */}
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span className="chip">{post.category.name}</span>
            <span>{post.createdAt.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</span>
            {post.status === "PINNED" && (
              <span className="rounded bg-brand-50 px-2 py-0.5 text-brand-600">📌 置顶</span>
            )}
          </div>

          {/* 标题 */}
          <h3 className="font-serif text-lg font-semibold leading-snug text-gray-900 transition-colors group-hover:text-brand-600">
            {post.title}
          </h3>

          {/* 摘要 */}
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500">
              {post.excerpt}
            </p>
          )}

          {/* 底部：标签 + 阅读时间 */}
          <div className="mt-4 flex items-center justify-between border-t border-cream-200 pt-3 text-xs text-gray-400">
            <span>阅读约 {post.readingTime} 分钟</span>
            <span className="font-medium text-brand-500 transition-colors group-hover:text-brand-600">阅读 →</span>
          </div>

          {/* 标签 */}
          {post.postTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.postTags.map((pt) => (
                <span key={pt.tag.id} className="text-xs text-gray-400">
                  #{pt.tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
