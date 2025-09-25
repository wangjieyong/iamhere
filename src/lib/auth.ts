import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
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
    // Note: Using custom configuration for OAuth 2.0 instead of default OAuth 1.0a
    {
      id: "twitter",
      name: "Twitter",
      type: "oauth",
      version: "2.0",
      authorization: {
        url: "https://twitter.com/i/oauth2/authorize",
        params: {
          scope: "tweet.read users.read",
          response_type: "code",
          code_challenge_method: "S256",
        },
      },
      token: "https://api.twitter.com/2/oauth2/token",
      userinfo: {
        url: "https://api.twitter.com/2/users/me",
        params: {
          "user.fields": "id,name,username,profile_image_url"
        }
      },
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      profile(profile: any) {
        return {
          id: profile.data.id,
          name: profile.data.name,
          email: null, // Twitter API v2 doesn't provide email by default
          image: profile.data.profile_image_url,
        }
      },
    },
  ],
  session: {
    strategy: "jwt",
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