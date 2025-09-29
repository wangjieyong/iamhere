# 图片存储服务集成指南

## 📋 概述

SnapHere 项目需要专门的图片存储服务来处理 AI 生成的图片。Vercel Postgres 数据库只存储图片的元数据（URL、提示词、用户信息等），实际的图片文件需要存储在专业的对象存储服务中。

## 🏗️ 存储架构

```
数据库 (Vercel Postgres)          图片存储服务
┌─────────────────────┐          ┌─────────────────────┐
│ GeneratedImage 表   │          │ 实际图片文件        │
│ ├── id             │          │ ├── image1.jpg      │
│ ├── imageUrl ────────────────→ │ ├── image2.png      │
│ ├── prompt         │          │ └── image3.webp     │
│ ├── location       │          └─────────────────────┘
│ ├── userId         │
│ └── createdAt      │
└─────────────────────┘
```

## 🔧 推荐的存储服务

### 1. Firebase Storage (推荐用于 MVP)

**优势：**
- 🔥 与 Google AI 生态一致
- 🆓 5GB 免费存储空间
- 🚀 全球 CDN 加速
- 🔐 细粒度安全规则

**安装依赖：**
```bash
npm install firebase
```

**环境变量：**
```bash
FIREBASE_API_KEY="your-api-key"
FIREBASE_AUTH_DOMAIN="project.firebaseapp.com"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_STORAGE_BUCKET="project.appspot.com"
FIREBASE_MESSAGING_SENDER_ID="123456789"
FIREBASE_APP_ID="1:123:web:abc123"
```

### 2. Cloudinary (推荐用于生产环境)

**优势：**
- 🎯 专业图片处理和优化
- 🔄 实时图片变换
- 📱 响应式图片支持
- 🆓 25GB 免费额度

**安装依赖：**
```bash
npm install cloudinary
```

**环境变量：**
```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. AWS S3

**优势：**
- 💰 成本效益高
- 🌍 全球可用性
- 🔒 企业级安全
- 🔗 丰富的生态系统

**安装依赖：**
```bash
npm install @aws-sdk/client-s3
```

**环境变量：**
```bash
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```

## 📊 服务对比

| 特性 | Firebase Storage | Cloudinary | AWS S3 |
|------|------------------|------------|--------|
| 免费额度 | 5GB | 25GB | 5GB (12个月) |
| 图片优化 | 基础 | 专业 | 需配置 |
| CDN | ✅ | ✅ | 需配置 |
| 易用性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 成本 | 中等 | 较高 | 较低 |

## 🚀 集成步骤

### 步骤 1：选择存储服务
根据项目需求选择合适的存储服务。

### 步骤 2：安装依赖
```bash
# 选择其中一个
npm install firebase          # Firebase
npm install cloudinary        # Cloudinary  
npm install @aws-sdk/client-s3 # AWS S3
```

### 步骤 3：配置环境变量
在 `.env.local` 中添加相应的配置。

### 步骤 4：更新存储逻辑
修改 `src/lib/storage.ts` 中的上传逻辑，将 Base64 图片数据上传到选择的存储服务。

### 步骤 5：更新 API 路由
在 `src/app/api/generate/route.ts` 中，将生成的图片上传到存储服务并保存 URL 到数据库。

## 💡 最佳实践

1. **图片优化**：上传前压缩图片，减少存储成本
2. **CDN 配置**：使用 CDN 加速图片加载
3. **安全设置**：配置适当的访问权限
4. **备份策略**：重要图片进行多地备份
5. **监控告警**：设置存储使用量监控

## 🔄 迁移策略

如果需要从一个存储服务迁移到另一个：

1. **并行运行**：新旧服务同时运行
2. **渐进迁移**：逐步迁移历史数据
3. **URL 重写**：更新数据库中的图片 URL
4. **验证测试**：确保所有图片可正常访问

## 📝 注意事项

- 确保选择的存储服务支持您的目标地区
- 考虑数据合规性要求（GDPR、数据本地化等）
- 定期备份重要数据
- 监控存储成本和使用量
- 设置适当的缓存策略