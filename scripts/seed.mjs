// Seed 脚本：Lily Taylor 个人品牌网站数据
// 运行方式：node scripts/seed.mjs
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 生成头像与项目封面（text_to_image API）
const AVATAR_URL =
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=" +
  encodeURIComponent(
    "Editorial portrait of a young Asian woman with soft natural light, warm cream tones, film photography aesthetic, minimalist beige background, lifestyle magazine style, calm thoughtful expression, wearing neutral knit sweater"
  ) +
  "&image_size=portrait_4_3";

const PROJECT_COVERS = {
  assistant:
    "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=" +
    encodeURIComponent(
      "Minimalist product UI mockup of AI assistant chat interface, soft rose pink and cream color palette, modern editorial design, clean workspace"
    ) +
    "&image_size=landscape_4_3",
  agent:
    "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=" +
    encodeURIComponent(
      "Abstract visualization of AI agent workflow, soft pastel rose and mist purple gradient, minimalist editorial illustration, creative tech aesthetic"
    ) +
    "&image_size=landscape_4_3",
  eval:
    "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=" +
    encodeURIComponent(
      "Minimalist dashboard with charts and data visualization, cream and rose pink tones, editorial product design, soft natural light"
    ) +
    "&image_size=landscape_4_3",
};

async function main() {
  console.log("🧹 清空旧数据...");
  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.project.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.socialLink.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.contactMessage.deleteMany();

  console.log("👤 创建 Admin...");
  const passwordHash = bcrypt.hashSync("admin123", 10);
  await prisma.admin.create({
    data: { username: "admin", passwordHash },
  });

  console.log("📄 创建 Profile + Resume + SocialLinks (yaya)...");
  const profile = await prisma.profile.create({
    data: {
      name: "yaya",
      title: "AI 产品经理",
      bio: "## 你好，我是 yaya\n\n一名 24 岁的 **AI 产品经理**，关注 AI 与人类体验之间的连接。\n\n我相信优秀的 AI 产品，不仅需要智能，也需要理解人的情绪、需求和创造力。\n\n- 喜欢设计、阅读、艺术\n- 对 AI 技术保持好奇\n- 善于从用户角度思考产品",
      avatar: AVATAR_URL,
      location: "上海",
      email: "yaya@example.com",
      resume: {
        create: {
          summary: "AI 产品经理，专注智能助手、Agent 产品与 AI 评估方法论。擅长把模糊的用户需求转化为有温度的产品体验。",
          experiences: [
            {
              company: "月之暗面",
              title: "AI 产品经理",
              startDate: "2024-03",
              endDate: "",
              description: "主导智能助手与 Agent 产品的从 0 到 1 设计，建立 AI 评估方法论。",
              highlights: [
                "主导 AI 助手产品设计与上线",
                "建立 AI 评估指标体系，覆盖 5 大维度",
                "用户满意度提升 35%",
                "项目 slug: ai-assistant",
              ],
            },
            {
              company: "字节跳动",
              title: "产品经理",
              startDate: "2022-07",
              endDate: "2024-02",
              description: "负责内容推荐产品的用户研究与策略设计。",
              highlights: [
                "主导推荐算法产品策略升级",
                "用户时长 +18%，留存 +9%",
                "项目 slug: ai-agent-platform",
              ],
            },
          ],
          education: [
            {
              school: "复旦大学",
              major: "信息管理与信息系统",
              degree: "本科",
              startDate: "2018-09",
              endDate: "2022-06",
            },
          ],
          skills: [
            { name: "用户研究", level: "精通" },
            { name: "AI 产品设计", level: "精通" },
            { name: "AI 评估", level: "熟练" },
            { name: "数据分析", level: "熟练" },
            { name: "Figma", level: "一般" },
          ],
        },
      },
      socialLinks: {
        create: [
          { platform: "GitHub", url: "https://github.com/yaya", order: 1 },
          { platform: "Twitter", url: "https://twitter.com/yaya", order: 2 },
          { platform: "LinkedIn", url: "https://linkedin.com/in/yaya", order: 3 },
          { platform: "邮箱", url: "mailto:yaya@example.com", order: 4 },
        ],
      },
    },
  });
  console.log(`  Profile id=${profile.id}`);

  console.log("🏷️  创建 Categories...");
  const [catAI, catProduct, catDesign, catLife] = await Promise.all([
    prisma.category.create({ data: { name: "AI", slug: "ai", description: "关于 AI 产品的思考与实践" } }),
    prisma.category.create({ data: { name: "产品", slug: "product", description: "产品方法论与案例" } }),
    prisma.category.create({ data: { name: "设计", slug: "design", description: "设计观察与灵感" } }),
    prisma.category.create({ data: { name: "生活", slug: "life", description: "生活随笔" } }),
  ]);

  console.log("🏷️  创建 Tags...");
  const [tAI, tPM, tUX, tAgent, tDesign] = await Promise.all([
    prisma.tag.create({ data: { name: "AI", slug: "ai" } }),
    prisma.tag.create({ data: { name: "产品", slug: "product" } }),
    prisma.tag.create({ data: { name: "体验", slug: "ux" } }),
    prisma.tag.create({ data: { name: "Agent", slug: "agent" } }),
    prisma.tag.create({ data: { name: "设计", slug: "design" } }),
  ]);

  console.log("📝 创建 Posts...");
  const p1 = await prisma.post.create({
    data: {
      title: "为什么 AI 产品需要理解人",
      slug: "why-ai-products-need-empathy",
      excerpt: "智能不等于理解。一篇关于 AI 产品如何真正读懂用户情绪与需求的思考。",
      coverImage: null,
      status: "PINNED",
      readingTime: 7,
      categoryId: catAI.id,
      content: `# 为什么 AI 产品需要理解人

我们常说 AI 产品要"智能"，但**智能不等于理解**。

## 智能与理解的差距

一个能回答所有问题的 AI，未必是一个好的产品。

真正打动用户的，是那些"它懂我"的瞬间：
- 当你说"我有点累"时，它不会推一堆效率工具
- 当你犹豫不决时，它不会催促你做决定

\`\`\`js
// 优秀 AI 产品的核心
const goodAI = {
  智能: true,
  共情: true,
  懂语境: true,
};
\`\`\`

## 产品人的职责

我们作为产品人，要做的不是堆砌功能，而是：

1. 观察用户没说出口的需求
2. 设计有温度的交互节奏
3. 让 AI 学会"等待"与"沉默"

> 好的 AI 产品，不仅要有智能，更要对人有意义。`,
      postTags: { create: [{ tagId: tAI.id }, { tagId: tUX.id }] },
    },
  });

  const p2 = await prisma.post.create({
    data: {
      title: "从 0 到 1 设计一个 AI Agent",
      slug: "designing-ai-agent-from-scratch",
      excerpt: "AI Agent 不是简单的对话机器人。分享我从 0 到 1 设计 Agent 产品的完整方法论。",
      coverImage: null,
      status: "PUBLISHED",
      readingTime: 9,
      categoryId: catProduct.id,
      content: `# 从 0 到 1 设计一个 AI Agent

设计一个 AI Agent，远比想象中复杂。

## 第一步：定义 Agent 的人格

Agent 不是工具，而是一个"角色"。在开始设计前，先问自己：

- 它是谁？
- 它如何说话？
- 它的边界在哪里？

\`\`\`python
class 智能体人格:
    名字 = "小光"
    语气 = "温暖、用心"
    边界 = ["隐私", "安全"]
\`\`\`

## 第二步：设计决策树

Agent 的核心在于**自主决策**。我们需要设计：

1. **感知层**：理解用户意图
2. **思考层**：评估可行方案
3. **行动层**：执行并反馈

## 第三步：建立评估闭环

> 没有评估的 AI 产品，都是赌博。

建立多维度的评估体系，持续迭代。`,
      postTags: { create: [{ tagId: tAI.id }, { tagId: tAgent.id }, { tagId: tPM.id }] },
    },
  });

  const p3 = await prisma.post.create({
    data: {
      title: "我的 AI 产品实验记录",
      slug: "ai-product-experiments",
      excerpt: "这一年里，我做了 12 个 AI 小实验。有些成了产品，有些成了教训。",
      coverImage: null,
      status: "PUBLISHED",
      readingTime: 6,
      categoryId: catAI.id,
      content: `# 我的 AI 产品实验记录

过去一年，我做了 12 个 AI 小实验。

## 实验清单

### 1. AI 情绪日记
让 AI 根据你写的日记，识别情绪并给出温柔反馈。

### 2. 智能阅读伙伴
陪你读书、提问、讨论的小 Agent。

### 3. AI 餐桌推荐
根据冰箱里的食材，推荐今晚做什么。

## 教训

- **不是所有问题都需要 AI**
- **AI 的"温度"比"准确率"更重要**
- **失败也是数据**

> 持续实验，持续学习。`,
      postTags: { create: [{ tagId: tAI.id }] },
    },
  });

  const p4 = await prisma.post.create({
    data: {
      title: "设计观察：那些藏在细节里的温柔",
      slug: "design-details-that-care",
      excerpt: "好的产品，温柔藏在细节里。记录一些让我心动的产品设计瞬间。",
      coverImage: null,
      status: "PUBLISHED",
      readingTime: 5,
      categoryId: catDesign.id,
      content: `# 设计观察：那些藏在细节里的温柔

好的产品，温柔藏在细节里。

## 让我心动的瞬间

- **加载动画**：不是冰冷的转圈，而是缓缓绽放的花
- **错误提示**：不是"出错了"，而是"再试一次？"
- **空状态**：不是空白，而是留白 + 一句问候

## 设计原则

1. 永远给用户退路
2. 用情绪化的语言
3. 留白也是一种设计

> 设计不只是看起来怎样，更是它如何用心对待人。`,
      postTags: { create: [{ tagId: tDesign.id }, { tagId: tUX.id }] },
    },
  });

  const p5 = await prisma.post.create({
    data: {
      title: "咖啡、书与清晨的灵感（草稿）",
      slug: "coffee-books-morning-inspiration",
      excerpt: "正在写...",
      coverImage: null,
      status: "DRAFT",
      readingTime: 3,
      categoryId: catLife.id,
      content: `# 咖啡、书与清晨的灵感

每天清晨的仪式：
- 一杯手冲
- 一本好书
- 一段思考

待补充...`,
    },
  });
  console.log(`  ${[p1, p2, p3, p4, p5].map((p) => p.id).join(", ")}`);

  console.log("🎨 创建 Projects...");
  await prisma.project.createMany({
    data: [
      {
        title: "AI 智能助手",
        slug: "ai-assistant",
        description: "一款有温度的 AI 助手产品，从 0 到 1 主导设计与上线。重点解决用户获取信息效率低、情绪支持缺失的问题。",
        content: "# AI 智能助手\n\n## 问题\n用户获取信息效率低，且缺乏情绪支持。\n\n## 我的角色\n产品策略 · 体验设计 · AI 评估\n\n## 成果\n用户效率提升 40%，满意度 +35%。",
        role: "产品策略 · 体验 · AI 评估",
        duration: "2024 — 至今",
        url: null,
        coverImage: PROJECT_COVERS.assistant,
        status: "PUBLISHED",
        featured: true,
        order: 1,
      },
      {
        title: "AI 智能体平台",
        slug: "ai-agent-platform",
        description: "企业级 AI 智能体平台，支持自定义角色、决策树与评估闭环。让智能体真正「懂业务」。",
        content: "# AI 智能体平台\n\n## 问题\n企业难以快速构建可信赖的 AI 智能体。\n\n## 我的角色\n产品负责人 · 方法论设计\n\n## 成果\n助力 20+ 团队搭建智能体，平均上线周期缩短 60%。",
        role: "产品负责人",
        duration: "2022 — 2024",
        url: null,
        coverImage: PROJECT_COVERS.agent,
        status: "PUBLISHED",
        featured: true,
        order: 2,
      },
      {
        title: "AI 评估框架",
        slug: "ai-eval-framework",
        description: "自研 AI 评估方法论与工具集，覆盖准确性、安全性、温度、效率、可控性五大维度。",
        content: "# AI 评估框架\n\n## 问题\nAI 产品缺乏统一的评估标准。\n\n## 我的角色\n方法论负责人\n\n## 成果\n建立 5 维评估体系，被公司多个产品线采用。",
        role: "方法论负责人",
        duration: "2023",
        url: null,
        coverImage: PROJECT_COVERS.eval,
        status: "PUBLISHED",
        featured: false,
        order: 3,
      },
      {
        title: "未公开项目",
        slug: "secret-project",
        description: "草稿状态",
        content: "待补充",
        role: null,
        duration: null,
        url: null,
        coverImage: null,
        status: "DRAFT",
        featured: false,
        order: 99,
      },
    ],
  });

  console.log("📨 创建 ContactMessages...");
  await prisma.contactMessage.createMany({
    data: [
      { name: "晓雯", email: "xiaowen@example.com", subject: "合作邀请", message: "你好 yaya，想和你聊聊一个 AI 教育产品的合作机会。", status: "UNREAD" },
      { name: "明轩", email: "mingxuan@example.com", subject: null, message: "你的文章《为什么 AI 产品需要理解人》让我很受启发，谢谢分享！", status: "READ" },
    ],
  });

  console.log("\n✅ Seed 完成！");
  console.log("   Profile: yaya — AI 产品经理");
  console.log("   后台账号: admin / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
