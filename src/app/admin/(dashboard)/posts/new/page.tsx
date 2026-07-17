import prisma from "@/lib/prisma";
import PostEditor from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

async function getData() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { categories, tags };
}

export default async function NewPostPage() {
  const { categories, tags } = await getData();
  return <PostEditor categories={categories} tags={tags} />;
}
