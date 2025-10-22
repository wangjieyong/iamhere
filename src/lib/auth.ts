import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import TwitterProvider from "next-auth/providers/twitter"
import EmailProvider from "next-auth/providers/email"
import { HttpsProxyAgent } from "https-proxy-agent"
import { prisma } from "./prisma"
import { emailService } from "./email"

// 只在开发环境使用代理配置
if (process.env.NODE_ENV === 'development') {
  // 全局代理配置 - 支持环境变量自定义
  const proxyUrl = process.env.DEV_PROXY_URL || "http://127.0.0.1:1087"
  const httpsAgent = new HttpsProxyAgent(proxyUrl)

  // 设置全局代理 - 扩展到Twitter
  const originalHttpsRequest = require('https').request
  require('https').request = function(options: any, callback: any) {
    if (typeof options === 'string') {
      options = new URL(options)
    }
    if (!options.agent && (
      options.hostname?.includes('google') || 
      options.host?.includes('google') ||
      options.hostname?.includes('twitter') || 
      options.host?.includes('twitter') ||
      options.hostname?.includes('api.twitter.com') || 
      options.host?.includes('api.twitter.com')
    )) {
      options.agent = httpsAgent
    }
    return originalHttpsRequest(options, callback)
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  trustHost: true, // 信任Vercel的主机配置
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
    EmailProvider({
      server: "", // 不使用 SMTP，使用自定义发送函数
      from: process.env.EMAIL_FROM || "noreply@snaphere.app",
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        try {
          // 检测用户语言偏好（可以从数据库或请求头获取）
          // 这里暂时使用默认英文，后续可以根据用户设置调整
          const locale = 'en'; // TODO: 从用户设置或请求头获取语言偏好
          
          const result = await emailService.sendMagicLinkEmail({
            to: email,
            url,
            locale
          });

          if (!result.success) {
            console.error('Failed to send magic link email:', result.error);
            throw new Error(`Failed to send email: ${result.error}`);
          }

          console.log('Magic link email sent successfully:', result.messageId);
        } catch (error) {
          console.error('Error sending magic link email:', error);
          throw error;
        }
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // 允许所有登录方式
      if (account?.provider === 'email') {
        // 邮箱登录 - NextAuth 已经验证了邮件链接的有效性
        console.log('Email sign in successful:', user.email);
        return true;
      }
      
      // OAuth 登录 (Google, Twitter)
      return true;
    },
    async redirect({ url, baseUrl }: any) {
      // 如果url是相对路径，使用baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // 如果url是同域名，允许重定向
      else if (new URL(url).origin === baseUrl) return url
      // 否则重定向到首页
      return baseUrl
    },
    async jwt({ token, user }: any) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }: any) {
      if (token && session.user) session.user.id = token.id as string
      return session
    },
  },
  pages: { signIn: "/auth/signin", error: "/auth/error" },
}