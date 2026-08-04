import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

// 允许的图片 MIME 类型
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// MIME 类型到扩展名映射
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// 最大文件大小：5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Supabase Storage bucket 名称
const BUCKET_NAME = "uploads";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    // 校验文件存在且是文件类型
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { code: 40201, data: null, message: "未接收到文件" },
        { status: 400 }
      );
    }

    // 校验文件类型
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          code: 40202,
          data: null,
          message: `不支持的文件类型：${file.type}，仅支持 jpg/png/webp/gif`,
        },
        { status: 400 }
      );
    }

    // 校验文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          code: 40203,
          data: null,
          message: `文件过大（${(file.size / 1024 / 1024).toFixed(2)}MB），最大支持 5MB`,
        },
        { status: 400 }
      );
    }

    // 生成唯一文件名：时间戳-随机串.ext
    const ext = MIME_TO_EXT[file.type];
    const timestamp = Date.now();
    const random = randomBytes(6).toString("hex");
    const filename = `${timestamp}-${random}.${ext}`;

    // 上传到 Supabase Storage（upsert 避免重名冲突）
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filename, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase 上传失败:", uploadError);
      return NextResponse.json(
        { code: 50002, data: null, message: "图片上传失败" },
        { status: 500 }
      );
    }

    // 获取公开访问 URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);

    return NextResponse.json({
      code: 0,
      data: {
        url: publicUrlData.publicUrl,
        filename,
        pathname: filename,
      },
      message: "success",
    });
  } catch (error) {
    console.error("上传失败:", error);
    return NextResponse.json(
      { code: 50001, data: null, message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
