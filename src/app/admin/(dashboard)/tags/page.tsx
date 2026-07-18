import prisma from "@/lib/prisma";
import TagsManager from "@/components/admin/TagsManager";

export const dynamic = "force-dynamic";

async function getData() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { postTags: true } } },
  });
  return { tags };
}

export default async function AdminTagsPage() {
  const { tags } = await getData();
  return <TagsManager initialTags={tags} />;
}
