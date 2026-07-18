import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 更新社交链接
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { platform, url, icon, order } = body;
    const id = Number(params.id);

    const existing = await prisma.socialLink.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { code: 40401, data: null, message: "社交链接不存在" },
        { status: 404 }
      );
    }

    const link = await prisma.socialLink.update({
      where: { id },
      data: {
        platform: platform ?? existing.platform,
        url: url ?? existing.url,
        icon: icon ?? existing.icon,
        order: order ?? existing.order,
      },
    });

    return NextResponse.json({ code: 0, data: link, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 删除社交链接
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const existing = await prisma.socialLink.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { code: 40401, data: null, message: "社交链接不存在" },
        { status: 404 }
      );
    }

    await prisma.socialLink.delete({ where: { id } });
    return NextResponse.json({ code: 0, data: null, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
