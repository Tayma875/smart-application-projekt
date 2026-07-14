import { prisma } from "@/lib/prisma"
import { auth, hatBerechtigung } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  const data = await req.json()
  const qual = await prisma.trainerKurs.upsert({
    where: { trainerId_kursId: { trainerId: data.trainerId, kursId: data.kursId } },
    update: {},
    create: { trainerId: data.trainerId, kursId: data.kursId },
  })
  return NextResponse.json(qual, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  const data = await req.json()
  await prisma.trainerKurs.delete({ where: { trainerId_kursId: { trainerId: data.trainerId, kursId: data.kursId } } })
  return NextResponse.json({ success: true })
}
