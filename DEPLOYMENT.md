# IAmHere 部署指南

本文档详细说明如何将 IAmHere 应用部署到生产环境。

## 🚀 部署前准备

### 1. 环境要求

- Node.js 18+
- PostgreSQL 数据库
- Google Cloud Platform 账户
- Mapbox 账户
- Vercel 账户（推荐）或其他托管平台

### 2. 必需的API密钥和服务

#### Google Cloud Platform 配置

1. **创建项目**
   - 访问 [Google Cloud Console](https://console.cloud.google.com/)
   - 创建新项目或选择现有项目

2. **启用必需的API**
   ```bash
   # 启用以下API
   - Google+ API (用于OAuth)
   - Generative Language API (用于Gemini AI)
   ```

3. **创建OAuth 2.0凭据**
   - 导航到 "APIs & Services" > "Credentials"
   - 点击 "Create Credentials" > "OAuth 2.0 Client IDs"
   - 应用类型选择 "Web application"
   - 添加授权重定向URI：
     - 开发环境：`http://localhost:3000/api/auth/callback/google`
     - 生产环境：`https://your-domain.com/api/auth/callback/google`

4. **获取AI API密钥**
   - 访问 [Google AI Studio](https://aistudio.google.com/)
   - 创建API密钥

#### Mapbox 配置

1. 访问 [Mapbox](https://www.mapbox.com/)
2. 注册账户并创建访问令牌
3. 配置域名白名单（生产环境）

#### 数据库配置

推荐使用以下PostgreSQL托管服务之一：

1. **Supabase** (推荐)
   - 访问 [Supabase](https://supabase.com/)
   - 创建新项目
   - 获取数据库连接字符串

2. **PlanetScale**
   - 访问 [PlanetScale](https://planetscale.com/)
   - 创建数据库
   - 获取连接字符串

3. **Neon**
   - 访问 [Neon](https://neon.tech/)
   - 创建数据库
   - 获取连接字符串

## 📦 Vercel 部署（推荐）

### 1. 准备代码

```bash
# 确保代码已推送到GitHub
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 2. 连接Vercel

1. 访问 [Vercel](https://vercel.com/)
2. 使用GitHub账户登录
3. 点击 "New Project"
4. 导入 `iamhere` 仓库

### 3. 配置环境变量

在Vercel项目设置中添加以下环境变量：

```bash
# 数据库
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth.js
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-secure-random-string-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google AI
GOOGLE_AI_API_KEY="your-google-ai-api-key"

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="your-mapbox-access-token"

# 可选：云存储
STORAGE_PROVIDER="cloudinary"  # 或 "s3" 或 "local"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# 可选：监控
ENABLE_ANALYTICS="true"
```

### 4. 配置构建设置

Vercel会自动检测Next.js项目，但确保以下设置：

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 5. 数据库迁移

部署后，需要运行数据库迁移：

```bash
# 在本地运行（连接生产数据库）
DATABASE_URL="your-production-database-url" npx prisma migrate deploy

# 或者在Vercel Functions中运行
# 创建一个临时API端点来运行迁移
```

### 6. 自定义域名（可选）

1. 在Vercel项目设置中点击 "Domains"
2. 添加自定义域名
3. 按照DNS配置说明设置域名解析
4. 更新Google OAuth重定向URI

## 🔧 手动部署

### 1. 服务器准备

```bash
# 安装Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2（进程管理器）
npm install -g pm2

# 克隆代码
git clone <your-repo-url>
cd iamhere
```

### 2. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

### 3. 安装依赖和构建

```bash
# 安装依赖
npm install

# 运行数据库迁移
npx prisma migrate deploy

# 构建应用
npm run build
```

### 4. 启动应用

```bash
# 使用PM2启动
pm2 start npm --name "iamhere" -- start

# 设置开机自启
pm2 startup
pm2 save
```

### 5. 配置反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔍 部署后验证

### 1. 健康检查

访问 `https://your-domain.com/api/health` 检查服务状态。

### 2. 功能测试

1. **用户认证**：测试Google OAuth登录
2. **图片上传**：上传测试图片
3. **地图选择**：选择地理位置
4. **AI生成**：测试图片生成功能
5. **图库管理**：查看和删除图片

### 3. 性能监控

- 检查Vercel Analytics（如果使用Vercel）
- 监控API响应时间
- 检查错误日志

## 🛠️ 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查连接字符串格式
   # PostgreSQL: postgresql://username:password@host:port/database
   
   # 测试连接
   npx prisma db pull
   ```

2. **OAuth重定向错误**
   - 检查Google Cloud Console中的重定向URI配置
   - 确保NEXTAUTH_URL与实际域名匹配

3. **AI API调用失败**
   - 验证Google AI API密钥
   - 检查API配额和计费设置

4. **地图不显示**
   - 验证Mapbox访问令牌
   - 检查域名白名单设置

### 日志查看

```bash
# Vercel部署
# 在Vercel控制台查看Functions日志

# 手动部署
pm2 logs iamhere

# 数据库日志
# 查看数据库提供商的日志界面
```

## 🔄 更新部署

### Vercel自动部署

推送到main分支会自动触发部署：

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### 手动更新

```bash
# 拉取最新代码
git pull origin main

# 安装新依赖（如有）
npm install

# 运行数据库迁移（如有）
npx prisma migrate deploy

# 重新构建
npm run build

# 重启应用
pm2 restart iamhere
```

## 📊 监控和维护

### 1. 设置监控

- **Uptime监控**：使用UptimeRobot或类似服务
- **错误监控**：集成Sentry
- **性能监控**：使用Vercel Analytics或Google Analytics

### 2. 定期维护

- 监控数据库性能和存储使用
- 检查API配额使用情况
- 更新依赖包安全补丁
- 备份数据库

### 3. 扩展考虑

- 配置CDN加速静态资源
- 实现图片压缩和优化
- 添加缓存层（Redis）
- 考虑多区域部署

## 🔐 安全最佳实践

1. **环境变量安全**
   - 使用强随机密钥
   - 定期轮换敏感密钥
   - 不在代码中硬编码密钥

2. **数据库安全**
   - 使用SSL连接
   - 限制数据库访问IP
   - 定期备份数据

3. **API安全**
   - 实现速率限制
   - 验证输入数据
   - 使用HTTPS

4. **监控安全**
   - 监控异常访问模式
   - 设置错误告警
   - 定期安全审计

---

部署完成后，你的IAmHere应用就可以为真实用户提供服务了！🎉