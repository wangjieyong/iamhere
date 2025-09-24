# 部署到 Vercel 详细指南

## 🚀 快速部署步骤

### 第一步：准备代码仓库

1. **确保代码已提交到 Git 仓库**
```bash
# 添加所有文件
git add .

# 提交更改
git commit -m "feat: 准备部署到生产环境"

# 推送到远程仓库（GitHub/GitLab/Bitbucket）
git push origin main
```

### 第二步：部署到 Vercel

1. **访问 Vercel**
   - 前往 [vercel.com](https://vercel.com)
   - 使用 GitHub/GitLab/Bitbucket 账户登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的 Git 仓库 `iamhere`
   - 点击 "Import"

3. **配置项目设置**
   - Project Name: `iamhere`
   - Framework Preset: Next.js (自动检测)
   - Root Directory: `./` (默认)
   - Build Command: `npm run build` (默认)
   - Output Directory: `.next` (默认)

### 第三步：配置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 必需的环境变量

```bash
# 数据库配置 (使用 Vercel Postgres 或其他云数据库)
DATABASE_URL=postgresql://username:password@host:5432/database

# NextAuth 配置
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=your-32-character-secret-key

# Google OAuth (从 Google Cloud Console 获取)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google AI API (从 Google AI Studio 获取)
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Mapbox (从 Mapbox 获取)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token

# 生产环境设置
NODE_ENV=production
NEXT_PUBLIC_DEMO_MODE=false

# 分析和监控 (可选)
# Vercel Analytics 会自动启用，无需额外配置
# Google Analytics 4 - 后续迭代可启用
ENABLE_GA4=false
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

#### 可选的环境变量

```bash
# 如果使用云存储
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name

# 或者使用 Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 第四步：配置数据库

#### 选项 1：使用 Vercel Postgres (推荐)

1. 在 Vercel 项目中，前往 "Storage" 标签
2. 点击 "Create Database" > "Postgres"
3. 选择区域和计划
4. 创建后，Vercel 会自动添加 `DATABASE_URL` 环境变量

#### 选项 2：使用其他云数据库

- **Supabase**: 免费的 PostgreSQL 数据库
- **PlanetScale**: MySQL 数据库
- **Railway**: PostgreSQL/MySQL 数据库
- **Neon**: PostgreSQL 数据库

### 第五步：运行数据库迁移

1. **在 Vercel 项目中添加构建命令**
   - 前往项目设置 > "General"
   - 在 "Build & Development Settings" 中
   - Build Command: `npx prisma generate && npx prisma migrate deploy && npm run build`

2. **或者手动运行迁移**
```bash
# 在本地连接到生产数据库运行迁移
DATABASE_URL="your-production-database-url" npx prisma migrate deploy
```

### 第六步：配置域名和 OAuth 重定向

1. **更新 Google OAuth 设置**
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 导航到 "APIs & Services" > "Credentials"
   - 编辑 OAuth 2.0 客户端
   - 添加授权重定向 URI：
     ```
     https://your-project-name.vercel.app/api/auth/callback/google
     ```

2. **配置自定义域名（可选）**
   - 在 Vercel 项目设置中，前往 "Domains"
   - 添加你的自定义域名
   - 更新 `NEXTAUTH_URL` 环境变量为你的自定义域名

### 第七步：部署和测试

1. **触发部署**
   - 推送代码到 Git 仓库会自动触发部署
   - 或在 Vercel Dashboard 中手动触发部署

2. **测试功能**
   - 访问部署的网站
   - 测试用户登录
   - 测试图像生成功能
   - 检查数据库连接

## 🔧 故障排除

### 常见问题

1. **构建失败**
   - 检查环境变量是否正确设置
   - 确保所有依赖都在 `package.json` 中

2. **数据库连接失败**
   - 验证 `DATABASE_URL` 格式正确
   - 确保数据库迁移已运行

3. **OAuth 登录失败**
   - 检查 Google OAuth 重定向 URI 配置
   - 验证 `NEXTAUTH_URL` 设置正确

4. **Gemini API 调用失败**
   - 确保 `GOOGLE_AI_API_KEY` 有效
   - 检查 API 配额和权限

### 监控和日志

1. **查看部署日志**
   - 在 Vercel Dashboard 中查看 "Functions" 标签
   - 检查实时日志和错误信息

2. **性能监控和分析**
   - **Vercel Analytics**: 自动启用，提供页面访问、性能指标和用户行为数据
   - **实时监控**: 在 Vercel Dashboard 的 "Analytics" 标签查看数据
   - **错误追踪**: 通过 Vercel Functions 日志监控 API 错误
   - **性能指标**: 监控页面加载时间、API 响应时间等

## 📝 部署后检查清单

- [ ] 网站可以正常访问
- [ ] 用户可以登录/注册
- [ ] 图像生成功能正常工作
- [ ] 数据库读写正常
- [ ] 地图功能正常显示
- [ ] 所有 API 端点响应正常
- [ ] 错误处理和日志记录正常

## 🎉 完成！

恭喜！你的 IAmHere 应用现在已经部署到生产环境。你可以：

1. 分享你的应用链接
2. 监控应用性能和使用情况
3. 根据需要扩展功能
4. 设置自动化部署流程

如果遇到任何问题，请查看 Vercel 文档或联系支持团队。