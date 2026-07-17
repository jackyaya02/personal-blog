import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取单篇文章
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(params.id) },
      include: {
        category: true,
        postTags: { include: { tag: true } },
      },
    });
    if (!post) {
      return NextResponse.json(
        { code: 40401, data: null, message: "文章不存在" },
        { status: 404 }
      );
    }
    return NextResponse.json({ code: 0, data: post, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 更新文章
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, slug, content, excerpt, categoryId, status, tagIds } = body;
    const id = Number(params.id);

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { code: 40401, data: null, message: "文章不存在" },
        { status: 404 }
      );
    }

    // 检查 slug 唯一性（排除自身）
    if (slug && slug !== existing.slug) {
      const conflict = await prisma.post.findUnique({ where: { slug } });
      if (conflict) {
        return NextResponse.json(
          { code: 40202, data: null, message: "slug 已存在，请更换" },
          { status: 400 }
        );
      }
    }

    const readingTime = content ? Math.max(1, Math.ceil(content.length / 400)) : existing.readingTime;

    // 更新文章
    const post = await prisma.post.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        slug: slug ?? existing.slug,
        content: content ?? existing.content,
        excerpt: excerpt ?? existing.excerpt,
        categoryId: categoryId ? Number(categoryId) : existing.categoryId,
        status: status ?? existing.status,
        readingTime,
      },
    });

    // 更新标签关联（如果提供了 tagIds）
    if (tagIds !== undefined) {
      await prisma.postTag.deleteMany({ where: { postId: id } });
      if (tagIds.length > 0) {
        await prisma.postTag.createMany({
          data: tagIds.map((tagId: number) => ({ postId: id, tagId })),
        });
      }
    }

    return NextResponse.json({ code: 0, data: post, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { code: 40401, data: null, message: "文章不存在" },
        { status: 404 }
      );
    }

    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ code: 0, data: null, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
