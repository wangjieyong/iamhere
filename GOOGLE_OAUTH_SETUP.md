# Google OAuth 配置指南

## 问题说明
当前Google登录出现404错误是因为环境变量中的Google OAuth凭据是占位符，需要配置真实的Google Cloud Console凭据。

## 配置步骤

### 1. 创建Google Cloud项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 记录项目ID

### 2. 启用必要的API
在Google Cloud Console中启用以下API：
- Google+ API
- Google Identity API
- People API (可选，用于获取用户信息)

### 3. 创建OAuth 2.0凭据
1. 在Google Cloud Console中，导航到 "APIs & Services" > "Credentials"
2. 点击 "Create Credentials" > "OAuth 2.0 Client IDs"
3. 选择应用类型为 "Web application"
4. 配置授权重定向URI：
   - 开发环境：`http://localhost:3001/api/auth/callback/google`
   - 生产环境：`https://yourdomain.com/api/auth/callback/google`

### 4. 更新环境变量

#### 开发环境 (`.env.local`)
```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-actual-google-client-id"
GOOGLE_CLIENT_SECRET="your-actual-google-client-secret"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret-key"
```

#### 生产环境配置
在部署平台（如Vercel）中设置以下环境变量：

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"

# NextAuth Configuration
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="your-production-secret-key-32-chars-min"

# Database
DATABASE_URL="postgresql://username:password@host:5432/database"

# Google AI API
GOOGLE_AI_API_KEY="your-google-ai-api-key"

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="your-mapbox-access-token"

# Optional: Cloud Storage
STORAGE_PROVIDER="cloudinary" # or "s3" or "local"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Production Settings
NODE_ENV="production"
```

### 5. 配置授权重定向URI

#### 开发环境
- `http://localhost:3000/api/auth/callback/google`

#### 生产环境
- `https://your-domain.com/api/auth/callback/google`
- `https://www.your-domain.com/api/auth/callback/google` (如果使用www子域名)

### 6. 重启服务器
```bash
# 开发环境
npm run dev

# 生产环境
npm run build && npm start
```

## 验证配置

### 开发环境
1. 访问 http://localhost:3000/auth/signin
2. 点击 "使用Google登录" 按钮
3. 应该会重定向到Google登录页面
4. 登录成功后会重定向回应用

### 生产环境
1. 访问 https://your-domain.com/auth/signin
2. 测试Google登录流程
3. 检查用户会话和数据库记录

## 安全最佳实践

### 1. 环境变量安全
- 使用强随机密钥作为 `NEXTAUTH_SECRET`
- 不要在代码中硬编码敏感信息
- 定期轮换API密钥

### 2. OAuth配置安全
- 限制授权重定向URI到已知域名
- 启用Google Cloud Console中的安全设置
- 监控OAuth使用情况

### 3. 生产环境检查清单
- [ ] Google OAuth凭据已配置
- [ ] 授权重定向URI已添加
- [ ] NEXTAUTH_SECRET已设置（至少32字符）
- [ ] NEXTAUTH_URL指向正确的生产域名
- [ ] 数据库连接已配置
- [ ] 所有必需的API密钥已设置
- [ ] 环境变量已在部署平台配置

## 符合PRD要求
根据IAmHere PRD文档：
- ✅ 支持Google社交登录
- ✅ 极致简约的登录页面设计
- ✅ 安全的用户认证机制
- ✅ 生产环境就绪配置
- ✅ 用户"静默"创建账户
- ✅ 登录后直接进入核心创作页面

## 故障排除
如果仍然出现404错误：
1. 检查Google Cloud Console中的重定向URI配置
2. 确认API已启用
3. 验证环境变量格式正确
4. 检查开发服务器日志