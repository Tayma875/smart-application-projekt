import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()

  const data = await req.json()
  const { mitgliedId, terminId } = data

  // Mitglied + Status + Sperre prüfen
  const mitglied = await prisma.mitglied.findUnique({
    where: { id: mitgliedId },
    include: { tarif: true },
  })
  if (!mitglied) return NextResponse.json({ error: "Mitglied nicht gefunden" }, { status: 404 })

  // Nur aktive Mitglieder dürfen buchen
  if (mitglied.status !== "aktiv") {
    return NextResponse.json({ error: `Buchung nicht möglich – Mitgliedsstatus: ${mitglied.status}` }, { status: 403 })
  }

  // SMA-017/018: Sperre prüfen
  if (mitglied.gesperrtBis && new Date() < mitglied.gesperrtBis) {
    return NextResponse.json({
      error: `Für Live-Buchungen gesperrt bis ${mitglied.gesperrtBis.toLocaleDateString("de-DE")}`,
    }, { status: 403 })
  }

  const termin = await prisma.kurstermin.findUnique({
    where: { id: terminId },
    include: { kurs: true, raum: true, _count: { select: { buchungen: { where: { teilnahmeStatus: { not: "storniert" } } } } } },
  })
  if (!termin) return NextResponse.json({ error: "Termin nicht gefunden" }, { status: 404 })

  // SMA-029: Fortgeschrittenenkurse nur mit Freigabe
  if (termin.kurs.level === "fortgeschritten") {
    const freigabe = await prisma.advancedFreigabe.findUnique({
      where: { mitgliedId_kategorie: { mitgliedId, kategorie: termin.kurs.kategorie } },
    })
    if (!freigabe) {
      return NextResponse.json({ error: "Fortgeschrittenenkurse benötigen eine Admin-Freigabe" }, { status: 403 })
    }
  }

  const terminStart = new Date(`${termin.datum.toISOString().split("T")[0]}T${termin.uhrzeit}`)
  const zweiStundenVorher = new Date(terminStart.getTime() - 2 * 60 * 60 * 1000)
  if (new Date() > zweiStundenVorher) {
    return NextResponse.json({ error: "Buchung nur bis 2 Stunden vor Kursbeginn möglich" }, { status: 400 })
  }

  const kapazitaet = Math.min(termin.kurs.maxTeilnehmer, termin.raum.kapazitaet)
  if (termin._count.buchungen >= kapazitaet) {
    return NextResponse.json({ error: "Kurs ausgebucht" }, { status: 400 })
  }

  // Existierende Buchung prüfen: stornierte Buchungen reaktivieren
  const exist = await prisma.buchung.findUnique({
    where: { mitgliedId_terminId: { mitgliedId, terminId } },
  })
  if (exist) {
    if (exist.teilnahmeStatus === "storniert") {
      // Stornierte Buchung reaktivieren statt neu anzulegen
      const reaktiviert = await prisma.buchung.update({
        where: { id: exist.id },
        data: {
          teilnahmeStatus: "angemeldet",
          buchungszeitpunkt: new Date(),
          stornozeitpunkt: null,
          gebuehr: false,
        },
        include: { termin: { include: { kurs: true } } },
      })
      return NextResponse.json(reaktiviert, { status: 200 })
    }
    return NextResponse.json({ error: "Bereits gebucht" }, { status: 400 })
  }

  // Monatliches Buchungslimit – zählt nicht-stornierte Buchungen im aktuellen Monat
  if (mitglied.tarif.buchungslimit) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const monatsBuchungen = await prisma.buchung.count({
      where: {
        mitgliedId,
        buchungszeitpunkt: { gte: startOfMonth, lte: endOfMonth },
        teilnahmeStatus: { not: "storniert" },
      },
    })
    if (monatsBuchungen >= mitglied.tarif.buchungslimit) {
      return NextResponse.json({ error: `Monatliches Buchungslimit erreicht (${mitglied.tarif.buchungslimit}/${mitglied.tarif.buchungslimit})` }, { status: 400 })
    }
  }

  const buchung = await prisma.buchung.create({
    data: { mitgliedId, terminId, buchungszeitpunkt: new Date(), teilnahmeStatus: "angemeldet" },
    include: { termin: { include: { kurs: true } } },
  })

  // SMA-024: Auslastungswarnung bei 80%
  const aktuelleBuchungen = termin._count.buchungen + 1
  const auslastung = aktuelleBuchungen / kapazitaet
  if (auslastung >= 0.8) {
    const existiert = await prisma.benachrichtigung.findFirst({
      where: { terminId, typ: "warnung", titel: { contains: "80%" } },
    })
    if (!existiert) {
      await prisma.benachrichtigung.create({
        data: {
          typ: "warnung",
          titel: "Auslastungswarnung (80%)",
          inhalt: `${termin.kurs.name} am ${new Date(termin.datum).toLocaleDateString("de-DE")} um ${termin.uhrzeit}: ${aktuelleBuchungen}/${kapazitaet} Plätze belegt (${Math.round(auslastung * 100)}%)`,
          empfaengerRolle: "Admin",
          terminId,
        },
      })
    }
  }

  return NextResponse.json(buchung, { status: 201 })
}

export async function GET() {
  const session = await auth()
  if (session.user.rolle === "Mitglied") {
    const mitglied = await prisma.mitglied.findFirst({ where: { accountId: session.user.userId } })
    if (!mitglied) return NextResponse.json([])
    const buchungen = await prisma.buchung.findMany({
      where: { mitgliedId: mitglied.id },
      include: { termin: { include: { kurs: true, raum: true } } },
      orderBy: { buchungszeitpunkt: "desc" },
    })
    return NextResponse.json(buchungen)
  }

  if (session.user.rolle === "Admin" || session.user.rolle === "Rezeption") {
    const buchungen = await prisma.buchung.findMany({
      include: { mitglied: { select: { vorname: true, nachname: true } }, termin: { include: { kurs: true, raum: true } } },
      orderBy: { buchungszeitpunkt: "desc" }, take: 50,
    })
    return NextResponse.json(buchungen)
  }

  return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
}
