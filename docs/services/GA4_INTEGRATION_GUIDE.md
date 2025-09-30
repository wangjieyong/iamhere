# Google Analytics 4 集成指南

> 📝 **注意**: 这是为后续迭代准备的集成指南。当前MVP阶段使用Vercel Analytics已足够。

## 🎯 何时启用 GA4

建议在以下情况下启用 Google Analytics 4：
- 用户增长到 1K+ DAU
- 需要详细的用户行为分析
- 需要转化漏斗分析
- 需要用户画像数据

## 🚀 集成步骤

### 1. 创建 GA4 属性

1. 访问 [Google Analytics](https://analytics.google.com/)
2. 创建新的 GA4 属性
3. 获取测量ID (格式: G-XXXXXXXXXX)

### 2. 安装依赖

```bash
npm install gtag
npm install @types/gtag --save-dev
```

### 3. 配置环境变量

在 `.env.local` 中添加：
```bash
ENABLE_GA4=true
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### 4. 更新代码

#### 4.1 创建 GA4 配置文件

创建 `src/lib/ga4.ts`:
```typescript
// Google Analytics 4 配置
export const GA4_MEASUREMENT_ID = process.env.GOOGLE_ANALYTICS_ID

// 初始化 GA4
export const initGA4 = () => {
  if (typeof window !== 'undefined' && GA4_MEASUREMENT_ID) {
    // 加载 gtag 脚本
    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`
    script.async = true
    document.head.appendChild(script)

    // 初始化 gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag

    gtag('js', new Date())
    gtag('config', GA4_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    })
  }
}

// 发送自定义事件
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag && GA4_MEASUREMENT_ID) {
    window.gtag('event', eventName, parameters)
  }
}

// 发送页面浏览
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA4_MEASUREMENT_ID) {
    window.gtag('config', GA4_MEASUREMENT_ID, {
      page_title: title,
      page_location: url,
    })
  }
}
```

#### 4.2 更新类型定义

在 `src/types/gtag.d.ts` 中添加：
```typescript
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export {}
```

#### 4.3 更新 layout.tsx

```typescript
import { useEffect } from 'react'
import { initGA4 } from '@/lib/ga4'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.ENABLE_GA4 === 'true') {
      initGA4()
    }
  }, [])

  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

#### 4.4 更新监控服务

在 `src/lib/monitoring.ts` 中，GA4 集成部分已经预留：
```typescript
// 可选：Google Analytics 4（后续迭代可启用）
if (process.env.ENABLE_GA4 === 'true' && typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', event.event, {
    ...event.properties,
    user_id: event.userId
  })
}
```

## 📊 推荐的事件追踪

### 核心业务事件
```typescript
// 用户注册
trackEvent('sign_up', {
  method: 'google'
})

// 图片上传
trackEvent('image_upload', {
  file_size: fileSize,
  file_type: fileType
})

// 位置选择
trackEvent('location_select', {
  country: selectedCountry,
  city: selectedCity
})

// AI图片生成
trackEvent('image_generate', {
  generation_time: responseTime,
  success: true
})

// 图片下载
trackEvent('image_download', {
  image_id: imageId
})
```

### 页面浏览追踪
```typescript
// 在 Next.js 路由变化时追踪
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { trackPageView } from '@/lib/ga4'

export function usePageTracking() {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      trackPageView(url)
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])
}
```

## 🔧 配置建议

### 增强型电子商务 (可选)
如果未来添加付费功能，可以配置增强型电子商务：
```typescript
// 购买事件
trackEvent('purchase', {
  transaction_id: 'T12345',
  value: 9.99,
  currency: 'USD',
  items: [{
    item_id: 'premium_generation',
    item_name: 'Premium AI Generation',
    category: 'subscription',
    quantity: 1,
    price: 9.99
  }]
})
```

### 自定义维度
```typescript
// 设置用户属性
if (window.gtag) {
  window.gtag('config', GA4_MEASUREMENT_ID, {
    custom_map: {
      user_type: 'dimension1',
      subscription_status: 'dimension2'
    }
  })
}
```

## 🎯 分析目标设置

### 建议的转化目标
1. **用户注册**: 完成Google OAuth登录
2. **首次生成**: 用户首次成功生成AI图片
3. **活跃用户**: 7天内生成3张以上图片
4. **分享行为**: 用户下载或分享生成的图片

### 受众群体设置
1. **新用户**: 首次访问的用户
2. **活跃用户**: 7天内有活动的用户
3. **高价值用户**: 生成图片数量前20%的用户

## 📈 报告和洞察

### 关键指标监控
- **用户获取**: 新用户数量和来源
- **用户参与**: 页面浏览时长、跳出率
- **功能使用**: AI生成成功率、平均生成时间
- **用户留存**: 1日、7日、30日留存率

### 自定义报告
- AI生成漏斗分析
- 地理位置选择热力图
- 用户行为路径分析

## 🔒 隐私和合规

### GDPR 合规
```typescript
// 征得用户同意后再初始化
const initGA4WithConsent = (hasConsent: boolean) => {
  if (hasConsent) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted'
    })
    initGA4()
  }
}
```

### 数据保留设置
- 在GA4中设置适当的数据保留期限
- 配置IP匿名化
- 设置数据删除请求处理流程

## 🚀 启用检查清单

- [ ] 创建GA4属性并获取测量ID
- [ ] 安装必要的npm包
- [ ] 配置环境变量
- [ ] 更新代码集成GA4
- [ ] 设置事件追踪
- [ ] 配置转化目标
- [ ] 测试数据收集
- [ ] 设置自定义报告
- [ ] 配置隐私合规
- [ ] 培训团队使用GA4

## 📝 注意事项

1. **性能影响**: GA4脚本会增加页面加载时间，建议异步加载
2. **数据延迟**: GA4数据通常有24-48小时延迟
3. **采样**: 高流量网站可能会有数据采样
4. **隐私**: 确保符合GDPR、CCPA等隐私法规
5. **成本**: GA4免费版有数据限制，大流量可能需要付费版

启用GA4后，建议与现有的Vercel Analytics并行运行一段时间，对比数据准确性后再决定是否完全迁移。