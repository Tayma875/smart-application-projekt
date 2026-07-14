import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })

  await prisma.wartelistenEintrag.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
