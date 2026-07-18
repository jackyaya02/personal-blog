import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/auth";
import { cookies } from "next/headers";

// 修改密码
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { code: 40201, data: null, message: "当前密码和新密码为必填" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { code: 40202, data: null, message: "新密码长度至少 6 位" },
        { status: 400 }
      );
    }

    // 从 cookie 获取用户 id
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { code: 40101, data: null, message: "未登录" },
        { status: 401 }
      );
    }

    // 用 jose 验证 token（在 middleware 里已经验证过，这里直接信任 middleware 保护）
    // 但本路由是受保护路由，token 已合法，我们用 jsonwebtoken 解析
    const jwt = await import("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
    let payload: { id: number; username: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    } catch {
      return NextResponse.json(
        { code: 40102, data: null, message: "登录已过期，请重新登录" },
        { status: 401 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
    if (!admin) {
      return NextResponse.json(
        { code: 40401, data: null, message: "用户不存在" },
        { status: 404 }
      );
    }

    if (!comparePassword(currentPassword, admin.passwordHash)) {
      return NextResponse.json(
        { code: 40203, data: null, message: "当前密码错误" },
        { status: 400 }
      );
    }

    const newHash = hashPassword(newPassword);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ code: 0, data: null, message: "密码修改成功" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
