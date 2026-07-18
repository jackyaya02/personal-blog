import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取单个作品
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(params.id) },
    });
    if (!project) {
      return NextResponse.json(
        { code: 40401, data: null, message: "作品不存在" },
        { status: 404 }
      );
    }
    return NextResponse.json({ code: 0, data: project, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 更新作品
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const id = Number(params.id);
    const { title, slug, description, content, role, duration, url, coverImage, images, status, featured, order } = body;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { code: 40401, data: null, message: "作品不存在" },
        { status: 404 }
      );
    }

    // 校验 images 必须是数组
    if (images !== undefined && !Array.isArray(images)) {
      return NextResponse.json(
        { code: 40203, data: null, message: "images 必须是数组" },
        { status: 400 }
      );
    }

    if (slug && slug !== existing.slug) {
      const conflict = await prisma.project.findUnique({ where: { slug } });
      if (conflict) {
        return NextResponse.json(
          { code: 40202, data: null, message: "slug 已存在，请更换" },
          { status: 400 }
        );
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        slug: slug ?? existing.slug,
        description: description ?? existing.description,
        content: content ?? existing.content,
        role: role ?? existing.role,
        duration: duration ?? existing.duration,
        url: url ?? existing.url,
        coverImage: coverImage !== undefined ? (coverImage || null) : existing.coverImage,
        // images 是 JSON 字段，undefined 表示不更新；空数组表示清空
        ...(images !== undefined
          ? { images: Array.isArray(images) ? images : [] }
          : {}),
        status: status ?? existing.status,
        featured: featured ?? existing.featured,
        order: order ?? existing.order,
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

// 删除作品
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { code: 40401, data: null, message: "作品不存在" },
        { status: 404 }
      );
    }

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ code: 0, data: null, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
