import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
if (!session?.user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })
  const data = await req.json()
  const updateData: any = {}
  if (data.name) updateData.name = data.name
  if (data.beschreibung !== undefined) updateData.beschreibung = data.beschreibung
  if (data.level) updateData.level = data.level
  if (data.kategorie) updateData.kategorie = data.kategorie
  if (data.dauer) updateData.dauer = parseInt(data.dauer)
  if (data.maxTeilnehmer) updateData.maxTeilnehmer = parseInt(data.maxTeilnehmer)
  if (data.voraussetzungId !== undefined) updateData.voraussetzungId = data.voraussetzungId || null
  const kurs = await prisma.kurs.update({ where: { id: params.id }, data: updateData })
  return NextResponse.json(kurs)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.kurs.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
