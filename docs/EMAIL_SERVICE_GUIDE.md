# 邮件服务集成指南

> 📝 **注意**: 这是为后续迭代准备的集成指南。当前MVP阶段不需要邮件功能。

## 🎯 何时需要邮件服务

建议在以下情况下集成邮件服务：
- 需要发送欢迎邮件
- 需要密码重置功能
- 需要用户通知和提醒
- 需要营销邮件功能
- 用户增长到需要邮件营销时

## 📧 推荐的邮件服务

### 1. Resend (推荐)

**优势**:
- 🎯 专为开发者设计的现代API
- 📊 详细的送达率分析
- 🎨 内置邮件模板支持
- 💰 合理的定价 (免费3K邮件/月)

**适用场景**: 交易邮件、通知邮件

### 2. SendGrid

**优势**:
- 🏢 企业级稳定性
- 📈 强大的营销邮件功能
- 🔧 丰富的API和SDK
- 📊 详细的分析报告

**适用场景**: 大规模邮件发送、营销邮件

### 3. AWS SES

**优势**:
- 💰 成本最低 ($0.10/1000邮件)
- 🔒 高安全性和可靠性
- 🌍 全球基础设施
- 🔗 与AWS生态集成

**适用场景**: 大量邮件发送、成本敏感项目

## 🚀 Resend 集成示例

### 1. 安装依赖

```bash
npm install resend
npm install @types/react-email --save-dev
```

### 2. 环境变量配置

```bash
# Resend API Key
RESEND_API_KEY="re_xxxxxxxxxx"

# 发件人邮箱 (需要验证域名)
FROM_EMAIL="noreply@snaphere.app"
```

### 3. 创建邮件服务

创建 `src/lib/email.ts`:
```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

export class EmailService {
  private fromEmail = process.env.FROM_EMAIL || 'noreply@snaphere.app'

  async sendEmail(options: EmailOptions) {
    try {
      const result = await resend.emails.send({
        from: options.from || this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })

      console.log('Email sent successfully:', result.data?.id)
      return { success: true, id: result.data?.id }
    } catch (error) {
      console.error('Failed to send email:', error)
      return { success: false, error }
    }
  }

  // 发送欢迎邮件
  async sendWelcomeEmail(userEmail: string, userName: string) {
    return this.sendEmail({
      to: userEmail,
      subject: '欢迎来到 SnapHere! 🎉',
      html: this.getWelcomeEmailTemplate(userName),
    })
  }

  // 发送密码重置邮件
  async sendPasswordResetEmail(userEmail: string, resetToken: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
    
    return this.sendEmail({
      to: userEmail,
      subject: '重置您的 SnapHere 密码',
      html: this.getPasswordResetTemplate(resetUrl),
    })
  }

  // 发送AI生成完成通知
  async sendGenerationCompleteEmail(userEmail: string, imageUrl: string) {
    return this.sendEmail({
      to: userEmail,
      subject: '您的AI旅行照片已生成完成! 📸',
      html: this.getGenerationCompleteTemplate(imageUrl),
    })
  }

  // 欢迎邮件模板
  private getWelcomeEmailTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>欢迎来到 SnapHere</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0;">欢迎来到 SnapHere! 🎉</h1>
          </div>
          
          <div style="padding: 40px;">
            <h2>你好 ${userName}!</h2>
            
            <p>感谢您加入 SnapHere! 现在您可以：</p>
            
            <ul>
              <li>📸 上传您的自拍照片</li>
              <li>🗺️ 在世界地图上选择梦想目的地</li>
              <li>🤖 让AI为您生成身临其境的旅行大片</li>
              <li>📱 下载和分享您的专属旅行照片</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/create" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                开始创作 →
              </a>
            </div>
            
            <p>如果您有任何问题，请随时联系我们的支持团队。</p>
            
            <p>祝您使用愉快！<br>SnapHere 团队</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 SnapHere. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `
  }

  // 密码重置邮件模板
  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>重置密码 - SnapHere</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="padding: 40px;">
            <h2>重置您的密码</h2>
            
            <p>您请求重置 SnapHere 账户的密码。</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                重置密码
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              如果您没有请求重置密码，请忽略此邮件。此链接将在24小时后失效。
            </p>
            
            <p style="color: #666; font-size: 14px;">
              如果按钮无法点击，请复制以下链接到浏览器：<br>
              <a href="${resetUrl}">${resetUrl}</a>
            </p>
          </div>
        </body>
      </html>
    `
  }

  // AI生成完成通知模板
  private getGenerationCompleteTemplate(imageUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>AI照片生成完成 - SnapHere</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="padding: 40px;">
            <h2>您的AI旅行照片已生成完成! 📸</h2>
            
            <p>太棒了！您的专属旅行大片已经准备好了。</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <img src="${imageUrl}" alt="Generated Travel Photo" style="max-width: 100%; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/gallery" 
                 style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                查看我的图库 →
              </a>
            </div>
            
            <p>您可以下载、分享或继续创作更多精彩的旅行照片！</p>
          </div>
        </body>
      </html>
    `
  }
}

export const emailService = new EmailService()
```

### 4. API路由集成

创建 `src/app/api/email/send/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, ...data } = await request.json()

    let result
    switch (type) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail(data.email, data.name)
        break
      case 'generation_complete':
        result = await emailService.sendGenerationCompleteEmail(data.email, data.imageUrl)
        break
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id })
    } else {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 5. 在用户注册时发送欢迎邮件

更新 `src/lib/auth.ts`:
```typescript
// 在用户首次登录时发送欢迎邮件
callbacks: {
  async signIn({ user, account, profile, email, credentials }) {
    if (account?.provider === 'google') {
      // 检查是否是新用户
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! }
      })

      if (!existingUser) {
        // 新用户，发送欢迎邮件
        try {
          await emailService.sendWelcomeEmail(user.email!, user.name!)
        } catch (error) {
          console.error('Failed to send welcome email:', error)
          // 不阻止登录流程
        }
      }
    }
    return true
  }
}
```

## 📊 邮件分析和监控

### 关键指标追踪
```typescript
// 邮件发送统计
export class EmailAnalytics {
  async trackEmailSent(type: string, recipient: string) {
    // 记录到数据库或分析服务
    await analytics.track(EventType.EMAIL_SENT, {
      email_type: type,
      recipient_domain: recipient.split('@')[1]
    })
  }

  async trackEmailOpened(emailId: string) {
    await analytics.track(EventType.EMAIL_OPENED, {
      email_id: emailId
    })
  }

  async trackEmailClicked(emailId: string, linkUrl: string) {
    await analytics.track(EventType.EMAIL_CLICKED, {
      email_id: emailId,
      link_url: linkUrl
    })
  }
}
```

## 🔧 高级功能

### 邮件模板系统
```typescript
// 使用 React Email 创建模板
import { render } from '@react-email/render'
import WelcomeEmail from '@/emails/WelcomeEmail'

const html = render(<WelcomeEmail userName="John" />)
```

### 邮件队列 (可选)
```typescript
// 使用 Bull Queue 处理大量邮件
import Queue from 'bull'

const emailQueue = new Queue('email processing')

emailQueue.process(async (job) => {
  const { type, data } = job.data
  await emailService.sendEmail(data)
})

// 添加邮件到队列
emailQueue.add('send_welcome', {
  type: 'welcome',
  data: { email: 'user@example.com', name: 'John' }
})
```

## 🔒 安全和合规

### 邮件验证
```typescript
// 邮箱地址验证
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 防止邮件轰炸
export class EmailRateLimit {
  private static limits = new Map<string, number>()

  static canSendEmail(email: string, maxPerHour = 5): boolean {
    const now = Date.now()
    const hourAgo = now - 60 * 60 * 1000
    
    const key = `${email}_${Math.floor(now / (60 * 60 * 1000))}`
    const count = this.limits.get(key) || 0
    
    if (count >= maxPerHour) {
      return false
    }
    
    this.limits.set(key, count + 1)
    return true
  }
}
```

### 退订机制
```typescript
// 邮件退订
export async function unsubscribeUser(email: string, token: string) {
  // 验证token
  const isValid = await verifyUnsubscribeToken(email, token)
  if (!isValid) {
    throw new Error('Invalid unsubscribe token')
  }

  // 更新用户偏好
  await prisma.user.update({
    where: { email },
    data: { emailNotifications: false }
  })
}
```

## 📝 启用检查清单

- [ ] 选择邮件服务提供商
- [ ] 注册账户并获取API密钥
- [ ] 验证发件人域名
- [ ] 安装必要的依赖
- [ ] 配置环境变量
- [ ] 创建邮件服务类
- [ ] 设计邮件模板
- [ ] 集成到用户流程中
- [ ] 设置邮件分析
- [ ] 配置退订机制
- [ ] 测试邮件发送
- [ ] 监控送达率

## 💡 最佳实践

1. **模板设计**: 响应式设计，支持深色模式
2. **发送频率**: 避免过度发送，尊重用户偏好
3. **个性化**: 使用用户名和相关内容
4. **A/B测试**: 测试不同的主题行和内容
5. **监控指标**: 关注打开率、点击率、退订率
6. **合规性**: 遵守GDPR、CAN-SPAM等法规

启用邮件服务后，建议从简单的交易邮件开始，逐步扩展到营销邮件功能。