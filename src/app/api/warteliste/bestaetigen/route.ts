import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()

  if (session.user.rolle !== "Mitglied") {
    return NextResponse.json({ error: "Nur Mitglieder können bestätigen" }, { status: 403 })
  }

  const data = await req.json()
  const { mitgliedId, terminId } = data

  const mitglied = await prisma.mitglied.findFirst({
    where: { accountId: session.user.userId },
  })
  if (!mitglied || mitglied.id !== mitgliedId) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  const eintrag = await prisma.wartelistenEintrag.findUnique({
    where: { mitgliedId_terminId: { mitgliedId, terminId } },
    include: { termin: { include: { kurs: true, raum: true } } },
  })

  if (!eintrag) {
    return NextResponse.json({ error: "Kein Wartelisten-Eintrag gefunden" }, { status: 404 })
  }

  if (!eintrag.bestaetigtBis) {
    return NextResponse.json({ error: "Keine ausstehende Bestätigung – Platz wurde noch nicht angeboten" }, { status: 400 })
  }

  if (new Date() > eintrag.bestaetigtBis) {
    // Frist abgelaufen – Eintrag entfernen und nächsten benachrichtigen
    await prisma.wartelistenEintrag.delete({ where: { id: eintrag.id } })
    const rest = await prisma.wartelistenEintrag.findMany({
      where: { terminId },
      orderBy: { reihenfolge: "asc" },
    })
    for (let i = 0; i < rest.length; i++) {
      await prisma.wartelistenEintrag.update({
        where: { id: rest[i].id },
        data: { reihenfolge: i + 1, bestaetigtBis: null },
      })
    }
    return NextResponse.json({ error: "Bestätigungsfrist abgelaufen. Der Platz wurde weitergegeben." }, { status: 410 })
  }

  // Bestätigung: Buchung anlegen, Wartelisten-Eintrag löschen
  const termin = eintrag.termin
  const kapazitaet = Math.min(termin.kurs.maxTeilnehmer, termin.raum.kapazitaet)
  const aktuelleBuchungen = await prisma.buchung.count({
    where: { terminId, teilnahmeStatus: { not: "storniert" } },
  })
  if (aktuelleBuchungen >= kapazitaet) {
    return NextResponse.json({ error: "Termin ist leider bereits wieder voll" }, { status: 409 })
  }

  await prisma.buchung.create({
    data: {
      mitgliedId,
      terminId,
      buchungszeitpunkt: new Date(),
      teilnahmeStatus: "angemeldet",
    },
  })

  await prisma.wartelistenEintrag.delete({ where: { id: eintrag.id } })

  const rest = await prisma.wartelistenEintrag.findMany({
    where: { terminId },
    orderBy: { reihenfolge: "asc" },
  })
  for (let i = 0; i < rest.length; i++) {
    await prisma.wartelistenEintrag.update({
      where: { id: rest[i].id },
      data: { reihenfolge: i + 1, bestaetigtBis: null },
    })
  }

  return NextResponse.json({ success: true, message: "Platz bestätigt! Du bist angemeldet." })
}
