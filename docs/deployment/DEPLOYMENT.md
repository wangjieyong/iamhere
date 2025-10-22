# 部署指南

## 概述
本项目是一个基于Next.js的全栈应用，支持Google和Twitter OAuth登录，以及邮箱魔法链接登录。

## 部署平台
推荐使用Vercel进行部署，详细步骤请参考 `DEPLOY_TO_VERCEL.md`。

## 环境变量
部署前请确保配置以下环境变量：

### 必需变量
- `DATABASE_URL` - 数据库连接字符串
- `NEXTAUTH_URL` - 应用的完整URL
- `NEXTAUTH_SECRET` - NextAuth.js密钥
- `GOOGLE_CLIENT_ID` - Google OAuth客户端ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth客户端密钥
- `TWITTER_CLIENT_ID` - Twitter OAuth客户端ID
- `TWITTER_CLIENT_SECRET` - Twitter OAuth客户端密钥
- `GOOGLE_AI_API_KEY` - Google AI API密钥
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox访问令牌
- `RESEND_API_KEY` - Resend邮件服务API密钥（用于魔法链接登录）
- `EMAIL_FROM` - 发件人邮箱地址

## 部署前检查
运行以下命令进行部署前检查：
```bash
node scripts/pre-deploy-check.js
```

## OAuth配置
- Google OAuth: 参考 `../oauth/GOOGLE_OAUTH_SETUP.md`
- Twitter OAuth: 参考 `../oauth/TWITTER_OAUTH_SETUP.md`

## 邮件服务配置
项目使用Resend作为邮件服务提供商，用于发送魔法链接登录邮件。

### 配置步骤
1. 访问 [Resend官网](https://resend.com/) 注册账户
2. 在控制台中创建API密钥
3. 配置发件人域名（可选，用于自定义发件人地址）
4. 将API密钥设置为环境变量 `RESEND_API_KEY`
5. 设置发件人邮箱地址 `EMAIL_FROM`

### 注意事项
- 如果不配置邮件服务，魔法链接登录功能将不可用
- 建议在生产环境中使用已验证的域名作为发件人地址
- 详细配置指南请参考 `../services/EMAIL_SERVICE_GUIDE.md`

## 部署状态

### ✅ 已完成配置
- [x] GitHub 仓库连接
- [x] Vercel 项目设置
- [x] 所有必需环境变量配置
- [x] 邮件服务配置 (RESEND_API_KEY, EMAIL_FROM)
- [x] OAuth 回调 URL 配置
- [x] 构建配置优化 (移除 Turbopack)
- [x] NextAuth 导入问题修复

### 🚀 最新部署
- **时间**: 2024年1月24日
- **状态**: 准备就绪
- **环境变量**: 已完整配置
- **构建**: 本地测试通过

## 数据库
使用Prisma进行数据库管理，部署前确保运行迁移：
```bash
npx prisma migrate deploy
```

## 域名迁移
如需进行域名迁移，请参考 `DOMAIN_MIGRATION_GUIDE.md`。

## 相关文档
- [Vercel部署详细步骤](DEPLOY_TO_VERCEL.md)
- [域名迁移指南](DOMAIN_MIGRATION_GUIDE.md)
- [Google OAuth配置](../oauth/GOOGLE_OAUTH_SETUP.md)
- [Twitter OAuth配置](../oauth/TWITTER_OAUTH_SETUP.md)
- [邮件服务配置](../services/EMAIL_SERVICE_GUIDE.md)