import { prisma } from "@/lib/prisma"
import { auth, hatBerechtigung } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  const freigaben = await prisma.advancedFreigabe.findMany({
    include: { mitglied: { select: { vorname: true, nachname: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(freigaben)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  const data = await req.json()

  const exist = await prisma.advancedFreigabe.findUnique({
    where: { mitgliedId_kategorie: { mitgliedId: data.mitgliedId, kategorie: data.kategorie } },
  })
  if (exist) return NextResponse.json({ error: "Freigabe existiert bereits" }, { status: 400 })

  // SMA-030: Prüfen ob Mitglied bereits Mittel-Kurse in der Kategorie besucht hat
  const mitglied = await prisma.mitglied.findUnique({
    where: { id: data.mitgliedId },
    select: { vorname: true, nachname: true },
  })

  const besuchteKurse = await prisma.buchung.findMany({
    where: {
      mitgliedId: data.mitgliedId,
      teilnahmeStatus: "teilgenommen",
      termin: { kurs: { level: "mittel", kategorie: data.kategorie } },
    },
    include: { termin: { include: { kurs: true } } },
    take: 10,
  })

  const freigabe = await prisma.advancedFreigabe.create({
    data: {
      mitgliedId: data.mitgliedId,
      kategorie: data.kategorie,
      erteiltVon: session.user.userId!,
    },
    include: { mitglied: { select: { vorname: true, nachname: true } } },
  })

  return NextResponse.json({
    ...freigabe,
    hinweis: besuchteKurse.length > 0
      ? `${mitglied?.vorname} ${mitglied?.nachname} hat ${besuchteKurse.length} Mittel-Kurse in dieser Kategorie besucht.`
      : `${mitglied?.vorname} ${mitglied?.nachname} hat noch keine Mittel-Kurse in dieser Kategorie besucht.`,
  }, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }
  const { id } = await req.json()
  await prisma.advancedFreigabe.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
