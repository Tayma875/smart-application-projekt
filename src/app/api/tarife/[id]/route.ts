import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
if (!session?.user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })
  const data = await req.json()
  const updateData: any = {}
  if (data.name) updateData.name = data.name
  if (data.monatspreis !== undefined) updateData.monatspreis = parseFloat(data.monatspreis)
  if (data.laufzeit) updateData.laufzeit = data.laufzeit
  if (data.buchungslimit !== undefined) updateData.buchungslimit = data.buchungslimit ? parseInt(data.buchungslimit) : null
  if (data.onlineBerechtigung) updateData.onlineBerechtigung = data.onlineBerechtigung
  if (data.stornoRegel !== undefined) updateData.stornoRegel = data.stornoRegel
  const tarif = await prisma.tarif.update({ where: { id: params.id }, data: updateData })
  return NextResponse.json(tarif)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.tarif.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
