import { prisma } from "@/lib/prisma"
import { auth, hatBerechtigung } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  const trainer = await prisma.trainer.findMany({ include: { kurse: { include: { kurs: true } } }, orderBy: { name: "asc" } })
  return NextResponse.json(trainer)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  const data = await req.json()
  const trainer = await prisma.trainer.create({
    data: { name: data.name, spezialisierung: data.spezialisierung || null, beschaeftigungsart: data.beschaeftigungsart },
    include: { kurse: { include: { kurs: true } } },
  })
  return NextResponse.json(trainer, { status: 201 })
}
