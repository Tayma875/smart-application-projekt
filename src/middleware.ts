import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Geschützte Routen pro Rolle
const routePermissions: Record<string, string[]> = {
  "/admin": ["Admin"],
  "/rezeption": ["Admin", "Rezeption"],
  "/trainer": ["Admin", "Trainer"],
  "/mitglied": ["Admin", "Mitglied", "Rezeption"],
  "/api/admin": ["Admin"],
  "/api/rezeption": ["Admin", "Rezeption"],
  "/api/trainer": ["Admin", "Trainer"],
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Öffentliche Routen
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Nicht eingeloggt → Login
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const rolle = session.user.rolle as string

  // Prüfen, ob eine Route eingeschränkt ist
  for (const [route, allowedRoles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(rolle)) {
        // Keine Berechtigung → zurück zur Startseite
        return NextResponse.redirect(new URL("/", req.url))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
