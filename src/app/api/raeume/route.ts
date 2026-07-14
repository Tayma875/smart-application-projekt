import { prisma } from "@/lib/prisma"
import { auth, hatBerechtigung } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  const raeume = await prisma.raum.findMany({ orderBy: { name: "asc" } })
  return NextResponse.json(raeume)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }
  const data = await req.json()
  const raum = await prisma.raum.create({ data: { name: data.name, kapazitaet: parseInt(data.kapazitaet), raumtyp: data.raumtyp || null } })
  return NextResponse.json(raum, { status: 201 })
}
