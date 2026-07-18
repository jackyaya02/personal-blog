import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取标签列表（含文章数）
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { postTags: true } } },
    });
    return NextResponse.json({ code: 0, data: tags, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 新建标签
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { code: 40201, data: null, message: "名称和 slug 为必填" },
        { status: 400 }
      );
    }

    const existingName = await prisma.tag.findUnique({ where: { name } });
    if (existingName) {
      return NextResponse.json(
        { code: 40202, data: null, message: "标签名已存在" },
        { status: 400 }
      );
    }

    const existingSlug = await prisma.tag.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { code: 40203, data: null, message: "slug 已存在" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({ data: { name, slug } });

    return NextResponse.json({ code: 0, data: tag, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
