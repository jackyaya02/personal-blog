import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取个人信息
export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    return NextResponse.json({ code: 0, data: profile, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 更新个人信息（upsert，保证只有一条）
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { name, title, bio, avatar, location, email } = body;

    if (!name || !title || !bio) {
      return NextResponse.json(
        { code: 40201, data: null, message: "姓名、职位、简介为必填" },
        { status: 400 }
      );
    }

    const existing = await prisma.profile.findFirst();

    let profile;
    if (existing) {
      profile = await prisma.profile.update({
        where: { id: existing.id },
        data: {
          name,
          title,
          bio,
          avatar: avatar || null,
          location: location || null,
          email: email || null,
        },
      });
    } else {
      profile = await prisma.profile.create({
        data: {
          name,
          title,
          bio,
          avatar: avatar || null,
          location: location || null,
          email: email || null,
        },
      });
    }

    return NextResponse.json({ code: 0, data: profile, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
