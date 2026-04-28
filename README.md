# AutoCard - 自动发卡平台

基于 Next.js + Supabase + Resend 的自动数字卡券发货平台。

## 功能

- **首页** - 展示所有上架的卡券产品，实时显示库存
- **购买流程** - 选择产品 → 填写邮箱 → 模拟支付 → 自动发货
- **订单查询** - 通过订单号 + 邮箱查询订单状态和卡券信息
- **邮件通知** - 购买成功后自动发送卡券到邮箱
- **后台管理** - 产品 CRUD、卡券批量录入、数据统计

## 技术栈

- **Next.js 16** + React 19 + TypeScript
- **Tailwind CSS** - 样式
- **Supabase** - PostgreSQL 数据库
- **Resend** - 邮件发送

## 部署步骤

### 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 创建项目
2. 在 SQL Editor 中执行 `sql/schema.sql`
3. 获取项目凭证（Settings > API）：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** (`sb_secret_...`) → `SUPABASE_SECRET_KEY`

### 2. 配置 Resend 邮件

1. 访问 [resend.com](https://resend.com) 注册
2. 获取 API Key
3. 添加并验证你的域名（或使用 `@resend.dev` 测试域名）

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx

# Resend Email
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=AutoCard <noreply@yourdomain.com>

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 4. 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

或在 Vercel Dashboard 中导入 GitHub 仓库并配置环境变量。

### 5. 配置产品

1. 访问后台 `/admin`
2. 添加产品（名称、价格、描述）
3. 批量录入卡券库存

## 项目结构

```
├── app/
│   ├── page.tsx              # 首页（产品列表）
│   ├── buy/[id]/             # 购买页
│   ├── success/              # 购买成功页
│   ├── query/                # 订单查询页
│   ├── admin/                # 后台管理
│   └── api/
│       ├── order/            # 创建订单 / 查询订单
│       └── admin/            # 产品/卡券/统计管理
├── components/
├── lib/
│   ├── supabase.ts           # Supabase 客户端
│   └── email.ts              # 邮件服务
├── types/
└── sql/schema.sql            # 数据库 Schema
```

## 关于支付

当前为**模拟支付（Mock）**模式，点击购买后直接进入发货流程，不扣除真实费用。

如需接入真实支付，代码中已预留 Lemon Squeezy 接入文件：
- `lib/lemonsqueezy.ts` - SDK 配置
- `app/api/checkout/route.ts` - 创建 LS checkout
- `app/api/webhooks/lemonsqueezy/route.ts` - 支付回调

或可自行接入其他支付方案（Stripe、Paddle、支付宝、微信等）。

## 注意事项

- 部署前务必配置 `SUPABASE_SECRET_KEY`，API 路由需要它进行数据库操作
- Resend 邮件在开发环境下如未配置会自动跳过，不会导致订单失败
- 卡券库存通过数据库事务保证原子性（查找可用卡券 → 创建订单 → 标记已售）
- 后台 `/admin` 目前无认证（为方便演示），生产环境建议添加登录保护
