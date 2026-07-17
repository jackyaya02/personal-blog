import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import PostEditor from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

async function getData(id: number) {
  const [post, categories, tags] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: { postTags: { include: { tag: true } } },
    }),
    prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { post, categories, tags };
}

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const { post, categories, tags } = await getData(Number(params.id));
  if (!post) notFound();

  return <PostEditor post={post} categories={categories} tags={tags} />;
}
