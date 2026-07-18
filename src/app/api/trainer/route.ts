import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET()
import { logAudit } from "@/lib/audit" {
  const trainer = await prisma.trainer.findMany({ include: { kurse: { include: { kurs: true } } }, orderBy: { name: "asc" } })
  return NextResponse.json(trainer)
}

export async function POST(req: Request) {
  const data = await req.json()
  const trainer = await prisma.trainer.create({
    data: { name: data.name, spezialisierung: data.spezialisierung || null, beschaeftigungsart: data.beschaeftigungsart },
    include: { kurse: { include: { kurs: true } } },
  })
  return NextResponse.json(trainer, { status: 201 })
}
