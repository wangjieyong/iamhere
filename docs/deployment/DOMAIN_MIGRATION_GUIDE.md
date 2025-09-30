# 域名迁移指南：从 iamhere.vercel.app 到 snaphere.app

## 已完成的配置

### 1. ✅ Cloudflare DNS 配置
- **A 记录**: `snaphere.app` → `216.198.79.1`
- **CNAME 记录**: `www.snaphere.app` → `d4a9d8780d1db153.vercel-dns-017.com`
- **代理状态**: 仅 DNS (DNS Only)

### 2. ✅ Vercel 域名配置
- **主域名**: `snaphere.app` - Valid Configuration
- **WWW 域名**: `www.snaphere.app` - Valid Configuration
- **SSL 证书**: 自动申请和配置

### 3. ✅ 应用配置更新
- **生产环境变量**: 更新 `.env.production` 中的 `NEXTAUTH_URL` 为 `https://snaphere.app`

## 待完成的配置

### 4. 🔄 OAuth 回调 URL 更新

#### Google OAuth 配置
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 导航到 APIs & Services > Credentials
3. 编辑 OAuth 2.0 Client ID: `1030933516225-5j4lre6ishcetgd993258v55spddovia.apps.googleusercontent.com`
4. 更新授权重定向 URI：
   - 添加: `https://snaphere.app/api/auth/callback/google`
   - 保留: `http://localhost:3000/api/auth/callback/google` (开发环境)
5. 更新授权 JavaScript 来源：
   - 添加: `https://snaphere.app`
   - 保留: `http://localhost:3000` (开发环境)

#### Twitter OAuth 配置
1. 访问 [Twitter Developer Portal](https://developer.twitter.com/)
2. 导航到你的应用设置
3. 更新 Callback URLs：
   - 添加: `https://snaphere.app/api/auth/callback/twitter`
   - 保留: `http://localhost:3000/api/auth/callback/twitter` (开发环境)
4. 更新 Website URL: `https://snaphere.app`
5. 确保 Terms of Service 和 Privacy Policy URLs 已设置

### 5. 🔄 部署和测试

#### 部署到 Vercel
```bash
# 推送更改到 Git 仓库
git add .
git commit -m "Update domain configuration for snaphere.app"
git push origin main

# 或者手动部署
vercel --prod
```

#### 测试清单
- [ ] 访问 `https://snaphere.app` 确认网站正常加载
- [ ] 测试 Google OAuth 登录流程
- [ ] 测试 Twitter OAuth 登录流程
- [ ] 验证 SSL 证书正常工作
- [ ] 测试 `www.snaphere.app` 重定向到主域名
- [ ] 确认所有 API 端点正常工作

## 验证命令

```bash
# 检查 DNS 解析
nslookup snaphere.app
nslookup www.snaphere.app

# 检查 SSL 证书
curl -I https://snaphere.app

# 测试重定向
curl -I https://www.snaphere.app
```

## 注意事项

1. **DNS 传播时间**: 可能需要 24-48 小时完全传播
2. **SSL 证书**: Vercel 会自动申请，通常在几分钟内完成
3. **OAuth 配置**: 必须在相应平台更新回调 URL，否则登录会失败
4. **环境变量**: 确保生产环境的 `NEXTAUTH_URL` 已更新
5. **缓存清理**: 可能需要清理浏览器缓存和 CDN 缓存

## 回滚计划

如果需要回滚到原域名：
1. 在 Vercel 中重新添加 `iamhere.vercel.app`
2. 恢复 `.env.production` 中的 `NEXTAUTH_URL`
3. 重新部署应用
4. 更新 OAuth 回调 URL 回到原设置