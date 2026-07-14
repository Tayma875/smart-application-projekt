import { prisma } from "@/lib/prisma"
import { auth, hatBerechtigung } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  const kurse = await prisma.kurs.findMany({ orderBy: { name: "asc" } })
  return NextResponse.json(kurse)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }
  const data = await req.json()
  const kurs = await prisma.kurs.create({
    data: {
      name: data.name,
      beschreibung: data.beschreibung || null,
      level: data.level,
      kategorie: data.kategorie,
      dauer: parseInt(data.dauer),
      maxTeilnehmer: parseInt(data.maxTeilnehmer),
      voraussetzungId: data.voraussetzungId || null,
    },
  })
  return NextResponse.json(kurs, { status: 201 })
}
