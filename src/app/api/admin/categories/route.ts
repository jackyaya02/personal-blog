import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取所有分类
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ code: 0, data: categories, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
