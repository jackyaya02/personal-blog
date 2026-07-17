import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取文章列表
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        postTags: { include: { tag: { select: { name: true } } } },
      },
    });
    return NextResponse.json({ code: 0, data: posts, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 新建文章
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, content, excerpt, categoryId, status, tagIds } = body;

    if (!title || !slug || !content || !categoryId) {
      return NextResponse.json(
        { code: 40201, data: null, message: "标题、slug、内容和分类为必填" },
        { status: 400 }
      );
    }

    // 检查 slug 是否已存在
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { code: 40202, data: null, message: "slug 已存在，请更换" },
        { status: 400 }
      );
    }

    // 估算阅读时间（中文按 400 字/分钟）
    const readingTime = Math.max(1, Math.ceil(content.length / 400));

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        categoryId: Number(categoryId),
        status: status || "DRAFT",
        readingTime,
        postTags: tagIds?.length
          ? { create: tagIds.map((tagId: number) => ({ tagId })) }
          : undefined,
      },
    });

    return NextResponse.json({ code: 0, data: post, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
