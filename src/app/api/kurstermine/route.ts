import { prisma } from "@/lib/prisma"
import { auth, hatBerechtigung } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })

  const termine = await prisma.kurstermin.findMany({
    include: { kurs: true, raum: true, trainer: true, _count: { select: { buchungen: true } } },
    orderBy: [{ datum: "asc" }, { uhrzeit: "asc" }],
  })
  return NextResponse.json(termine)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }
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
  return NextResponse.json(termin, { status: 201 })
}
