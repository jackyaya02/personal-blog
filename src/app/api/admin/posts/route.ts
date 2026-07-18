import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取文章列表（支持分页和搜索）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 20));
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");

    // 构造查询条件
    const where: {
      AND: Array<Record<string, unknown>>;
    } = { AND: [] };

    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search } },
          { excerpt: { contains: search } },
          { content: { contains: search } },
        ],
      });
    }

    if (status) {
      where.AND.push({ status });
    }

    if (categoryId) {
      where.AND.push({ categoryId: Number(categoryId) });
    }

    // 如果没有筛选条件，使用空对象
    const whereClause = where.AND.length > 0 ? where : {};

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: { select: { name: true } },
          postTags: { include: { tag: { select: { name: true } } } },
        },
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      code: 0,
      data: {
        list: posts,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
      message: "success",
    });
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
    const { title, slug, content, excerpt, coverImage, categoryId, status, tagIds } = body;

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
        coverImage: coverImage || null,
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
