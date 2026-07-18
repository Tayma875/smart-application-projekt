import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const updateData: any = {}
  if (data.name) updateData.name = data.name
  if (data.kapazitaet) updateData.kapazitaet = parseInt(data.kapazitaet)
  if (data.raumtyp !== undefined) updateData.raumtyp = data.raumtyp
  const raum = await prisma.raum.update({ where: { id: params.id }, data: updateData })
  return NextResponse.json(raum)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.raum.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
