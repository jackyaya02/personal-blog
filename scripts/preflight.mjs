/**
 * 启动前环境自检脚本
 * 用法：node scripts/preflight.mjs
 *
 * 检查项：
 *  1. Node.js 版本
 *  2. .env 文件存在且关键变量已填
 *  3. MySQL 端口 3306 是否可连接
 *  4. DATABASE_URL 能否真正连上数据库
 *  5. prisma client 是否已生成
 *  6. node_modules 是否安装
 */
import { existsSync, readFileSync } from "fs";
import { createConnection } from "net";
import { createRequire } from "module";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const COLORS = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

let pass = 0;
let fail = 0;

function ok(msg) {
  console.log(`  ${COLORS.green("✓")} ${msg}`);
  pass++;
}
function err(msg, hint = "") {
  console.log(`  ${COLORS.red("✗")} ${msg}`);
  if (hint) console.log(`    ${COLORS.yellow("→")} ${hint}`);
  fail++;
}
function info(msg) {
  console.log(`  ${COLORS.cyan("•")} ${msg}`);
}

function checkPort(host, port, timeout = 2000) {
  return new Promise((resolve) => {
    const socket = new createConnection({ host, port }, () => {
      socket.end();
      resolve(true);
    });
    socket.setTimeout(timeout);
    socket.on("error", () => resolve(false));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function parseDbUrl(url) {
  // mysql://user:pass@host:port/db
  const m = url.match(/^mysql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/(.+)$/);
  if (!m) return null;
  return {
    user: m[1],
    pass: m[2],
    host: m[3],
    port: parseInt(m[4], 10),
    db: m[5],
  };
}

async function main() {
  console.log(`\n${COLORS.bold("🔍 启动前环境自检")}\n`);

  // 1. Node.js 版本
  const nodeVer = process.versions.node;
  const major = parseInt(nodeVer.split(".")[0], 10);
  if (major >= 18) {
    ok(`Node.js v${nodeVer} (要求 ≥ 18.18)`);
  } else {
    err(`Node.js v${nodeVer} 版本过低`, "请升级到 v18.18+");
  }

  // 2. node_modules
  if (existsSync(resolve(projectRoot, "node_modules"))) {
    ok("node_modules 已安装");
  } else {
    err("node_modules 不存在", "运行 npm install");
  }

  // 3. .env 文件
  const envPath = resolve(projectRoot, ".env");
  if (!existsSync(envPath)) {
    err(".env 文件不存在", "运行 cp .env.example .env 并填写配置");
    console.log(`\n${COLORS.red("自检未通过，请修复上述问题后重试。")}\n`);
    process.exit(1);
  }

  const envContent = readFileSync(envPath, "utf8");
  const envVars = {};
  envContent.split("\n").forEach((line) => {
    const m = line.match(/^([A-Z_]+)="?(.*)"?$/);
    if (m) envVars[m[1]] = m[2];
  });

  if (envVars.DATABASE_URL) {
    ok(".env 中 DATABASE_URL 已配置");
  } else {
    err(".env 中 DATABASE_URL 未配置", "填写 mysql://用户:密码@host:port/db");
  }

  if (envVars.JWT_SECRET && envVars.JWT_SECRET !== "dev-secret-please-change-in-production") {
    ok(".env 中 JWT_SECRET 已配置");
  } else {
    info("JWT_SECRET 使用默认值（开发环境可接受，生产环境请修改）");
  }

  // 4. 解析数据库连接
  const db = parseDbUrl(envVars.DATABASE_URL || "");
  if (!db) {
    err("DATABASE_URL 格式错误", "应为 mysql://user:pass@host:port/db");
    console.log(`\n${COLORS.red("自检未通过，请修复上述问题后重试。")}\n`);
    process.exit(1);
  }

  if (!db.pass) {
    err(`数据库密码为空 (user=${db.user})`, "如果 MySQL 设置了密码，请在 DATABASE_URL 中填写");
  } else {
    ok(`数据库凭据已填写 (user=${db.user}, password=***)`);
  }

  // 5. MySQL 端口连通性
  console.log(`\n${COLORS.cyan("检查 MySQL 连接...")}`);
  const portOk = await checkPort(db.host, db.port);
  if (portOk) {
    ok(`MySQL 端口 ${db.host}:${db.port} 可连接`);
  } else {
    err(`MySQL 端口 ${db.host}:${db.port} 不可达`, "请先启动 MySQL 服务");
    console.log(`\n${COLORS.red("自检未通过，请修复上述问题后重试。")}\n`);
    process.exit(1);
  }

  // 6. 真正连接数据库验证凭据
  try {
    const require = createRequire(import.meta.url);
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient({ log: ["error"] });
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    ok("数据库凭据验证通过，连接成功");
  } catch (e) {
    if (e.message.includes("Authentication failed") || e.message.includes("Access denied")) {
      err("数据库认证失败", `当前密码为空或错误。请检查 MySQL root 密码并更新 .env 的 DATABASE_URL`);
    } else if (e.message.includes("Unknown database")) {
      err(`数据库 "${db.db}" 不存在`, `请创建数据库：CREATE DATABASE ${db.db};`);
    } else if (e.message.includes("prisma/client")) {
      err("Prisma Client 未生成", "运行 npx prisma generate");
    } else {
      err(`数据库连接错误: ${e.message.split("\n")[0]}`);
    }
    console.log(`\n${COLORS.red("自检未通过，请修复上述问题后重试。")}\n`);
    process.exit(1);
  }

  // 7. Prisma Client
  if (existsSync(resolve(projectRoot, "node_modules/.prisma/client"))) {
    ok("Prisma Client 已生成");
  } else {
    info("Prisma Client 未生成（将自动生成）");
  }

  // 总结
  console.log(`\n${COLORS.bold("── 自检结果 ──")}`);
  console.log(`  ${COLORS.green("通过")}: ${pass}   ${COLORS.red("失败")}: ${fail}\n`);
  if (fail === 0) {
    console.log(`${COLORS.green("✓ 所有检查通过，可以启动项目：npm run dev")}\n`);
    process.exit(0);
  } else {
    console.log(`${COLORS.red("✗ 有检查未通过，请按提示修复")}\n`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(`${COLORS.red("自检脚本异常:")} ${e.message}`);
  process.exit(1);
});
