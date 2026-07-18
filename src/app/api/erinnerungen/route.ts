import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { sendKursErinnerung } from "@/lib/mail"

export async function POST() {
  const jetzt = new Date()
  const in24h = new Date(jetzt.getTime() + 24 * 60 * 60 * 1000)

  const termine = await prisma.kurstermin.findMany({
    where: {
      status: { in: ["findet_statt", "vertretung"] },
      datum: {
        gte: new Date(jetzt.toISOString().split("T")[0]),
        lte: new Date(in24h.toISOString().split("T")[0]),
      },
    },
    include: {
      kurs: true,
      raum: true,
      trainer: true,
      buchungen: {
        where: { teilnahmeStatus: "angemeldet" },
        include: { mitglied: true },
      },
    },
  })

  let gesendet24h = 0
  let gesendet1h = 0
  let mailsGesendet = 0

  for (const termin of termine) {
    const terminStart = new Date(`${termin.datum.toISOString().split("T")[0]}T${termin.uhrzeit}`)
    const diffMs = terminStart.getTime() - jetzt.getTime()
    const diffMin = diffMs / (1000 * 60)

    const datumStr = new Date(termin.datum).toLocaleDateString("de-DE")

    // Erinnerung 24h vorher (zwischen 23h und 25h vorher)
    if (diffMin >= 23 * 60 && diffMin <= 25 * 60) {
      for (const buchung of termin.buchungen) {
        const existiert = await prisma.benachrichtigung.findFirst({
          where: {
            mitgliedId: buchung.mitgliedId,
            terminId: termin.id,
            typ: "erinnerung",
            titel: { contains: "24 Stunden" },
          },
        })
        if (existiert) continue

        await prisma.benachrichtigung.create({
          data: {
            typ: "erinnerung",
            titel: "Kurserinnerung (24h)",
            inhalt: `Morgen um ${termin.uhrzeit}: ${termin.kurs.name} mit ${termin.trainer.name} im Raum ${termin.raum.name}.`,
            mitgliedId: buchung.mitgliedId,
            terminId: termin.id,
          },
        })
        gesendet24h++

        // E-Mail senden, wenn Mitglied eine E-Mail hat
        if (buchung.mitglied.email) {
          const result = await sendKursErinnerung(
            buchung.mitglied.email,
            buchung.mitglied.vorname,
            termin.kurs.name,
            datumStr,
            termin.uhrzeit,
            termin.raum.name
          )
          if (result.messageId) mailsGesendet++
        }
      }
    }

    // Erinnerung 1h vorher
    if (diffMin >= 45 && diffMin <= 75) {
      for (const buchung of termin.buchungen) {
        const existiert = await prisma.benachrichtigung.findFirst({
          where: {
            mitgliedId: buchung.mitgliedId,
            terminId: termin.id,
            typ: "erinnerung",
            titel: { contains: "1 Stunde" },
          },
        })
        if (existiert) continue

        await prisma.benachrichtigung.create({
          data: {
            typ: "erinnerung",
            titel: "Kurserinnerung (1h)",
            inhalt: `In einer Stunde um ${termin.uhrzeit}: ${termin.kurs.name} mit ${termin.trainer.name} in Raum ${termin.raum.name}.`,
            mitgliedId: buchung.mitgliedId,
            terminId: termin.id,
          },
        })
        gesendet1h++

        if (buchung.mitglied.email) {
          const result = await sendKursErinnerung(
            buchung.mitglied.email,
            buchung.mitglied.vorname,
            termin.kurs.name,
            datumStr,
            termin.uhrzeit,
            termin.raum.name
          )
          if (result.messageId) mailsGesendet++
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    erinnerungen24h: gesendet24h,
    erinnerungen1h: gesendet1h,
    mailsGesendet,
  })
}
