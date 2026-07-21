import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendStornoBenachrichtigung } from "@/lib/mail"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
if (!session?.user) return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 })
  const data = await req.json()
  const updateData: any = {}
  if (data.kursId) updateData.kursId = data.kursId
  if (data.raumId) updateData.raumId = data.raumId
  if (data.trainerId) updateData.trainerId = data.trainerId
  if (data.datum) updateData.datum = new Date(data.datum)
  if (data.uhrzeit) updateData.uhrzeit = data.uhrzeit
  if (data.status) updateData.status = data.status

  // SMA-021: Trainerausfall-Warnung
  if (data.status === 'vertretung') {
    const aktuellerTermin = await prisma.kurstermin.findUnique({
      where: { id: params.id },
      include: { kurs: true, trainer: true },
    })
    if (aktuellerTermin) {
      await prisma.benachrichtigung.create({
        data: {
          typ: 'warnung',
          titel: 'Trainerausfall',
          inhalt: `${aktuellerTermin.trainer.name} fällt aus für ${aktuellerTermin.kurs.name} am ${new Date(aktuellerTermin.datum).toLocaleDateString('de-DE')} um ${aktuellerTermin.uhrzeit}. Bitte Ersatz eintragen.`,
          empfaengerRolle: 'Admin',
        },
      })
    }
  }
  // SMA-022: Kursabsage-Workflow
  if (data.status === "abgesagt") {
    const aktuellerTermin = await prisma.kurstermin.findUnique({
      where: { id: params.id },
      include: {
        kurs: true,
        buchungen: { where: { teilnahmeStatus: "angemeldet" }, include: { mitglied: true } },
        wartelisten: { include: { mitglied: true } },
      },
    })

    if (aktuellerTermin) {
      // Buchungen gebührenfrei stornieren
      await prisma.buchung.updateMany({
        where: { terminId: params.id, teilnahmeStatus: "angemeldet" },
        data: { teilnahmeStatus: "storniert", stornozeitpunkt: new Date(), gebuehr: false },
      })

      // Benachrichtigung an alle gebuchten Mitglieder
      for (const buchung of aktuellerTermin.buchungen) {
        await prisma.benachrichtigung.create({
          data: {
            typ: "info",
            titel: "Kurs abgesagt",
            inhalt: `Der Kurs ${aktuellerTermin.kurs.name} am ${new Date(aktuellerTermin.datum).toLocaleDateString("de-DE")} um ${aktuellerTermin.uhrzeit} wurde abgesagt. Deine Buchung wurde gebührenfrei storniert.`,
            mitgliedId: buchung.mitgliedId,
          },
        })

        // E-Mail an Mitglied
        if (buchung.mitglied.email) {
          await sendStornoBenachrichtigung(
            buchung.mitglied.email,
            buchung.mitglied.vorname,
            aktuellerTermin.kurs.name,
            new Date(aktuellerTermin.datum).toLocaleDateString("de-DE"),
            aktuellerTermin.uhrzeit
          )
        }
      }

      // Benachrichtigung an Warteliste
      for (const warte of aktuellerTermin.wartelisten) {
        await prisma.benachrichtigung.create({
          data: {
            typ: "info",
            titel: "Kurs abgesagt",
            inhalt: `Der Kurs ${aktuellerTermin.kurs.name} am ${new Date(aktuellerTermin.datum).toLocaleDateString("de-DE")} um ${aktuellerTermin.uhrzeit} wurde abgesagt. Dein Wartelisten-Eintrag wurde entfernt.`,
            mitgliedId: warte.mitgliedId,
          },
        })
      }

      // Warteliste leeren
      await prisma.wartelistenEintrag.deleteMany({ where: { terminId: params.id } })

      // Admin-Benachrichtigung
      await prisma.benachrichtigung.create({
        data: {
          typ: "info",
          titel: "Kurs abgesagt – automatische Stornierung durchgeführt",
          inhalt: `${aktuellerTermin.kurs.name} am ${new Date(aktuellerTermin.datum).toLocaleDateString("de-DE")} um ${aktuellerTermin.uhrzeit}: ${aktuellerTermin.buchungen.length} Buchungen storniert, ${aktuellerTermin.wartelisten.length} Wartelisteneinträge entfernt.`,
          empfaengerRolle: "Admin",
        },
      })
    }
  }

  const termin = await prisma.kurstermin.update({
    where: { id: params.id }, data: updateData,
    include: {
      kurs: true, raum: true, trainer: true,
      _count: { select: { buchungen: true } },
    },
  })
  return NextResponse.json(termin)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.kurstermin.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
