import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { renderMarkdown } from "@/lib/markdown";
import { ArrowLeft } from "lucide-react";

async function getPost(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: { category: true, postTags: { include: { tag: true } } },
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "未找到" };
  return { title: post.title, description: post.excerpt || "" };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/blog" className="mb-8 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700">
        <ArrowLeft size={16} /> 返回博客
      </Link>
      <article>
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
            <span>{post.createdAt.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</span>
            <span>·</span>
            <span className="rounded bg-warm-100 px-2 py-0.5 text-gray-600">{post.category.name}</span>
            <span>·</span>
            <span>{post.readingTime} 分钟阅读</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-gray-500">{post.excerpt}</p>}
          {post.postTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.postTags.map((pt) => (
                <Link key={pt.tag.id} href={"/blog/tag/" + pt.tag.slug} className="tag">
                  #{pt.tag.name}
                </Link>
              ))}
            </div>
          )}
        </header>
        <div className="prose prose-gray max-w-none">{renderMarkdown(post.content)}</div>
      </article>
    </div>
  );
}
