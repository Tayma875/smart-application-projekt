import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seed: Buchungen für alle Termine...\n")

  const mitglieder = await prisma.mitglied.findMany({ where: { status: "aktiv" } })
  const termine = await prisma.kurstermin.findMany({
    where: { status: { in: ["findet_statt", "stattgefunden"] } },
    include: { kurs: true, raum: true, _count: { select: { buchungen: true } } },
  })

  if (mitglieder.length === 0 || termine.length === 0) {
    console.log("❌ Keine Mitglieder oder Termine – bitte erst `npm run db:seed` + `npm run db:seed-termine`")
    process.exit(1)
  }

  let buchungenCount = 0
  let newBuchungen = 0

  for (const termin of termine) {
    const kapazitaet = Math.min(termin.kurs.maxTeilnehmer, termin.raum.kapazitaet)
    const bereitsGebucht = termin._count.buchungen
    const freiePlaetze = kapazitaet - bereitsGebucht

    if (freiePlaetze <= 0) continue

    // 40-90% der freien Plätze buchen
    const buchungenHeute = Math.min(
      freiePlaetze,
      Math.max(1, Math.floor(freiePlaetze * (0.4 + Math.random() * 0.5)))
    )

    // Zufällige Mitglieder auswählen
    const verfuegbar = [...mitglieder].sort(() => Math.random() - 0.5).slice(0, buchungenHeute)

    for (const mitglied of verfuegbar) {
      // Prüfen ob schon gebucht
      const existiert = await prisma.buchung.findUnique({
        where: { mitgliedId_terminId: { mitgliedId: mitglied.id, terminId: termin.id } },
      })
      if (existiert) continue

      const istVergangen = termin.status === "stattgefunden"
      const statusRand = Math.random()

      let teilnahmeStatus: string
      if (istVergangen) {
        teilnahmeStatus = statusRand < 0.75 ? "teilgenommen" : statusRand < 0.9 ? "no_show" : "storniert"
      } else {
        teilnahmeStatus = statusRand < 0.85 ? "angemeldet" : "storniert"
      }

      await prisma.buchung.create({
        data: {
          mitgliedId: mitglied.id,
          terminId: termin.id,
          buchungszeitpunkt: new Date(Date.now() - Math.floor(Math.random() * 14 * 86400000)),
          teilnahmeStatus,
          stornozeitpunkt: teilnahmeStatus === "storniert" ? new Date(Date.now() - 3600000) : undefined,
        },
      })
      newBuchungen++
    }
    buchungenCount += buchungenHeute
  }

  console.log(`  ✓ ${newBuchungen} neue Buchungen erstellt`)
  console.log(`\n✅ Fertig! Buchungen verteilt.`)
}

main()
  .catch((e) => {
    console.error("❌ Seed fehlgeschlagen:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
