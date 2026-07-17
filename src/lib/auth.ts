import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
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

        // Account in der Datenbank suchen
        const account = await prisma.account.findUnique({
          where: { email },
        })

        // Wenn Account existiert, normalen Passwort-Vergleich
        if (account) {
          const password = credentials.password as string
          if (account.password !== password) return null
          return {
            id: account.id,
            email: account.email,
            name: account.rolle,
            rolle: account.rolle,
          }
        }

        // Demo-Modus: Jede beliebige E-Mail + Passwort = Mitglied
        return {
          id: email,
          email: email,
          name: "Mitglied",
          rolle: "Mitglied",
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rolle = (user as any).rolle
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.rolle = token.rolle as string
        session.user.userId = token.userId as string
      }
      return session
    },
  },
})

// Rollen-Typen
export type Rolle = "Admin" | "Rezeption" | "Trainer" | "Mitglied"

// Rollen-Hierarchie für Berechtigungsprüfung
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
