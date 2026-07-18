import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { NextResponse } from "next/server"

export async function GET() {

  const termine = await prisma.kurstermin.findMany({
    include: { kurs: true, raum: true, trainer: true, _count: { select: { buchungen: true } } },
    orderBy: [{ datum: "asc" }, { uhrzeit: "asc" }],
  })
  return NextResponse.json(termine)
}

export async function POST(req: Request) {
  const session = await auth()
  const data = await req.json()
  const termin = await prisma.kurstermin.create({
    data: {
      kursId: data.kursId,
      raumId: data.raumId,
      trainerId: data.trainerId,
      datum: new Date(data.datum),
      uhrzeit: data.uhrzeit,
      status: data.status || "findet_statt",
    },
    include: { kurs: true, raum: true, trainer: true },
  })
    await logAudit("kurstermin_erstellt", `${termin.kurs?.name || termin.kursId} am ${new Date(termin.datum).toLocaleDateString("de-DE")} ${termin.uhrzeit}`, termin.id, "Kurstermin")
  return NextResponse.json(termin, { status: 201 })
}
