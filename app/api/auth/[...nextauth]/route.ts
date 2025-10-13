import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import type { AuthOptions } from "next-auth"
import { getMongoClient } from "@/lib/mongodb"

const clientPromise = getMongoClient()

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add custom session data if needed
      if (session?.user) {
        (session.user as any).id = user.id
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // You can add custom logic here for user validation
      // For now, allow all Google sign-ins
      return true
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
