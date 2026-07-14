import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })

  const data = await req.json()
  const { mitgliedId, terminId } = data

  // Mitglied + Sperre prüfen
  const mitglied = await prisma.mitglied.findUnique({
    where: { id: mitgliedId },
    include: { tarif: true },
  })
  if (!mitglied) return NextResponse.json({ error: "Mitglied nicht gefunden" }, { status: 404 })

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

  const terminStart = new Date(`${termin.datum.toISOString().split("T")[0]}T${termin.uhrzeit}`)
  const zweiStundenVorher = new Date(terminStart.getTime() - 2 * 60 * 60 * 1000)
  if (new Date() > zweiStundenVorher) {
    return NextResponse.json({ error: "Buchung nur bis 2 Stunden vor Kursbeginn möglich" }, { status: 400 })
  }

  const kapazitaet = Math.min(termin.kurs.maxTeilnehmer, termin.raum.kapazitaet)
  if (termin._count.buchungen >= kapazitaet) {
    return NextResponse.json({ error: "Kurs ausgebucht" }, { status: 400 })
  }

  const exist = await prisma.buchung.findUnique({
    where: { mitgliedId_terminId: { mitgliedId, terminId } },
  })
  if (exist && exist.teilnahmeStatus !== "storniert") {
    return NextResponse.json({ error: "Bereits gebucht" }, { status: 400 })
  }

  // Monatliches Buchungslimit
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
  return NextResponse.json(buchung, { status: 201 })
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })

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
