import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取作品列表
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ code: 0, data: projects, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 新建作品
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, description, content, role, duration, url, status, featured, order } = body;

    if (!title || !slug || !description || !content) {
      return NextResponse.json(
        { code: 40201, data: null, message: "标题、slug、描述和内容为必填" },
        { status: 400 }
      );
    }

    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { code: 40202, data: null, message: "slug 已存在，请更换" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        content,
        role: role || null,
        duration: duration || null,
        url: url || null,
        status: status || "DRAFT",
        featured: featured || false,
        order: order ?? 0,
      },
    });

    return NextResponse.json({ code: 0, data: project, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
