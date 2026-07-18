import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const updateData: any = {}
  if (data.name) updateData.name = data.name
  if (data.spezialisierung !== undefined) updateData.spezialisierung = data.spezialisierung
  if (data.beschaeftigungsart) updateData.beschaeftigungsart = data.beschaeftigungsart
  const trainer = await prisma.trainer.update({
    where: { id: params.id }, data: updateData,
    include: { kurse: { include: { kurs: true } } },
  })
  return NextResponse.json(trainer)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.trainerKurs.deleteMany({ where: { trainerId: params.id } })
  await prisma.trainer.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
