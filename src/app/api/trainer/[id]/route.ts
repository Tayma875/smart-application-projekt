import { prisma } from "@/lib/prisma"
import { auth, hatBerechtigung } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
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
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  await prisma.trainerKurs.deleteMany({ where: { trainerId: params.id } })
  await prisma.trainer.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
