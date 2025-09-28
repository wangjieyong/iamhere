import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import TwitterProvider from "next-auth/providers/twitter"
import { HttpsProxyAgent } from "https-proxy-agent"
import { prisma } from "./prisma"

// 只在开发环境使用代理配置
if (process.env.NODE_ENV === 'development') {
  // 全局代理配置
  const proxyUrl = "http://127.0.0.1:1087"
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
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
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