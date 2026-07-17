import { prisma } from "@/lib/prisma"
import { auth, hatBerechtigung } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST() {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  // Abgelaufene Bestätigungsfristen finden
  const abgelaufen = await prisma.wartelistenEintrag.findMany({
    where: {
      bestaetigtBis: { not: null, lt: new Date() },
    },
    include: {
      termin: { include: { kurs: true, raum: true } },
      mitglied: { select: { vorname: true, nachname: true } },
    },
    orderBy: [{ terminId: "asc" }, { reihenfolge: "asc" }],
  })

  let freigegeben = 0
  const behandelteTermine = new Set<string>()

  for (const eintrag of abgelaufen) {
    // Prüfen ob für diesen Termin schon jemand nachgerückt ist
    if (behandelteTermine.has(eintrag.terminId)) continue
    behandelteTermine.add(eintrag.terminId)

    await prisma.wartelistenEintrag.delete({ where: { id: eintrag.id } })
    freigegeben++

    // Benachrichtigung an Mitglied
    await prisma.benachrichtigung.create({
      data: {
        typ: "info",
        titel: "Bestätigungsfrist abgelaufen",
        inhalt: `Dein Anspruch auf den Platz in "${eintrag.termin.kurs.name}" am ${new Date(eintrag.termin.datum).toLocaleDateString("de-DE")} um ${eintrag.termin.uhrzeit} ist verfallen, da du nicht rechtzeitig bestätigt hast.`,
        mitgliedId: eintrag.mitgliedId,
      },
    })

    // Nächsten auf der Warteliste benachrichtigen
    const naechster = await prisma.wartelistenEintrag.findFirst({
      where: { terminId: eintrag.terminId, bestaetigtBis: null },
      orderBy: { reihenfolge: "asc" },
    })
    if (naechster) {
      const kapazitaet = Math.min(eintrag.termin.kurs.maxTeilnehmer, eintrag.termin.raum.kapazitaet)
      const aktuelleBuchungen = await prisma.buchung.count({
        where: { terminId: eintrag.terminId, teilnahmeStatus: { not: "storniert" } },
      })
      if (aktuelleBuchungen < kapazitaet) {
        const bestaetigtBis = new Date(Date.now() + 60 * 60 * 1000)
        await prisma.wartelistenEintrag.update({
          where: { id: naechster.id },
          data: { bestaetigtBis, reihenfolge: 1 },
        })
        const mitglied = await prisma.mitglied.findUnique({ where: { id: naechster.mitgliedId } })
        if (mitglied) {
          await prisma.benachrichtigung.create({
            data: {
              typ: "info",
              titel: "Platz freigeworden – Bestätigung erforderlich",
              inhalt: `Es wurde ein Platz in "${eintrag.termin.kurs.name}" am ${new Date(eintrag.termin.datum).toLocaleDateString("de-DE")} um ${eintrag.termin.uhrzeit} frei. Bitte innerhalb von 60 Minuten bestätigen, sonst verfällt der Anspruch.`,
              mitgliedId: mitglied.id,
            },
          })
        }
      }
    }

    // Reihenfolge aktualisieren
    const rest = await prisma.wartelistenEintrag.findMany({
      where: { terminId: eintrag.terminId },
      orderBy: { reihenfolge: "asc" },
    })
    for (let i = 0; i < rest.length; i++) {
      await prisma.wartelistenEintrag.update({
        where: { id: rest[i].id },
        data: { reihenfolge: i + 1 },
      })
    }
  }

  return NextResponse.json({
    success: true,
    abgelaufenEntfernt: freigegeben,
    termineBetroffen: behandelteTermine.size,
  })
}
