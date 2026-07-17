import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { comparePassword, generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { code: 40201, data: null, message: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin || !comparePassword(password, admin.passwordHash)) {
      return NextResponse.json(
        { code: 40101, data: null, message: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const token = generateToken({ id: admin.id, username: admin.username });

    // 设置 httpOnly Cookie，middleware 可读取，前端 JS 无法读取
    cookies().set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 小时
    });

    return NextResponse.json({
      code: 0,
      data: { token },
      message: "success",
    });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
