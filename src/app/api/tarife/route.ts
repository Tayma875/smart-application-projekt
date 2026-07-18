import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
if (!session?.user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })
  const tarife = await prisma.tarif.findMany({ orderBy: { monatspreis: "asc" } })
  return NextResponse.json(tarife)
}

export async function POST(req: Request) {

  const data = await req.json()
  const tarif = await prisma.tarif.create({
    data: {
      name: data.name,
      monatspreis: parseFloat(data.monatspreis),
      laufzeit: data.laufzeit,
      buchungslimit: data.buchungslimit ? parseInt(data.buchungslimit) : null,
      onlineBerechtigung: data.onlineBerechtigung,
      stornoRegel: data.stornoRegel || null,
    },
  })
    await logAudit("tarif_erstellt", `${tarif.name} (${tarif.monatspreis}€)`, tarif.id, "Tarif")
  return NextResponse.json(tarif, { status: 201 })
}
