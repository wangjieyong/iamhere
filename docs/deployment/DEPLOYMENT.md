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