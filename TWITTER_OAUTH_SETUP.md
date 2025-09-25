# Twitter OAuth 配置指南

## 📋 概述

本指南将帮助您配置 Twitter OAuth 登录功能，让用户可以使用他们的 Twitter 账户登录您的应用。

## 🔧 前提条件

- Twitter 开发者账户（免费）
- 已部署的应用或本地开发环境

## 📝 配置步骤

### 第一步：创建 Twitter 开发者账户

1. **访问 Twitter Developer Portal**
   - 前往 [developer.twitter.com](https://developer.twitter.com/)
   - 使用您的 Twitter 账户登录

2. **申请开发者访问权限**
   - 点击 "Apply for a developer account"
   - 填写申请表格，说明您的使用目的
   - 等待审核通过（通常几分钟到几小时）

### 第二步：创建 Twitter 应用

1. **创建新应用**
   - 登录 Twitter Developer Portal
   - 点击 "Create an app"
   - 填写应用信息：
     - App name: `IAmHere Travel App`
     - Description: `AI-powered travel companion app`
     - Website URL: `http://localhost:3000` (开发环境) 或您的生产域名
     - Use case: `Making it easier for people to access my app`

2. **配置应用设置**
   - 在应用详情页面，点击 "App settings"
   - 确保以下设置正确：
     - App permissions: `Read and write`
     - Type of App: `Web App, Automated App or Bot`

### 第三步：配置 OAuth 设置

1. **设置 OAuth 1.0a**
   - 在应用设置中，找到 "Authentication settings"
   - 启用 "Enable 3-legged OAuth"
   - 在 "Callback URLs" 中添加：
     ```
     http://localhost:3000/api/auth/callback/twitter
     ```
   - 对于生产环境，还需添加：
     ```
     https://yourdomain.com/api/auth/callback/twitter
     ```

2. **设置 OAuth 2.0（可选）**
   - 如果您想使用 OAuth 2.0，启用 "OAuth 2.0"
   - 设置相同的回调 URL

### 第四步：获取 API 凭据

1. **获取 API Keys**
   - 在应用详情页面，点击 "Keys and tokens" 标签
   - 复制以下信息：
     - **API Key** (Consumer Key)
     - **API Secret Key** (Consumer Secret)

2. **生成 Access Token（如果需要）**
   - 在同一页面，点击 "Generate" 生成访问令牌
   - 这些令牌用于代表您的应用访问 Twitter API

### 第五步：配置环境变量

在您的 `.env.local` 文件中添加以下配置：

```env
# Twitter OAuth Configuration
TWITTER_CLIENT_ID="your-twitter-api-key"
TWITTER_CLIENT_SECRET="your-twitter-api-secret"
```

将 `your-twitter-api-key` 和 `your-twitter-api-secret` 替换为您从 Twitter Developer Portal 获取的实际值。

### 第六步：配置应用域名（生产环境）

1. **设置网站 URL**
   - 在应用设置中，确保 "Website URL" 指向您的生产域名
   - 例如：`https://yourdomain.com`

2. **配置隐私政策和服务条款**
   - Privacy Policy URL: `https://yourdomain.com/privacy`
   - Terms of Service URL: `https://yourdomain.com/terms`

## 🚀 生产环境配置

### 环境变量设置

在生产环境中，确保设置以下环境变量：

```env
NEXTAUTH_URL="https://yourdomain.com"
TWITTER_CLIENT_ID="your-production-twitter-api-key"
TWITTER_CLIENT_SECRET="your-production-twitter-api-secret"
```

### 回调 URL 配置

确保在 Twitter 应用设置中添加生产环境的回调 URL：
```
https://yourdomain.com/api/auth/callback/twitter
```

## 🧪 测试配置

### 本地测试

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问登录页面：`http://localhost:3000/auth/signin`

3. 点击 "使用 Twitter 登录" 按钮

4. 验证是否能正确跳转到 Twitter 授权页面

### 验证脚本

运行验证脚本检查配置：
```bash
node scripts/verify-twitter-oauth.js
```

## ❗ 常见问题

### 1. "Invalid callback URL" 错误
- 确保回调 URL 完全匹配，包括协议（http/https）
- 检查是否在 Twitter 应用设置中正确添加了回调 URL

### 2. "App permissions insufficient" 错误
- 确保应用权限设置为 "Read and write"
- 重新生成 API keys 如果权限更改后仍有问题

### 3. "Invalid API key" 错误
- 检查环境变量中的 API Key 是否正确
- 确保没有多余的空格或引号

### 4. 开发环境无法访问
- 确保使用 `http://localhost:3000` 而不是 `https://`
- 检查端口号是否正确

## 🔒 安全注意事项

1. **保护 API Secret**
   - 永远不要在客户端代码中暴露 API Secret
   - 使用环境变量存储敏感信息

2. **使用 HTTPS**
   - 生产环境必须使用 HTTPS
   - 确保所有回调 URL 使用 HTTPS

3. **定期轮换密钥**
   - 定期更新 API keys 和 secrets
   - 如果怀疑密钥泄露，立即重新生成

## 📋 测试清单

- [ ] Twitter 开发者账户已创建并验证
- [ ] Twitter 应用已创建并配置
- [ ] OAuth 设置已正确配置
- [ ] API Keys 已获取并配置到环境变量
- [ ] 回调 URL 已正确设置（开发和生产环境）
- [ ] 本地测试通过
- [ ] 生产环境测试通过

## 🔗 相关链接

- [Twitter Developer Portal](https://developer.twitter.com/)
- [Twitter API Documentation](https://developer.twitter.com/en/docs)
- [NextAuth.js Twitter Provider](https://next-auth.js.org/providers/twitter)
- [OAuth 1.0a Specification](https://oauth.net/core/1.0a/)

## 📞 支持

如果您在配置过程中遇到问题，请参考：
- [Twitter Developer Community](https://twittercommunity.com/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- 项目的 GitHub Issues