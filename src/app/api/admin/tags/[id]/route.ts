import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 更新标签
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, slug } = body;
    const id = Number(params.id);

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { code: 40401, data: null, message: "标签不存在" },
        { status: 404 }
      );
    }

    if (name && name !== existing.name) {
      const conflict = await prisma.tag.findUnique({ where: { name } });
      if (conflict) {
        return NextResponse.json(
          { code: 40202, data: null, message: "标签名已存在" },
          { status: 400 }
        );
      }
    }

    if (slug && slug !== existing.slug) {
      const conflict = await prisma.tag.findUnique({ where: { slug } });
      if (conflict) {
        return NextResponse.json(
          { code: 40203, data: null, message: "slug 已存在" },
          { status: 400 }
        );
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        slug: slug ?? existing.slug,
      },
    });

    return NextResponse.json({ code: 0, data: tag, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 删除标签（会级联删除关联）
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { code: 40401, data: null, message: "标签不存在" },
        { status: 404 }
      );
    }

    await prisma.tag.delete({ where: { id } });
    return NextResponse.json({ code: 0, data: null, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
