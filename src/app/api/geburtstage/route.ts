import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST() {

  const heute = new Date()
  const heuteMonatTag = `${String(heute.getMonth() + 1).padStart(2, "0")}-${String(heute.getDate()).padStart(2, "0")}`

  // Mitglieder mit Geburtstag heute finden
  const alleMitglieder = await prisma.mitglied.findMany({
    where: {
      geburtsdatum: { not: null },
      status: { in: ["aktiv", "pausiert"] },
    },
    select: {
      id: true,
      vorname: true,
      nachname: true,
      geburtsdatum: true,
    },
  })

  const geburtstagKinder = alleMitglieder.filter((m) => {
    if (!m.geburtsdatum) return false
    const mm = String(m.geburtsdatum.getMonth() + 1).padStart(2, "0")
    const dd = String(m.geburtsdatum.getDate()).padStart(2, "0")
    return `${mm}-${dd}` === heuteMonatTag
  })

  let erinnert = 0

  for (const mitglied of geburtstagKinder) {
    // Prüfen ob heute schon eine Erinnerung existiert
    const heuteStart = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate())
    const heuteEnde = new Date(heuteStart.getTime() + 24 * 60 * 60 * 1000)

    const existiert = await prisma.benachrichtigung.findFirst({
      where: {
        empfaengerRolle: "Admin",
        typ: "erinnerung",
        titel: { contains: "Geburtstag" },
        mitgliedId: mitglied.id,
        createdAt: { gte: heuteStart, lt: heuteEnde },
      },
    })

    if (existiert) continue

    await prisma.benachrichtigung.create({
      data: {
        typ: "erinnerung",
        titel: "Geburtstag",
        inhalt: `${mitglied.vorname} ${mitglied.nachname} hat heute Geburtstag!`,
        empfaengerRolle: "Admin",
        mitgliedId: mitglied.id,
      },
    })
    erinnert++
  }

  return NextResponse.json({
    success: true,
    geburtstageHeute: geburtstagKinder.length,
    erinnerungenErzeugt: erinnert,
    mitglieder: geburtstagKinder.map((m) => ({
      vorname: m.vorname,
      nachname: m.nachname,
    })),
  })
}

export async function GET() {

  const heuteStart = new Date()
  heuteStart.setHours(0, 0, 0, 0)
  const heuteEnde = new Date(heuteStart.getTime() + 24 * 60 * 60 * 1000)

  const benachrichtigungen = await prisma.benachrichtigung.findMany({
    where: {
      empfaengerRolle: "Admin",
      typ: "erinnerung",
      titel: "Geburtstag",
      createdAt: { gte: heuteStart, lt: heuteEnde },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ geburtstage: benachrichtigungen })
}
