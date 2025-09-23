# Vercel 部署指南

## 快速部署到 Vercel

### 前提条件
- [x] 已完成部署前检查 (`npm run pre-deploy`)
- [x] 拥有 Vercel 账户
- [x] 准备好所有必需的 API 密钥和服务

### 第一步：准备代码仓库

1. **推送代码到 Git 仓库**
```bash
git add .
git commit -m "feat: 准备生产环境部署"
git push origin main
```

### 第二步：连接 Vercel

1. **访问 Vercel Dashboard**
   - 前往 [vercel.com](https://vercel.com)
   - 使用 GitHub/GitLab/Bitbucket 登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的 Git 仓库
   - 点击 "Import"

3. **配置项目设置**
   - Project Name: `iamhere` (或你喜欢的名称)
   - Framework Preset: Next.js (自动检测)
   - Root Directory: `./` (默认)

### 第三步：配置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 必需的环境变量

```bash
# 数据库配置
DATABASE_URL=postgresql://username:password@host:5432/database

# NextAuth 配置
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-32-character-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google AI API
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token

# 生产环境设置
NODE_ENV=production
```

#### 可选的云存储配置

**Cloudinary (推荐)**
```bash
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**AWS S3**
```bash
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### 第四步：配置构建设置

在 Vercel 项目设置中：

1. **Build & Development Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next` (默认)
   - Install Command: `npm install`

2. **Functions**
   - 确保 API 路由超时设置为 30 秒

### 第五步：部署

1. **首次部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成

2. **检查部署状态**
   - 查看构建日志
   - 确认没有错误

### 第六步：配置数据库

部署成功后，需要运行数据库迁移：

1. **在 Vercel 中运行迁移**
```bash
# 在本地运行（连接到生产数据库）
npx prisma migrate deploy
```

2. **或者使用 Vercel CLI**
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

### 第七步：配置自定义域名（可选）

1. **在 Vercel Dashboard 中**
   - 进入项目设置
   - 点击 "Domains"
   - 添加你的自定义域名

2. **更新 DNS 设置**
   - 添加 CNAME 记录指向 Vercel
   - 等待 DNS 传播

3. **更新环境变量**
   - 将 `NEXTAUTH_URL` 更新为你的自定义域名
   - 重新部署项目

### 第八步：更新 Google OAuth 设置

1. **在 Google Cloud Console 中**
   - 添加新的授权重定向 URI：
     - `https://your-domain.vercel.app/api/auth/callback/google`
     - `https://your-custom-domain.com/api/auth/callback/google`

### 第九步：验证部署

1. **功能测试**
   - [ ] 访问首页
   - [ ] 测试 Google 登录
   - [ ] 测试图片生成功能
   - [ ] 检查地图功能
   - [ ] 验证图片存储

2. **性能检查**
   - [ ] 检查页面加载速度
   - [ ] 测试 API 响应时间
   - [ ] 验证健康检查端点：`/health`

3. **监控设置**
   - [ ] 检查 Vercel Analytics
   - [ ] 设置错误监控
   - [ ] 配置性能监控

## 常见问题解决

### 构建失败
```bash
# 检查依赖
npm install

# 本地测试构建
npm run build

# 检查 TypeScript 错误
npx tsc --noEmit
```

### 数据库连接问题
```bash
# 测试数据库连接
npx prisma db pull

# 重新生成 Prisma 客户端
npx prisma generate
```

### 环境变量问题
```bash
# 检查环境变量
vercel env ls

# 拉取环境变量到本地
vercel env pull .env.production
```

## 部署后维护

### 更新部署
```bash
# 推送代码更改
git push origin main

# Vercel 会自动重新部署
```

### 监控和日志
```bash
# 查看部署日志
vercel logs

# 查看函数日志
vercel logs --follow
```

### 数据库维护
```bash
# 运行新的迁移
npx prisma migrate deploy

# 查看数据库状态
npx prisma studio
```

## 安全检查清单

- [ ] 所有敏感信息都在环境变量中
- [ ] NEXTAUTH_SECRET 是强随机字符串
- [ ] 数据库连接使用 SSL
- [ ] API 密钥权限最小化
- [ ] 启用 CORS 保护
- [ ] 配置适当的缓存策略

## 性能优化

- [ ] 启用 Vercel Analytics
- [ ] 配置图片优化
- [ ] 启用静态资源缓存
- [ ] 监控 API 响应时间
- [ ] 设置适当的超时时间

---

🎉 **恭喜！你的 IAmHere 应用已成功部署到生产环境！**

如需帮助，请参考：
- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)