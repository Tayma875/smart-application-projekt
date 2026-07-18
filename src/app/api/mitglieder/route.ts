import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { logAudit } from "@/lib/audit"
import bcrypt from "bcryptjs"

export async function GET() {
  const mitglieder = await prisma.mitglied.findMany({
    include: { tarif: true, account: { select: { email: true } } },
    orderBy: { nachname: "asc" },
  })
  return NextResponse.json(mitglieder)
}

export async function POST(req: Request) {
  const data = await req.json()

  const defaultPassword = process.env.DEFAULT_MITGLIED_PASSWORD || "mitglied123"
  const hashedPassword = await bcrypt.hash(defaultPassword, 10)

  // Account für das Mitglied erstellen
  const account = await prisma.account.create({
    data: {
      email: data.email,
      password: hashedPassword,
      rolle: "Mitglied",
    },
  })

  const mitglied = await prisma.mitglied.create({
    data: {
      accountId: account.id,
      vorname: data.vorname,
      nachname: data.nachname,
      email: data.email,
      telefon: data.telefon || null,
      geburtsdatum: data.geburtsdatum ? new Date(data.geburtsdatum) : null,
      status: data.status || "aktiv",
      zahlungsstatus: data.zahlungsstatus || "ok",
      tarifId: data.tarifId,
      fotoUrl: data.fotoUrl || null,
    },
    include: { tarif: true, account: { select: { email: true } } },
  })

  // SMA-020: Warnung bei Zahlung ausstehend
  if (mitglied.status === "zahlung_ausstehend" || mitglied.zahlungsstatus === "ausstehend") {
    await prisma.benachrichtigung.create({
      data: {
        typ: "warnung",
        titel: "Zahlung ausstehend",
        inhalt: `${mitglied.vorname} ${mitglied.nachname} hat Zahlung ausstehend`,
        empfaengerRolle: "Admin",
      },
    })
  }

    await logAudit("mitglied_erstellt", `${mitglied.vorname} ${mitglied.nachname} (${data.email})`, mitglied.id, "Mitglied")
  return NextResponse.json(mitglied, { status: 201 })
}
