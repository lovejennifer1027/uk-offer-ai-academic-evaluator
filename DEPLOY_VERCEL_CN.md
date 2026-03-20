# Vercel 超简部署说明

这份说明是给第一次部署网站的人准备的。

## 你现在要做的事情

只需要完成 4 步：

1. 把这个项目上传到 GitHub
2. 在 Vercel 里导入这个 GitHub 仓库
3. 把环境变量复制进去
4. 点 Deploy

---

## 第 1 步：把项目上传到 GitHub

项目目录是：

`/Users/lj/Documents/New project/uk-offer-ai-academic-evaluator`

如果你已经有 GitHub 仓库，把这个项目推上去即可。

如果你还没有仓库：

1. 登录 GitHub
2. 点右上角 `New repository`
3. 仓库名可以填：
   `uk-offer-ai-academic-evaluator`
4. 创建后，把本地项目上传进去

---

## 第 2 步：在 Vercel 导入项目

1. 打开 [https://vercel.com/new](https://vercel.com/new)
2. 选择你刚刚上传的 GitHub 仓库
3. Framework 看到 `Next.js` 就不用改
4. Root Directory 保持默认
5. Build / Install 也不用改

这个项目已经包含：

- `vercel.json`
- `package.json`
- `Next.js App Router` 配置

所以 Vercel 一般会自动识别。

---

## 第 3 步：复制环境变量

先用这组最稳的配置，先把网站部署成功：

```env
NEXT_PUBLIC_SITE_URL=https://your-project-name.vercel.app

UKOFFER_ADMIN_TOKEN=change-this-to-a-strong-admin-password

ENABLE_DEMO_EVALUATION=true

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.4
OPENAI_NORMALIZATION_MODEL=gpt-5.4-mini
OPENAI_INSIGHTS_MODEL=gpt-5.4
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

### 先这样理解

- `NEXT_PUBLIC_SITE_URL`
  改成你自己的 Vercel 地址
- `UKOFFER_ADMIN_TOKEN`
  后台登录密码，自己设一个
- `ENABLE_DEMO_EVALUATION=true`
  没有 OpenAI key 也能先把评估页面跑起来
- `SUPABASE_URL`
  先没有也行，但历史记录 / library 数据库功能会受限
- `SUPABASE_SERVICE_ROLE_KEY`
  先没有也行，但数据库功能会受限
- `OPENAI_API_KEY`
  先没有也行，只要 demo 模式开着

---

## 第 4 步：点击 Deploy

环境变量填完后，直接点：

`Deploy`

第一次部署通常要等 1 到 3 分钟。

---

## 部署成功后先看哪里

先打开这些页面：

- `/`
- `/evaluate`
- `/history`
- `/library`
- `/library/examples`
- `/library/rubrics`
- `/library/insights`

后台入口再看：

- `/admin/universities`
- `/admin/sources`
- `/admin/library-sync`

后台会要求你输入：

`UKOFFER_ADMIN_TOKEN`

---

## 如果你只想先把页面跑起来

那你可以先只填这 3 个：

```env
NEXT_PUBLIC_SITE_URL=https://your-project-name.vercel.app
UKOFFER_ADMIN_TOKEN=change-this-to-a-strong-admin-password
ENABLE_DEMO_EVALUATION=true
```

这样至少：

- 首页能打开
- 评估页能打开
- 后台能登录
- 大部分界面能先看

---

## 如果你后面要开完整功能

后面再补这几个：

```env
OPENAI_API_KEY=sk-xxxx
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 你现在最少要自己做的事

我这边已经把项目整理到适合部署的状态了，但下面两件事必须你自己在网页上点：

1. 登录你自己的 GitHub / Vercel
2. 在 Vercel 网页里导入仓库并点 Deploy

这是因为我不能直接替你登录你的私人账号。

如果你愿意，下一步我可以继续给你：

1. GitHub 上传项目的最简单方法
2. Supabase 数据库的最简单方法
3. 部署后怎么检查是不是成功
