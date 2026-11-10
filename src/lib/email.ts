import { Resend } from 'resend';

// 延迟初始化 Resend 客户端。
// 邮件服务是可选配置：未设置 RESEND_API_KEY 时应用仍应能构建和启动，
// 只有实际发送邮件时才会返回明确的配置错误。
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  if (!resend) {
    resend = new Resend(apiKey);
  }

  return resend;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static instance: EmailService;
  private fromEmail: string;

  private constructor() {
    // 使用环境变量配置发件人邮箱
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@snaphere.app';
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * 发送邮件
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const client = getResendClient();
      if (!client) {
        const message = 'RESEND_API_KEY is not configured';
        console.error('Email service error:', message);
        return { success: false, error: message };
      }

      const { data, error } = await client.emails.send({
        from: options.from || this.fromEmail,
        to: [options.to],
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        console.error('Resend email error:', error);
        return { success: false, error: error.message };
      }

      console.log('Email sent successfully:', data?.id);
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Email service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * 生成魔法链接邮件 HTML 模板
   */
  generateMagicLinkEmail(params: {
    url: string;
    email: string;
    locale?: string;
  }): string {
    const { url, email, locale = 'en' } = params;
    
    // 根据语言选择文本
    const texts = locale === 'zh' ? {
      title: '登录到 SnapHere',
      greeting: '您好！',
      instruction: '点击下面的按钮登录到您的 SnapHere 账户：',
      buttonText: '登录到 SnapHere',
      alternative: '如果按钮无法点击，请复制以下链接到浏览器中打开：',
      security: '如果您没有请求此邮件，请忽略它。',
      footer: '此邮件由 SnapHere 自动发送，请勿回复。',
      expires: '此链接将在 24 小时后过期。'
    } : {
      title: 'Sign in to SnapHere',
      greeting: 'Hello!',
      instruction: 'Click the button below to sign in to your SnapHere account:',
      buttonText: 'Sign in to SnapHere',
      alternative: 'If the button doesn\'t work, copy and paste the following link into your browser:',
      security: 'If you didn\'t request this email, you can safely ignore it.',
      footer: 'This email was sent automatically by SnapHere. Please do not reply.',
      expires: 'This link will expire in 24 hours.'
    };

    return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${texts.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-1px);
        }
        .link-fallback {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 14px;
            color: #475569;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 14px;
            color: #64748b;
            text-align: center;
        }
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            font-size: 14px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">📸 SnapHere</div>
            <h1 class="title">${texts.title}</h1>
        </div>
        
        <div class="content">
            <p>${texts.greeting}</p>
            <p>${texts.instruction}</p>
            
            <div style="text-align: center;">
                <a href="${url}" class="button">${texts.buttonText}</a>
            </div>
            
            <p>${texts.alternative}</p>
            <div class="link-fallback">
                ${url}
            </div>
            
            <div class="security-note">
                <strong>⚠️ ${texts.security}</strong><br>
                ${texts.expires}
            </div>
        </div>
        
        <div class="footer">
            <p>${texts.footer}</p>
            <p>Email: ${email}</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * 发送魔法链接邮件
   */
  async sendMagicLinkEmail(params: {
    to: string;
    url: string;
    locale?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { to, url, locale = 'en' } = params;
    
    const subject = locale === 'zh' 
      ? '登录到 SnapHere - 魔法链接' 
      : 'Sign in to SnapHere - Magic Link';
    
    const html = this.generateMagicLinkEmail({
      url,
      email: to,
      locale
    });

    return this.sendEmail({
      to,
      subject,
      html
    });
  }
}

// 导出单例实例
export const emailService = EmailService.getInstance();