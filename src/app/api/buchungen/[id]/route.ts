import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })

  const buchung = await prisma.buchung.findUnique({
    where: { id: params.id },
    include: { termin: true, mitglied: { include: { tarif: true } } },
  })
  if (!buchung) return NextResponse.json({ error: "Buchung nicht gefunden" }, { status: 404 })

  const data = await req.json()
  const newStatus = data.teilnahmeStatus

  // Anwesenheit (Trainer/Admin)
  if (newStatus === "teilgenommen" || newStatus === "no_show") {
    if (session.user.rolle !== "Trainer" && session.user.rolle !== "Admin") {
      return NextResponse.json({ error: "Nur Trainer dürfen Anwesenheit markieren" }, { status: 403 })
    }

    const updated = await prisma.buchung.update({
      where: { id: params.id },
      data: { teilnahmeStatus: newStatus },
      include: { termin: { include: { kurs: true } }, mitglied: { select: { vorname: true, nachname: true } } },
    })

    // No-Show-Zähler aktualisieren
    const mitglied = await prisma.mitglied.findUnique({ where: { id: buchung.mitgliedId } })
    if (mitglied) {
      if (newStatus === "no_show") {
        const neuerZaehler = (mitglied.noShowZaehler || 0) + 1
        await prisma.mitglied.update({
          where: { id: buchung.mitgliedId },
          data: { noShowZaehler: neuerZaehler },
        })

        // SMA-016: Warnung nach 2 No-Shows
        if (neuerZaehler === 2) {
          await prisma.benachrichtigung.create({
            data: {
              typ: "warnung",
              titel: "No-Show-Warnung",
              inhalt: `${mitglied.vorname} ${mitglied.nachname} hat zweimal hintereinander unentschuldigt gefehlt.`,
              empfaengerRolle: "Admin",
              mitgliedId: mitglied.id,
            },
          })
        }

        // SMA-017: Sperre nach 3 No-Shows
        if (neuerZaehler >= 3) {
          const gesperrtBis = new Date()
          gesperrtBis.setDate(gesperrtBis.getDate() + 14)
          await prisma.mitglied.update({
            where: { id: buchung.mitgliedId },
            data: { gesperrtBis },
          })
          await prisma.benachrichtigung.create({
            data: {
              typ: "warnung",
              titel: "No-Show-Sperre",
              inhalt: `${mitglied.vorname} ${mitglied.nachname} wurde für 2 Wochen für Live-Buchungen gesperrt.`,
              empfaengerRolle: "Admin",
              mitgliedId: mitglied.id,
            },
          })
        }
      } else if (newStatus === "teilgenommen") {
        // Bei Teilnahme: No-Show-Zähler zurücksetzen
        await prisma.mitglied.update({
          where: { id: buchung.mitgliedId },
          data: { noShowZaehler: 0 },
        })
      }
    }

    return NextResponse.json(updated)
  }

  // Storno
  if (newStatus !== "storniert") {
    return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 })
  }

  if (session.user.rolle === "Mitglied") {
    const mitglied = await prisma.mitglied.findFirst({ where: { accountId: session.user.userId } })
    if (!mitglied || mitglied.id !== buchung.mitgliedId) {
      return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
    }
  }

  if (buchung.teilnahmeStatus !== "angemeldet") {
    return NextResponse.json({ error: "Buchung kann nicht storniert werden" }, { status: 400 })
  }

  const updateData: any = { teilnahmeStatus: "storniert", stornozeitpunkt: new Date() }

  const terminStart = new Date(`${buchung.termin.datum.toISOString().split("T")[0]}T${buchung.termin.uhrzeit}`)
  const zweiStundenVorher = new Date(terminStart.getTime() - 2 * 60 * 60 * 1000)
  if (new Date() > zweiStundenVorher && buchung.mitglied.tarif.name !== "Premium") {
    updateData.gebuehr = true
  }

  const updated = await prisma.buchung.update({
    where: { id: params.id },
    data: updateData,
    include: { termin: { include: { kurs: true } }, mitglied: { select: { vorname: true, nachname: true } } },
  })

  // Warteliste nachrücken
  const naechsterWarte = await prisma.wartelistenEintrag.findFirst({
    where: { terminId: buchung.terminId },
    orderBy: { reihenfolge: "asc" },
  })
  if (naechsterWarte) {
    const termin = await prisma.kurstermin.findUnique({
      where: { id: buchung.terminId },
      include: { kurs: true, raum: true },
    })
    if (termin) {
      const kapazitaet = Math.min(termin.kurs.maxTeilnehmer, termin.raum.kapazitaet)
      const aktuelleBuchungen = await prisma.buchung.count({
        where: { terminId: buchung.terminId, teilnahmeStatus: { not: "storniert" } },
      })
      if (aktuelleBuchungen < kapazitaet) {
        await prisma.buchung.create({
          data: { mitgliedId: naechsterWarte.mitgliedId, terminId: buchung.terminId, buchungszeitpunkt: new Date(), teilnahmeStatus: "angemeldet" },
        })
        await prisma.wartelistenEintrag.delete({ where: { id: naechsterWarte.id } })
        const rest = await prisma.wartelistenEintrag.findMany({ where: { terminId: buchung.terminId }, orderBy: { reihenfolge: "asc" } })
        for (let i = 0; i < rest.length; i++) {
          await prisma.wartelistenEintrag.update({ where: { id: rest[i].id }, data: { reihenfolge: i + 1 } })
        }
      }
    }
  }

  return NextResponse.json(updated)
}
