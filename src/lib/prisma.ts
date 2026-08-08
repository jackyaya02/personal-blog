import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // 从 DATABASE_URL 解析连接参数（pg 库对含 . 的用户名解析有问题，改用显式参数）
  const dbUrl = new URL(process.env.DATABASE_URL || "");
  const pool = new Pool({
    user: dbUrl.username,
    password: dbUrl.password,
    host: dbUrl.hostname,
    port: Number(dbUrl.port) || 5432,
    database: dbUrl.pathname.slice(1),
    // Supabase Supavisor 需要 SSL（自签名证书，跳过验证）
    ssl: { rejectUnauthorized: false },
    // 限制连接数（Supabase 免费版限制）
    max: 1,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: ["warn", "error"],
  });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
