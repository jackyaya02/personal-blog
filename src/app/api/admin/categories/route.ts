import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取分类列表（含文章数）
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { posts: true } } },
    });
    return NextResponse.json({ code: 0, data: categories, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 新建分类
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { code: 40201, data: null, message: "名称和 slug 为必填" },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { code: 40202, data: null, message: "slug 已存在" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: { name, slug, description: description || null },
    });

    return NextResponse.json({ code: 0, data: category, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
