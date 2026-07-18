# 个人博客 + 管理后台

基于 Next.js 14 App Router 的个人博客系统，包含前台展示和完整的后台管理功能。

## 功能特性

### 前台

- **首页**：个人简介、精选作品、最新文章
- **博客**：文章列表、详情页、分类/标签筛选、**分页**、**全文搜索**
- **作品**：项目展示、详情页（图片集、角色、时长、链接）
- **关于我**：个人介绍、技能、工作经历
- **联系页**：在线留言表单（访客可提交，后台可管理）

### 管理后台（/admin）

- **仪表板**：文章/作品/留言等数据统计
- **文章管理**：CRUD、封面图（16:9）、分类、标签、**分页搜索**
- **作品管理**：CRUD、封面图（16:10）、图片集（≤10 张）、**分页搜索**
- **分类 / 标签管理**：CRUD
- **留言管理**：状态切换（未读 / 已读 / 已回复 / 归档）、删除
- **个人信息**：头像上传（1:1，≤200px）、昵称、简介、社交链接
- **简历管理**：工作经历、技能、教育背景
- **修改密码**

### 图片上传

- 支持格式：`jpg` / `png` / `webp` / `gif`
- 大小限制：5MB
- 存储路径：`public/uploads/`
- 封面图维持比例：文章 16:9、作品 16:10
- 头像：1:1，最大宽度 200px

### 安全

- JWT 鉴权（`/admin` 与 `/api/admin` 路由受中间件保护）
- httpOnly Cookie 存储 Token
- bcryptjs 密码哈希
- Edge Runtime 兼容（使用 `jose` 验证 JWT）

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Next.js 14（App Router、RSC） |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS 3.x |
| ORM | Prisma 4.x + MySQL |
| 认证 | jsonwebtoken（Node） + jose（Edge） + bcryptjs |
| 图标 | lucide-react |
| 包管理 | npm |

## 快速开始

### 环境要求

- Node.js ≥ 18.18
- MySQL 8.x
- npm

### 安装

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填写数据库连接和 JWT 密钥：
#   DATABASE_URL="mysql://用户名:密码@localhost:3306/数据库名"
#   JWT_SECRET="你的随机密钥"

# 3. 同步数据库结构并生成 Prisma Client
npx prisma db push
npx prisma generate

# 4. 初始化种子数据（创建默认管理员账号）
npm run seed

# 5. 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看前台，[http://localhost:3000/admin/login](http://localhost:3000/admin/login) 进入后台。

### 默认管理员账号

- 用户名：`admin`
- 密码：`admin123`

> 首次登录后请及时在「修改密码」页面更换。

## 项目结构

```
blog-website/
├── prisma/
│   ├── schema.prisma        # 数据模型
│   └── seed.ts              # 种子数据
├── public/
│   └── uploads/             # 上传的图片
├── src/
│   ├── app/
│   │   ├── (公开前台)
│   │   │   ├── page.tsx         # 首页
│   │   │   ├── blog/            # 博客列表/详情/分类/标签
│   │   │   ├── projects/        # 作品列表/详情
│   │   │   ├── about/           # 关于我
│   │   │   └── contact/         # 联系页（留言表单）
│   │   ├── admin/
│   │   │   ├── login/           # 登录页
│   │   │   └── (dashboard)/     # 后台管理（受保护）
│   │   └── api/
│   │       ├── auth/            # 登录/登出
│   │       ├── contact/         # 公开留言提交
│   │       └── admin/           # 后台 API（受保护）
│   ├── components/
│   │   ├── admin/               # 后台组件
│   │   ├── Pagination.tsx       # 分页组件
│   │   ├── SearchBox.tsx        # 搜索框组件
│   │   ├── ContactForm.tsx      # 联系表单
│   │   ├── Header.tsx / Footer.tsx
│   │   └── SiteLayout.tsx
│   ├── lib/
│   │   ├── prisma.ts            # Prisma 客户端
│   │   ├── auth.ts              # 密码哈希、Token 生成
│   │   └── markdown.tsx         # Markdown 渲染
│   └── middleware.ts            # JWT 鉴权中间件
├── .env.example
├── .gitignore
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 核心设计

### URL 驱动的分页与搜索

前台博客列表和后台文章/作品列表均采用 URL 查询参数驱动：

- `?page=2` — 第 2 页
- `?q=关键词` — 搜索关键词

分页与搜索参数会被同时保留在 URL 中，便于分享与书签。

### 鉴权机制

- **中间件**（`src/middleware.ts`）：在 Edge Runtime 中使用 `jose` 验证 JWT，拦截所有 `/admin` 与 `/api/admin` 路径
- **登录 API**：验证密码后通过 `cookies().set()` 写入 httpOnly Cookie（`admin_token`），有效期 24 小时
- **页面请求**：未登录重定向至 `/admin/login?from=原路径`
- **API 请求**：未登录返回 401 JSON

### 图片上传

- 统一接口：`POST /api/admin/upload`（multipart/form-data）
- 前端组件：`ImageUploader`（单图）、`MultiImageUploader`（多图）
- 文件名：`{timestamp}-{random}.{ext}`，存储在 `public/uploads/`

## 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 生产构建
npm run start    # 启动生产服务器
npm run lint     # ESLint 检查
npx tsc --noEmit # TypeScript 类型检查
npm run seed     # 重新执行种子数据
npx prisma db push   # 同步 schema 到数据库
npx prisma generate  # 重新生成 Prisma Client
npx prisma studio    # 可视化数据库管理工具
```

## 部署

### Vercel

1. Fork 仓库到自己的 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（`DATABASE_URL`、`JWT_SECRET`）
4. 部署前确保数据库可访问，并执行 `npx prisma db push` 同步结构

### 其他平台

需支持 Node.js 18+ 运行时与 MySQL 连接。构建命令：`npm run build`，启动命令：`npm run start`。

## 许可

MIT
