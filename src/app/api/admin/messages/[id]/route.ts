import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取单条留言
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) {
      return NextResponse.json(
        { code: 40401, data: null, message: "留言不存在" },
        { status: 404 }
      );
    }

    // 首次查看时自动标记为已读
    if (message.status === "UNREAD") {
      const updated = await prisma.contactMessage.update({
        where: { id },
        data: { status: "READ" },
      });
      return NextResponse.json({ code: 0, data: updated, message: "success" });
    }

    return NextResponse.json({ code: 0, data: message, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 更新留言状态
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["UNREAD", "READ", "REPLIED", "ARCHIVED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { code: 40201, data: null, message: "无效的状态值" },
        { status: 400 }
      );
    }

    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { code: 40401, data: null, message: "留言不存在" },
        { status: 404 }
      );
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: status ? { status } : {},
    });

    return NextResponse.json({ code: 0, data: message, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 删除留言
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { code: 40401, data: null, message: "留言不存在" },
        { status: 404 }
      );
    }

    await prisma.contactMessage.delete({ where: { id } });
    return NextResponse.json({ code: 0, data: null, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
