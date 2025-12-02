import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import type { AuthOptions } from "next-auth"
import { getMongoClient } from "@/lib/mongodb"

const clientPromise = getMongoClient()

// Dynamic base URL detection for development
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXTAUTH_URL || 'http://localhost:3000'
  }
  // In development, use the current request headers or fallback
  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
  ],
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      // Add custom session data if needed
      if (session?.user) {
        (session.user as any).id = user.id
      }
      return session
    },
    async signIn({ user, account, profile }: { user: any; account: any; profile: any }) {
      // Allow all Google sign-ins for now
      const { log } = require('@/lib/logger')
      log.info('Google Sign-in attempt', { email: user?.email, provider: account?.provider }, 'Auth')
      return true
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Redirect to dashboard after successful login
      if (url.includes('/api/auth/callback')) {
        return `${baseUrl}/dashboard`
      }
      return url.startsWith(baseUrl) ? url : baseUrl
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "database" as const,
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
