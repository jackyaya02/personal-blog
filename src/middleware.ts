import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// 受保护的路由前缀
const PROTECTED_PREFIXES = ["/admin", "/api/admin"];

// 登录页不需要鉴权
const PUBLIC_ADMIN_PATHS = ["/admin/login"];

// Edge Runtime 兼容的 JWT 验证（不用 jsonwebtoken，它依赖 Node.js crypto）
async function verifyTokenEdge(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "dev-secret"
    );
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 仅处理受保护路径
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("admin_token")?.value;

  // 登录页本身：已登录则跳转后台首页，未登录则放行
  if (PUBLIC_ADMIN_PATHS.includes(pathname)) {
    if (token && (await verifyTokenEdge(token))) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // 其余受保护路径：必须有有效 token
  if (!token || !(await verifyTokenEdge(token))) {
    // API 请求返回 401，页面请求重定向到登录
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { code: 40100, data: null, message: "未登录或登录已过期" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // 仅对 /admin 和 /api/admin 开头的路径生效，避免拦截其他页面
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
