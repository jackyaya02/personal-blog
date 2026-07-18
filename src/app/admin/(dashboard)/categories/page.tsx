import prisma from "@/lib/prisma";
import CategoriesManager from "@/components/admin/CategoriesManager";

export const dynamic = "force-dynamic";

async function getData() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { posts: true } } },
  });
  return { categories };
}

export default async function AdminCategoriesPage() {
  const { categories } = await getData();
  return <CategoriesManager initialCategories={categories} />;
}
