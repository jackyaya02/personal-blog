import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取所有标签
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ code: 0, data: tags, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
