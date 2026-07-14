import { prisma } from "@/lib/prisma"
import { auth, hatBerechtigung } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })

  const content = await prisma.onlineContent.findMany({
    include: { kurs: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(content)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) {
    return NextResponse.json({ error: "Nicht berechtigt" }, { status: 403 })
  }
  const data = await req.json()
  const c = await prisma.onlineContent.create({
    data: {
      titel: data.titel,
      beschreibung: data.beschreibung || null,
      kategorie: data.kategorie,
      videoUrl: data.videoUrl || null,
      kursId: data.kursId || null,
      dauer: data.dauer || null,
      tarifVoraussetzung: data.tarifVoraussetzung || "plus",
    },
    include: { kurs: true },
  })
  return NextResponse.json(c, { status: 201 })
}
