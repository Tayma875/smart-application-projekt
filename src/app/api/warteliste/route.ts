import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
if (!session?.user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })

  if (session.user.rolle !== "Mitglied") {
    return NextResponse.json({ error: "Nur Mitglieder können sich auf Warteliste setzen" }, { status: 403 })
  }

  const data = await req.json()
  const { mitgliedId, terminId } = data

  const termin = await prisma.kurstermin.findUnique({
    where: { id: terminId },
    include: { kurs: true, raum: true },
  })
  if (!termin) return NextResponse.json({ error: "Termin nicht gefunden" }, { status: 404 })

  // Prüfen ob bereits auf Warteliste
  const exist = await prisma.wartelistenEintrag.findUnique({
    where: { mitgliedId_terminId: { mitgliedId, terminId } },
  })
  if (exist) return NextResponse.json({ error: "Bereits auf der Warteliste" }, { status: 400 })

  // Prüfen ob Warteliste voll (max 5)
  const wartelisteCount = await prisma.wartelistenEintrag.count({ where: { terminId } })
  if (wartelisteCount >= 5) {
    return NextResponse.json({ error: "Warteliste ist voll (max. 5 Personen)" }, { status: 400 })
  }

  const eintrag = await prisma.wartelistenEintrag.create({
    data: {
      mitgliedId,
      terminId,
      reihenfolge: wartelisteCount + 1,
      eintragungszeitpunkt: new Date(),
    },
    include: { termin: { include: { kurs: true } } },
  })

  // Reihenfolge explizit zurückschicken
  return NextResponse.json({
    ...eintrag,
    reihenfolge: eintrag.reihenfolge,
  }, { status: 201 })
}

export async function DELETE(req: Request) {

  const data = await req.json()
  const { mitgliedId, terminId } = data

  await prisma.wartelistenEintrag.deleteMany({
    where: { mitgliedId, terminId },
  })

  // Plätze neu nummerieren
  const rest = await prisma.wartelistenEintrag.findMany({
    where: { terminId },
    orderBy: { reihenfolge: "asc" },
  })
  for (let i = 0; i < rest.length; i++) {
    await prisma.wartelistenEintrag.update({
      where: { id: rest[i].id },
      data: { reihenfolge: i + 1 },
    })
  }

  return NextResponse.json({ success: true })
}

// Warteliste abrufen (Admin/Rezeption)
export async function GET(req: Request) {

  const url = new URL(req.url)
  const terminId = url.searchParams.get("terminId")

  const where: any = {}
  if (terminId) where.terminId = terminId

  const eintraege = await prisma.wartelistenEintrag.findMany({
    where,
    include: { mitglied: { select: { vorname: true, nachname: true, email: true } }, termin: { include: { kurs: true } } },
    orderBy: { reihenfolge: "asc" },
  })
  return NextResponse.json(eintraege)
}
