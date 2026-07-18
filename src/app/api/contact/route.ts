import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 公开提交留言（无需鉴权）
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // 必填校验
    if (!name || !email || !message) {
      return NextResponse.json(
        { code: 40201, data: null, message: "姓名、邮箱、留言内容为必填" },
        { status: 400 }
      );
    }

    // 邮箱格式校验
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { code: 40202, data: null, message: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    // 长度限制
    if (name.length > 100) {
      return NextResponse.json(
        { code: 40203, data: null, message: "姓名过长（最多 100 字符）" },
        { status: 400 }
      );
    }
    if (message.length > 5000) {
      return NextResponse.json(
        { code: 40204, data: null, message: "留言过长（最多 5000 字符）" },
        { status: 400 }
      );
    }

    const created = await prisma.contactMessage.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim(),
        subject: subject ? String(subject).trim().slice(0, 200) : null,
        message: String(message).trim(),
      },
    });

    return NextResponse.json({
      code: 0,
      data: { id: created.id },
      message: "留言已提交，感谢您的反馈！",
    });
  } catch (error) {
    console.error("提交留言失败:", error);
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误，请稍后重试" },
      { status: 500 }
    );
  }
}
