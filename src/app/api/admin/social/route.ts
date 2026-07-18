import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取社交链接列表
export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) {
      return NextResponse.json({ code: 0, data: [], message: "success" });
    }
    const links = await prisma.socialLink.findMany({
      where: { profileId: profile.id },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ code: 0, data: links, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 新建社交链接
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, url, icon, order } = body;

    if (!platform || !url) {
      return NextResponse.json(
        { code: 40201, data: null, message: "平台名称和 URL 为必填" },
        { status: 400 }
      );
    }

    const profile = await prisma.profile.findFirst();
    if (!profile) {
      return NextResponse.json(
        { code: 40202, data: null, message: "请先创建个人信息" },
        { status: 400 }
      );
    }

    const link = await prisma.socialLink.create({
      data: {
        platform,
        url,
        icon: icon || null,
        order: order ?? 0,
        profileId: profile.id,
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
