import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { logAudit } from "@/lib/audit"

export async function GET() {
  const raeume = await prisma.raum.findMany({ orderBy: { name: "asc" } })
  return NextResponse.json(raeume)
}

export async function POST(req: Request) {
  const data = await req.json()
  const raum = await prisma.raum.create({
    data: { name: data.name, kapazitaet: parseInt(data.kapazitaet), raumtyp: data.raumtyp || null },
  })
  await logAudit("raum_erstellt", `${raum.name} (${raum.kapazitaet} Plätze)`, raum.id, "Raum")
  return NextResponse.json(raum, { status: 201 })
}
