import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {

  const jetzt = new Date()
  const in30Tagen = new Date(jetzt.getTime() + 30 * 24 * 60 * 60 * 1000)

  const mitglieder = await prisma.mitglied.findMany({
    where: { status: { in: ["aktiv", "pausiert", "gekuendigt"] } },
    include: { tarif: true },
    orderBy: { nachname: "asc" },
  })

  const auslaufend: any[] = []
  const abgelaufen: any[] = []

  for (const m of mitglieder) {
    const vertragEnde = new Date(m.startdatum)
    if (m.tarif.laufzeit === "jahresvertrag") {
      vertragEnde.setFullYear(vertragEnde.getFullYear() + 1)
      while (vertragEnde <= jetzt) {
        vertragEnde.setFullYear(vertragEnde.getFullYear() + 1)
      }
    }

    const diffTage = (vertragEnde.getTime() - jetzt.getTime()) / (1000 * 60 * 60 * 24)

    if (m.status === "gekuendigt" && diffTage <= 0) {
      abgelaufen.push({
        id: m.id,
        name: `${m.vorname} ${m.nachname}`,
        email: m.email,
        tarif: m.tarif.name,
        vertragEnde: vertragEnde.toISOString().split("T")[0],
        status: m.status,
      })
    } else if (m.status === "gekuendigt") {
      auslaufend.push({
        id: m.id,
        name: `${m.vorname} ${m.nachname}`,
        email: m.email,
        tarif: m.tarif.name,
        vertragEnde: vertragEnde.toISOString().split("T")[0],
        diffTage: Math.round(diffTage),
      })
    } else if (diffTage <= 30 && diffTage > 0) {
      auslaufend.push({
        id: m.id,
        name: `${m.vorname} ${m.nachname}`,
        email: m.email,
        tarif: m.tarif.name,
        vertragEnde: vertragEnde.toISOString().split("T")[0],
        diffTage: Math.round(diffTage),
      })
    }
  }

  return NextResponse.json({ auslaufend, abgelaufen })
}

export async function POST() {

  const res = await GET()
  const data = await res.json()
  let erstellt = 0

  for (const m of data.auslaufend) {
    const existiert = await prisma.benachrichtigung.findFirst({
      where: {
        typ: "erinnerung",
        titel: { contains: "Vertrag läuft aus" },
        mitgliedId: m.id,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    })
    if (!existiert) {
      await prisma.benachrichtigung.create({
        data: {
          typ: "erinnerung",
          titel: "Vertrag läuft aus",
          inhalt: `${m.name} (${m.tarif}): Vertrag endet in ${m.diffTage} Tagen (${m.vertragEnde}).`,
          empfaengerRolle: "Admin",
        },
      })
      erstellt++
    }
  }

  for (const m of data.abgelaufen) {
    const existiert = await prisma.benachrichtigung.findFirst({
      where: {
        typ: "warnung",
        titel: { contains: "Vertrag abgelaufen" },
        mitgliedId: m.id,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    })
    if (!existiert) {
      await prisma.benachrichtigung.create({
        data: {
          typ: "warnung",
          titel: "Vertrag abgelaufen",
          inhalt: `${m.name} (${m.tarif}): Vertrag ist seit ${m.vertragEnde} abgelaufen.`,
          empfaengerRolle: "Admin",
        },
      })
      erstellt++
    }
  }

  return NextResponse.json({ success: true, benachrichtigungenErstellt: erstellt })
}
