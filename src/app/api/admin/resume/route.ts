import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取简历
export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    if (!profile) {
      return NextResponse.json({ code: 0, data: null, message: "success" });
    }
    const resume = await prisma.resume.findUnique({
      where: { profileId: profile.id },
    });
    return NextResponse.json({ code: 0, data: resume, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 更新简历（upsert）
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { summary, experiences, education, skills } = body;

    const profile = await prisma.profile.findFirst();
    if (!profile) {
      return NextResponse.json(
        { code: 40201, data: null, message: "请先创建个人信息" },
        { status: 400 }
      );
    }

    // 校验 JSON 字段格式
    if (experiences && !Array.isArray(experiences)) {
      return NextResponse.json(
        { code: 40202, data: null, message: "experiences 必须是数组" },
        { status: 400 }
      );
    }
    if (education && !Array.isArray(education)) {
      return NextResponse.json(
        { code: 40203, data: null, message: "education 必须是数组" },
        { status: 400 }
      );
    }
    if (skills && !Array.isArray(skills)) {
      return NextResponse.json(
        { code: 40204, data: null, message: "skills 必须是数组" },
        { status: 400 }
      );
    }

    const existing = await prisma.resume.findUnique({
      where: { profileId: profile.id },
    });

    let resume;
    if (existing) {
      resume = await prisma.resume.update({
        where: { profileId: profile.id },
        data: {
          summary: summary ?? existing.summary,
          experiences: experiences ?? existing.experiences,
          education: education ?? existing.education,
          skills: skills ?? existing.skills,
        },
      });
    } else {
      resume = await prisma.resume.create({
        data: {
          profileId: profile.id,
          summary: summary || null,
          experiences: experiences || [],
          education: education || [],
          skills: skills || [],
        },
      });
    }

    return NextResponse.json({ code: 0, data: resume, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
