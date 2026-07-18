import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取留言列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 20;

    // 校验 status 是合法的枚举值
    const validStatuses = ["UNREAD", "READ", "REPLIED", "ARCHIVED"];
    const where = status && validStatuses.includes(status)
      ? { status: status as "UNREAD" | "READ" | "REPLIED" | "ARCHIVED" }
      : {};

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return NextResponse.json({
      code: 0,
      data: {
        list: messages,
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
