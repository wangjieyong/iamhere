# 部署指南

## 概述
本项目是一个基于Next.js的全栈应用，支持Google和Twitter OAuth登录。

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

## 部署前检查
运行以下命令进行部署前检查：
```bash
node scripts/pre-deploy-check.js
```

## OAuth配置
- Google OAuth: 参考 `GOOGLE_OAUTH_SETUP.md`
- Twitter OAuth: 参考 `TWITTER_OAUTH_SETUP.md`

## 数据库
使用Prisma进行数据库管理，部署前确保运行迁移：
```bash
npx prisma migrate deploy
```