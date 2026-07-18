import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.onlineContent.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
