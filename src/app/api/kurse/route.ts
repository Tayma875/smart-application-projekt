import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET()
import { logAudit } from "@/lib/audit" {

  const kurse = await prisma.kurs.findMany({ orderBy: { name: "asc" } })
  return NextResponse.json(kurse)
}

export async function POST(req: Request) {
  const session = await auth()
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
    await logAudit("kurs_erstellt", `${kurs.name}`, kurs.id, "Kurs")
  return NextResponse.json(kurs, { status: 201 })
}
