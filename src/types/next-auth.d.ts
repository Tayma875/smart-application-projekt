import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      userId: string
      rolle: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    rolle: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rolle: string
    userId: string
  }
}
