import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import TwitterProvider from "next-auth/providers/twitter"
import { prisma } from "./prisma"

export const authOptions = {
  // Note: Using JWT strategy, so no adapter needed for sessions
  // But we still need to create users in database for our app logic
  debug: process.env.NODE_ENV === 'development',
  
  // Ensure proper URL configuration
  ...(process.env.NEXTAUTH_URL && {
    url: process.env.NEXTAUTH_URL
  }),
  
  // Use Prisma adapter to automatically create user records in database
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Twitter/X OAuth 2.0 Configuration
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0", // Enable OAuth 2.0
      authorization: {
        params: {
          scope: "users.read tweet.read",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
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