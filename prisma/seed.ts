import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始填充种子数据...\n");

  // ── 1. 管理员 ──
  const adminPassword = bcrypt.hashSync("admin123", 10);
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: { passwordHash: adminPassword },
    create: { username: "admin", passwordHash: adminPassword },
  });
  console.log("✅ 管理员: admin / admin123");

  // ── 2. 个人信息 ──
  const profile = await prisma.profile.upsert({
    where: { id: 1 },
    update: {
      name: "Your Name",
      title: "AI 产品经理",
      bio: "24岁 AI 产品经理，关注 AI 产品、用户体验、产品方法论。热爱将复杂技术转化为用户可感知的价值，擅长从 0 到 1 构建产品。",
      location: "北京",
      email: "yourname@example.com",
    },
    create: {
      id: 1,
      name: "Your Name",
      title: "AI 产品经理",
      bio: "24岁 AI 产品经理，关注 AI 产品、用户体验、产品方法论。热爱将复杂技术转化为用户可感知的价值，擅长从 0 到 1 构建产品。",
      location: "北京",
      email: "yourname@example.com",
    },
  });

  // 社交链接 - 先删后建
  await prisma.socialLink.deleteMany({ where: { profileId: profile.id } });
  const socialLinks = [
    { platform: "GitHub", url: "https://github.com/yourname", icon: "github", order: 0 },
    { platform: "即刻", url: "https://okjk.co/yourname", icon: "zap", order: 1 },
    { platform: "小红书", url: "https://xiaohongshu.com/user/yourname", icon: "book-open", order: 2 },
  ];
  for (const link of socialLinks) {
    await prisma.socialLink.create({ data: { ...link, profileId: profile.id } });
  }
  console.log("✅ 个人信息 + 社交链接");

  // ── 3. 简历 ──
  const resumeData = {
    summary: "拥有 3 年产品经验，专注于 AI 领域产品设计与落地。曾主导多款 AI 产品从需求分析到上线的全流程。",
    experiences: [
      { company: "某 AI 科技公司", title: "AI 产品经理", startDate: "2024-03", endDate: "至今", description: "负责 AI 聊天产品的需求分析与功能设计", highlights: ["主导 AI 对话体验优化，用户留存提升 30%", "推动智能推荐系统上线，点击率提升 45%"] },
      { company: "某互联网公司", title: "助理产品经理", startDate: "2022-07", endDate: "2024-02", description: "负责 B 端产品模块设计", highlights: ["负责 3 个核心模块的产品设计", "协调研发、设计团队完成迭代交付"] },
      { company: "某创业公司", title: "产品实习生", startDate: "2021-06", endDate: "2022-06", description: "参与 C 端产品从 0 到 1", highlights: ["完成竞品分析报告 20+ 份", "参与用户调研 50+ 人次"] },
    ],
    education: [{ school: "北京某大学", major: "计算机科学与技术", degree: "本科", startDate: "2018-09", endDate: "2022-06" }],
    skills: [
      { name: "产品设计", level: "专家" },
      { name: "数据分析", level: "精通" },
      { name: "用户研究", level: "精通" },
      { name: "原型设计", level: "精通" },
      { name: "项目管理", level: "熟练" },
      { name: "AI 产品", level: "专家" },
    ],
  };
  const existingResume = await prisma.resume.findUnique({ where: { profileId: profile.id } });
  if (existingResume) {
    await prisma.resume.update({ where: { id: existingResume.id }, data: resumeData });
  } else {
    await prisma.resume.create({ data: { ...resumeData, profileId: profile.id } });
  }
  console.log("✅ 简历数据");

  // ── 4. 分类 ──
  const categoryData = [
    { name: "AI 产品", slug: "ai-product", description: "AI 产品分析与设计思考" },
    { name: "产品方法论", slug: "product-methodology", description: "产品设计方法与框架" },
    { name: "用户体验", slug: "ux", description: "用户体验设计与优化" },
    { name: "数据分析", slug: "data-analytics", description: "数据驱动决策" },
    { name: "职业成长", slug: "career", description: "产品经理成长路径" },
    { name: "工具推荐", slug: "tools", description: "效率工具与资源分享" },
  ];
  const catMap: Record<string, number> = {};
  for (const c of categoryData) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    catMap[c.slug] = cat.id;
  }
  console.log("✅ 分类: 6 个");

  // ── 5. 标签 ──
  const tagData = [
    { name: "ChatGPT", slug: "chatgpt" },
    { name: "AIGC", slug: "aigc" },
    { name: "提示词", slug: "prompt" },
    { name: "产品思维", slug: "product-thinking" },
    { name: "用户增长", slug: "growth" },
    { name: "设计系统", slug: "design-system" },
  ];
  const tagMap: Record<string, number> = {};
  for (const t of tagData) {
    const tag = await prisma.tag.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });
    tagMap[t.slug] = tag.id;
  }
  console.log("✅ 标签: 6 个");

  // ── 6. 文章 ──
  const posts = [
    { title: "ChatGPT 产品分析：从工具到平台的进化之路", slug: "chatgpt-product-analysis", content: `# ChatGPT 产品分析\n\n## 背景\n\n2022 年底，OpenAI 发布了 ChatGPT。作为一名 AI 产品经理，我想从产品角度分析 ChatGPT 的进化路径。\n\n## 核心发现\n\n### 1. 极简交互设计\nChatGPT 的成功很大程度上归因于其极简的聊天界面。\n\n### 2. 渐进式功能扩展\n从纯文本对话到代码解释器、插件系统、多模态、GPTs 商店。\n\n### 3. 平台化战略\n从单一产品 → 平台生态。\n\n> 好的产品不是功能堆砌，而是让用户自然地完成想做的事。`, excerpt: "从产品经理视角，深度分析 ChatGPT 如何从一款对话工具进化为 AI 平台生态。", categorySlug: "ai-product", tagSlugs: ["chatgpt", "aigc"], readingTime: 8 },
    { title: "如何用 AI 提升产品经理的工作效率", slug: "ai-productivity-for-pm", content: `# 如何用 AI 提升产品经理的工作效率\n\n## 实操场景\n\n### 1. 竞品分析\n用 AI 快速抓取竞品信息。\n\n### 2. 需求文档\n用提示词模板生成 PRD 初稿。\n\n### 3. 数据分析\n用自然语言查询数据库。\n\n> AI 不会取代产品经理，但会取代不会用 AI 的产品经理。`, excerpt: "分享产品经理日常工作中最实用的 AI 提效场景和工具推荐。", categorySlug: "tools", tagSlugs: ["aigc", "prompt"], readingTime: 6 },
    { title: "用户研究方法论：从定性到定量的完整框架", slug: "user-research-framework", content: `# 用户研究方法论\n\n## 四步研究法\n\n### Step 1: 明确目标\n先问自己三个问题。\n\n### Step 2: 选择方法\n探索期: 深度访谈；验证期: A/B 测试；监测期: 数据分析。\n\n### Step 3: 执行研究\n注意样本偏差，多做三角验证。\n\n### Step 4: 输出洞察\n不要只给数据，要给 actionable 的建议。\n\n> 好的用户研究不是证明你对了，而是发现你错了。`, excerpt: "一套系统化的用户研究框架，帮助产品经理做出更明智的产品决策。", categorySlug: "ux", tagSlugs: ["product-thinking", "growth"], readingTime: 10 },
    { title: "从 0 到 1 搭建 AI 产品的设计规范", slug: "ai-product-design-system", content: `# AI 产品设计规范\n\n## 核心要素\n\n### 1. 状态管理\n思考中、生成中、出错时的状态设计。\n\n### 2. 反馈机制\n用户需要知道 AI 在做什么、为什么、如何修正。\n\n### 3. 信任设计\n透明性、可控性、隐私保护。\n\n> AI 产品的设计不是让 AI 看起来更聪明，而是让用户感觉更可控。`, excerpt: "AI 产品设计不同于传统 UI 设计，本文分享 AI 产品专属的设计规范搭建经验。", categorySlug: "ai-product", tagSlugs: ["design-system", "aigc"], readingTime: 7 },
    { title: "数据驱动决策：产品经理必备的数据分析框架", slug: "data-driven-decision-making", content: `# 数据驱动决策\n\n## 金字塔分析框架\n\n### 第一层：健康指标\nDAU/MAU、留存率、转化率\n\n### 第二层：行为指标\n核心功能使用频率、用户路径分析\n\n### 第三层：业务指标\nLTV、CAC、ROI\n\n> 数据告诉你发生了什么，但不会告诉你为什么发生。`, excerpt: "产品经理如何用数据做决策？本文分享一套实用的数据分析框架。", categorySlug: "data-analytics", tagSlugs: ["product-thinking", "growth"], readingTime: 9 },
    { title: "提示词工程入门：写给产品经理的 Prompt 指南", slug: "prompt-engineering-for-pm", content: `# 提示词工程入门\n\n## 核心原则\n\n### 1. 明确角色\n"你是一个资深产品经理..."\n\n### 2. 提供上下文\n提供背景信息。\n\n### 3. 指定输出格式\n"请用 Markdown 表格输出"\n\n> 好的提示词就像好的产品需求文档——清晰、具体、可执行。`, excerpt: "产品经理必学的提示词工程技巧，让 AI 真正成为你的生产力工具。", categorySlug: "tools", tagSlugs: ["prompt", "aigc"], readingTime: 5 },
  ];

  for (const p of posts) {
    const post = await prisma.post.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        content: p.content,
        excerpt: p.excerpt,
        status: "PUBLISHED",
        readingTime: p.readingTime,
        categoryId: catMap[p.categorySlug],
      },
      create: {
        title: p.title,
        slug: p.slug,
        content: p.content,
        excerpt: p.excerpt,
        status: "PUBLISHED",
        readingTime: p.readingTime,
        categoryId: catMap[p.categorySlug],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.postTag.deleteMany({ where: { postId: post.id } });
    for (const ts of p.tagSlugs) {
      await prisma.postTag.create({ data: { postId: post.id, tagId: tagMap[ts] } });
    }
  }
  console.log("✅ 文章: 6 篇");

  // ── 7. 作品 ──
  const projects = [
    { title: "AI 智能客服平台", slug: "ai-customer-service", description: "基于大语言模型的企业级智能客服解决方案", content: `# AI 智能客服平台\n\n## 核心功能\n\n- 智能问答\n- 人机协作\n- 数据分析\n\n## 成果\n\n- 客服响应时间缩短 80%\n- 客户满意度提升 25%`, role: "产品负责人", duration: "2024.01 - 2024.06", featured: true, order: 1 },
    { title: "个性化推荐系统", slug: "recommendation-system", description: "为内容平台构建 AI 驱动的个性化推荐引擎", content: `# 个性化推荐系统\n\n## 核心功能\n\n- 用户画像\n- 多路召回\n- A/B 测试平台\n\n## 成果\n\n- 用户点击率提升 45%\n- 人均使用时长增加 30%`, role: "产品经理", duration: "2023.06 - 2023.12", featured: true, order: 2 },
    { title: "B 端数据看板", slug: "bi-dashboard", description: "为企业客户提供可自定义的数据可视化看板", content: `# B 端数据看板\n\n## 核心功能\n\n- 拖拽式仪表盘编辑器\n- 20+ 种可视化图表组件\n- 数据导出与自动报告\n\n## 成果\n\n- 服务 50+ 家企业客户\n- NPS 评分 82`, role: "产品经理", duration: "2022.10 - 2023.05", featured: true, order: 3 },
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: { ...p, status: "PUBLISHED" },
      create: { ...p, status: "PUBLISHED" },
    });
  }
  console.log("✅ 作品: 3 个");

  console.log("\n🎉 种子数据填充完成！");
}

main()
  .catch((e) => {
    console.error("❌ 种子数据填充失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
