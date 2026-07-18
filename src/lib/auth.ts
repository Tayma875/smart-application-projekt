import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        const account = await prisma.account.findUnique({
          where: { email },
        })

        if (account) {
          // Vergleich mit gehashtem Passwort
          const valid = await bcrypt.compare(password, account.password)
          if (!valid) return null
          return {
            id: account.id,
            email: account.email,
            name: account.rolle,
            rolle: account.rolle,
          }
        }

        // Kein Account gefunden – kein Login möglich
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.rolle = user.rolle
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.rolle = token.rolle as string
        session.user.userId = token.userId as string
      }
      return session
    },
  },
}

const { handlers, signIn, signOut, auth: nextAuth } = NextAuth(authConfig)

// auth() gibt null zurück wenn nicht eingeloggt – kein Admin-Fallback mehr
export async function auth() {
  const session = await nextAuth()
  return session
}

export { handlers, signIn, signOut }
export type Rolle = "Admin" | "Rezeption" | "Trainer" | "Mitglied"

export const rollenHierarchie: Record<Rolle, number> = {
  Admin: 100,
  Rezeption: 60,
  Trainer: 40,
  Mitglied: 20,
}

export function hatBerechtigung(userRolle: string, mindestRolle: Rolle): boolean {
  const userLevel = rollenHierarchie[userRolle as Rolle] ?? 0
  const requiredLevel = rollenHierarchie[mindestRolle]
  return userLevel >= requiredLevel
}
