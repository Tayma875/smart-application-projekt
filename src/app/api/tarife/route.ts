import { prisma } from "@/lib/prisma"
import { auth, hatBerechtigung } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Rezeption")) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }
  const tarife = await prisma.tarif.findMany({ orderBy: { monatspreis: "asc" } })
  return NextResponse.json(tarife)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  const data = await req.json()
  const tarif = await prisma.tarif.create({
    data: {
      name: data.name,
      monatspreis: parseFloat(data.monatspreis),
      laufzeit: data.laufzeit,
      buchungslimit: data.buchungslimit ? parseInt(data.buchungslimit) : null,
      onlineBerechtigung: data.onlineBerechtigung,
      stornoRegel: data.stornoRegel || null,
    },
  })
  return NextResponse.json(tarif, { status: 201 })
}
