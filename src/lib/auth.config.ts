import type { NextAuthConfig } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { isStaff } from "./permissions"

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/cadastro",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.role = (user as { role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      const protectedPaths = ["/biblioteca", "/pedidos", "/configuracoes", "/favoritos"]
      const adminPaths = ["/admin"]

      const isProtected = protectedPaths.some((path) => pathname.startsWith(path))
      const isAdminPath = adminPaths.some((path) => pathname.startsWith(path))

      if (isAdminPath) {
        if (!isLoggedIn || !isStaff(auth?.user?.role)) return false
        return true
      }

      if (isProtected) {
        if (!isLoggedIn) return false
        return true
      }

      return true
    },
  },
}
