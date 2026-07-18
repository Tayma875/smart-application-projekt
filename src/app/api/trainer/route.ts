import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { logAudit } from "@/lib/audit"

export async function GET() {
  const trainer = await prisma.trainer.findMany({ include: { kurse: { include: { kurs: true } } }, orderBy: { name: "asc" } })
  return NextResponse.json(trainer)
}

export async function POST(req: Request) {
  const data = await req.json()
  const trainerNeu = await prisma.trainer.create({
    data: {
      name: data.name,
      spezialisierung: data.spezialisierung || null,
      beschaeftigungsart: data.beschaeftigungsart || "fest_angestellt",
    },
  })
  await logAudit("trainer_erstellt", `${trainerNeu.name}`, trainerNeu.id, "Trainer")
  return NextResponse.json(trainerNeu, { status: 201 })
}
