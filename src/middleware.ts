import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const ROLLEN_LEVEL: Record<string, number> = {
  Admin: 100,
  Rezeption: 60,
  Trainer: 40,
  Mitglied: 20,
}

const ROUTE_RULES: [string, string | null][] = [
  ["/admin", "Admin"],
  ["/rezeption", "Rezeption"],
  ["/trainer", "Trainer"],
  ["/mitglied", "Mitglied"],
  ["/api/admin", "Admin"],
  ["/api/abrechnung", "Trainer"],
  ["/api/advanced-freigabe", "Admin"],
  ["/api/erinnerungen", "Admin"],
  ["/api/geburtstage", "Admin"],
  ["/api/kurse", "Admin"],
  ["/api/tarife", "Admin"],
  ["/api/trainer", "Admin"],
  ["/api/raeume", "Admin"],
  ["/api/online-content", "Admin"],
  ["/api/vertrags-monitoring", "Admin"],
  ["/api/warteliste/cleanup", "Admin"],
  ["/api/vertretung", "Admin"],
]

function hatZugriff(userRolle: string | undefined, mindestRolle: string | null): boolean {
  if (!mindestRolle) return true
  if (!userRolle) return false
  const userLevel = ROLLEN_LEVEL[userRolle] ?? 0
  const requiredLevel = ROLLEN_LEVEL[mindestRolle] ?? 0
  return userLevel >= requiredLevel
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Öffentliche Routen – immer erlaubt
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api/auth") || // Login/Session-API
    pathname === "/login"
  ) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const rolle = token?.rolle as string | undefined

  // Nicht eingeloggt → Login
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Rollen-basierte Routen-Prüfung
  for (const [prefix, mindestRolle] of ROUTE_RULES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      if (!hatZugriff(rolle, mindestRolle)) {
        return new NextResponse(
          JSON.stringify({ error: "Nicht berechtigt", required: mindestRolle, yourRole: rolle }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        )
      }
      break
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
