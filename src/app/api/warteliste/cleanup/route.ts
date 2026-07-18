import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendWartelisteBenachrichtigung } from "@/lib/mail"
import { NextResponse } from "next/server"

export async function POST() {
  // Abgelaufene Bestätigungsfristen finden – nur den ersten Eintrag pro Termin
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

  // Nur den ersten abgelaufenen Eintrag pro Termin verarbeiten
  const ersteProTermin = new Map<string, typeof abgelaufen[0]>()
  for (const eintrag of abgelaufen) {
    if (!ersteProTermin.has(eintrag.terminId)) {
      ersteProTermin.set(eintrag.terminId, eintrag)
    }
  }

  let freigegeben = 0

  for (const [, eintrag] of ersteProTermin) {
    await prisma.wartelistenEintrag.delete({ where: { id: eintrag.id } })
    freigegeben++

    // Benachrichtigung an das Mitglied mit der abgelaufenen Frist
    await prisma.benachrichtigung.create({
      data: {
        typ: "info",
        titel: "Bestätigungsfrist abgelaufen",
        inhalt: `Dein Anspruch auf den Platz in "${eintrag.termin.kurs.name}" am ${new Date(eintrag.termin.datum).toLocaleDateString("de-DE")} um ${eintrag.termin.uhrzeit} ist verfallen, da du nicht rechtzeitig bestätigt hast.`,
        mitgliedId: eintrag.mitgliedId,
      },
    })

    // Nächsten auf der Warteliste benachrichtigen (wenn Platz frei)
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
          data: { bestaetigtBis },
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

          if (mitglied.email) {
            await sendWartelisteBenachrichtigung(
              mitglied.email,
              mitglied.vorname,
              eintrag.termin.kurs.name,
              new Date(eintrag.termin.datum).toLocaleDateString("de-DE"),
              eintrag.termin.uhrzeit
            )
          }
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
    termineBetroffen: ersteProTermin.size,
  })
}
