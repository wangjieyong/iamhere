# SnapHere - AI驱动的地点图片生成应用

SnapHere 是一个创新的Web应用，让用户通过AI技术生成与特定地理位置相关的个性化图片。用户可以上传照片、选择地点，然后由AI生成融合了个人形象和地理位置特色的独特图片。

## 🌟 核心功能

- **智能图片生成**：基于Google Gemini AI，结合用户照片和地理位置生成个性化图片
- **地图选择器**：集成Mapbox地图，支持全球地点搜索和选择
- **用户认证**：Google OAuth安全登录
- **图库管理**：个人图片库，支持查看和删除
- **使用统计**：每日生成次数限制和统计
- **响应式设计**：完美适配桌面和移动设备

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- PostgreSQL 数据库（生产环境）

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd iamhere
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
```
编辑 `.env.local` 文件，填入必要的API密钥和配置。

4. **初始化数据库**
```bash
npx prisma generate
npx prisma db push
```

5. **启动开发服务器**
```bash
npm run dev
```

## 📚 文档

详细的配置和部署文档请参考：

- **[部署指南](DEPLOYMENT.md)** - 完整的部署配置说明
- **[OAuth配置](docs/oauth/)** - Google和Twitter登录配置
- **[服务配置](docs/services/)** - 第三方服务配置指南
- **[文档目录](docs/)** - 所有技术文档的入口

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🔧 环境变量配置

### 必需配置

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `DATABASE_URL` | 数据库连接字符串 | PostgreSQL数据库 |
| `NEXTAUTH_URL` | 应用域名 | 生产环境域名 |
| `NEXTAUTH_SECRET` | NextAuth密钥 | 随机生成的安全字符串 |
| `GOOGLE_CLIENT_ID` | Google OAuth客户端ID | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth客户端密钥 | Google Cloud Console |
| `GOOGLE_AI_API_KEY` | Google AI API密钥 | [Google AI Studio](https://aistudio.google.com/) |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Mapbox访问令牌 | [Mapbox](https://www.mapbox.com/) |

### 可选配置（云存储）

支持AWS S3或Cloudinary作为图片存储服务。

## 📦 部署到生产环境

### Vercel部署（推荐）

1. **连接GitHub仓库**
   - 在Vercel控制台导入GitHub项目
   - 选择 `iamhere` 仓库

2. **配置环境变量**
   - 在Vercel项目设置中添加所有环境变量
   - 确保 `NEXTAUTH_URL` 设置为生产域名

3. **配置数据库**
   - 推荐使用 [Supabase](https://supabase.com/) 或 [PlanetScale](https://planetscale.com/)
   - 更新 `DATABASE_URL` 为生产数据库连接字符串

4. **部署**
   ```bash
   # 自动部署（推送到main分支）
   git push origin main
   ```

### 手动部署

1. **构建项目**
```bash
npm run build
```

2. **启动生产服务器**
```bash
npm start
```

## 🗄️ 数据库迁移

从SQLite迁移到PostgreSQL：

1. **更新schema.prisma**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **生成迁移文件**
```bash
npx prisma migrate dev --name init
```

3. **应用迁移**
```bash
npx prisma migrate deploy
```

## 🔐 安全配置

### Google OAuth设置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建OAuth 2.0客户端ID
5. 添加授权重定向URI：
   - 开发环境：`http://localhost:3000/api/auth/callback/google`
   - 生产环境：`https://your-domain.com/api/auth/callback/google`

### API密钥安全

- 所有API密钥应存储在环境变量中
- 生产环境使用强随机密钥
- 定期轮换敏感密钥

## 🧪 测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch
```

## 📊 监控和日志

生产环境建议集成：
- **错误监控**：Sentry
- **性能监控**：Vercel Analytics
- **日志管理**：Vercel Functions Logs

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `DATABASE_URL` 格式
   - 确认数据库服务运行状态

2. **Google OAuth错误**
   - 验证客户端ID和密钥
   - 检查重定向URI配置

3. **AI生成失败**
   - 确认Google AI API密钥有效
   - 检查API配额限制

4. **地图不显示**
   - 验证Mapbox访问令牌
   - 检查域名白名单设置

### 获取帮助

如遇到问题，请：
1. 查看控制台错误信息
2. 检查环境变量配置
3. 提交Issue描述问题详情
