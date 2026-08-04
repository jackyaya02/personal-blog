import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 初始化管理员账号...\n");

  // 仅创建管理员账号（upsert + update 为空对象，不覆盖已修改的密码）
  const adminPassword = bcrypt.hashSync("admin123", 10);
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", passwordHash: adminPassword },
  });
  console.log("✅ 管理员账号: admin / admin123");
  console.log("\n🎉 初始化完成！（不填充业务数据，空数据页面将显示骨架占位）");
}

main()
  .catch((e) => {
    console.error("❌ 初始化失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
