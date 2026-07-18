import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()

  const url = new URL(req.url)
  const mitgliedId = url.searchParams.get("mitgliedId")

  if (!mitgliedId) return NextResponse.json({ error: "mitgliedId fehlt" }, { status: 400 })

  const mitglied = await prisma.mitglied.findFirst({
    where: { accountId: session.user.userId },
  })
  if (!mitglied || mitglied.id !== mitgliedId) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }

  const ausstehend = await prisma.wartelistenEintrag.findMany({
    where: {
      mitgliedId,
      bestaetigtBis: { not: null, gte: new Date() },
    },
    include: {
      termin: {
        include: { kurs: true, raum: true, trainer: true },
      },
    },
    orderBy: { bestaetigtBis: "asc" },
  })

  return NextResponse.json(ausstehend)
}
