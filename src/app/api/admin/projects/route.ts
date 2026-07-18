import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 获取作品列表（支持分页和搜索）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 20));
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");

    // 构造查询条件
    const where: {
      AND: Array<Record<string, unknown>>;
    } = { AND: [] };

    if (search) {
      where.AND.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { content: { contains: search } },
        ],
      });
    }

    if (status) {
      where.AND.push({ status });
    }

    if (featured === "true") {
      where.AND.push({ featured: true });
    }

    const whereClause = where.AND.length > 0 ? where : {};

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.project.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      code: 0,
      data: {
        list: projects,
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

// 新建作品
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, description, content, role, duration, url, coverImage, images, status, featured, order } = body;

    if (!title || !slug || !description || !content) {
      return NextResponse.json(
        { code: 40201, data: null, message: "标题、slug、描述和内容为必填" },
        { status: 400 }
      );
    }

    // 校验 images 必须是数组
    if (images !== undefined && !Array.isArray(images)) {
      return NextResponse.json(
        { code: 40203, data: null, message: "images 必须是数组" },
        { status: 400 }
      );
    }

    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { code: 40202, data: null, message: "slug 已存在，请更换" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        content,
        role: role || null,
        duration: duration || null,
        url: url || null,
        coverImage: coverImage || null,
        images: Array.isArray(images) ? images : [],
        status: status || "DRAFT",
        featured: featured || false,
        order: order ?? 0,
      },
    });

    return NextResponse.json({ code: 0, data: project, message: "success" });
  } catch {
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
