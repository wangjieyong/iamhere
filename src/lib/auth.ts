import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"

export const authOptions = {
  // Note: Using JWT strategy, so no adapter needed for sessions
  // But we still need to create users in database for our app logic
  debug: process.env.NODE_ENV === 'development',
  
  // Ensure proper URL configuration
  ...(process.env.NEXTAUTH_URL && {
    url: process.env.NEXTAUTH_URL
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Development-only credentials provider
    ...(process.env.NODE_ENV === 'development' ? [
      CredentialsProvider({
        id: "dev-skip",
        name: "Development Skip",
        credentials: {
          username: { label: "Username", type: "text" },
        },
        async authorize(credentials, req) {
          try {
            // Create or find the development user in database
            const devUser = await prisma.user.upsert({
              where: { email: "dev@example.com" },
              update: {},
              create: {
                id: "dev-user",
                name: "开发用户",
                email: "dev@example.com",
                image: null,
              }
            });
            
            // Return user object that matches NextAuth User type
            return {
              id: devUser.id,
              name: devUser.name || null,
              email: devUser.email,
              image: devUser.image || null,
            }
          } catch (error) {
            console.error('Dev-skip authorize error:', error);
            return null;
          }
        },
      })
    ] : []),
    // Note: Apple provider will be added when Apple credentials are configured
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}