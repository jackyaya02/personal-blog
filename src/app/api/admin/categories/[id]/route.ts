import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 更新分类
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, slug, description } = body;
    const id = Number(params.id);

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { code: 40401, data: null, message: "分类不存在" },
        { status: 404 }
      );
    }

    if (slug && slug !== existing.slug) {
      const conflict = await prisma.category.findUnique({ where: { slug } });
      if (conflict) {
        return NextResponse.json(
          { code: 40202, data: null, message: "slug 已存在" },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        slug: slug ?? existing.slug,
        description: description ?? existing.description,
      },
    });

    return NextResponse.json({ code: 0, data: category, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 删除分类（如果有文章关联则拒绝）
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    });
    if (!existing) {
      return NextResponse.json(
        { code: 40401, data: null, message: "分类不存在" },
        { status: 404 }
      );
    }

    if (existing._count.posts > 0) {
      return NextResponse.json(
        {
          code: 40203,
          data: null,
          message: `该分类下有 ${existing._count.posts} 篇文章，请先转移或删除文章`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ code: 0, data: null, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
