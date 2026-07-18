import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
if (!session?.user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })

  const url = new URL(req.url)
  const von = url.searchParams.get("von")
  const bis = url.searchParams.get("bis")
  const trainerId = url.searchParams.get("trainerId")

  if (!von || !bis) {
    return NextResponse.json({ error: "Parameter 'von' und 'bis' erforderlich (YYYY-MM-DD)" }, { status: 400 })
  }

  const vonDate = new Date(von)
  const bisDate = new Date(bis)
  bisDate.setHours(23, 59, 59, 999)

  // Trainer sehen nur ihre eigene Abrechnung
  let trainerFilter = trainerId || undefined
  if (session.user.rolle === "Trainer") {
    const trainer = await prisma.trainer.findFirst({ where: { accountId: session.user.userId } })
    if (!trainer) return NextResponse.json({ error: "Trainer nicht gefunden" }, { status: 404 })
    trainerFilter = trainer.id
  }

  // Honorartrainer dürfen nur stattgefundene Termine sehen
  const where: any = {
    status: "stattgefunden",
    datum: { gte: vonDate, lte: bisDate },
  }
  if (trainerFilter) where.trainerId = trainerFilter

  const termine = await prisma.kurstermin.findMany({
    where,
    include: {
      kurs: { select: { name: true, dauer: true } },
      trainer: { select: { name: true, beschaeftigungsart: true } },
      _count: { select: { buchungen: { where: { teilnahmeStatus: { not: "storniert" } } } } },
    },
    orderBy: [{ datum: "asc" }, { uhrzeit: "asc" }],
  })

  // Nur Honorartrainer in die Abrechnung aufnehmen
  const abrechnung = termine
    .filter(t => t.trainer.beschaeftigungsart === "honorarbasis")
    .map(t => ({
      datum: t.datum.toISOString().split("T")[0],
      uhrzeit: t.uhrzeit,
      kursName: t.kurs.name,
      dauer: t.kurs.dauer,
      trainerName: t.trainer.name,
      teilnehmer: t._count.buchungen,
    }))

  const gesamtStunden = abrechnung.reduce((sum, t) => sum + t.dauer, 0) / 60

  return NextResponse.json({
    zeitraum: { von, bis },
    termine: abrechnung,
    anzahlTermine: abrechnung.length,
    gesamtStunden: Math.round(gesamtStunden * 100) / 100,
  })
}
