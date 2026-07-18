import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seed: Kurstermine für Admin-Ansicht...\n")

  const kurse = await prisma.kurs.findMany()
  const raeume = await prisma.raum.findMany()
  const trainer = await prisma.trainer.findMany()

  if (kurse.length === 0 || raeume.length === 0 || trainer.length === 0) {
    console.log("❌ Bitte zuerst `npm run db:seed` ausführen")
    process.exit(1)
  }

  // Bestehende Termine behalten, nur neue hinzufügen
  const yoga = kurse.find(k => k.name === "Yoga")!
  const hiit = kurse.find(k => k.name === "HIIT")!
  const spinning = kurse.find(k => k.name === "Spinning")!
  const functional = kurse.find(k => k.name === "Functional Training")!

  const grosserRaum = raeume.find(r => r.name === "Großer Kursraum")!
  const kleinerRaum = raeume.find(r => r.name === "Kleiner Kursraum")!
  const spinningRaum = raeume.find(r => r.name === "Spinning-Raum")!

  const trainerFest = trainer.find(t => t.beschaeftigungsart === "fest_angestellt")!
  const trainerHonorar = trainer.find(t => t.beschaeftigungsart === "honorarbasis")!

  const heute = new Date()
  let count = 0

  // 4 Wochen im Voraus: jeden Tag 2-4 Kurse
  for (let tag = 0; tag < 28; tag++) {
    const datum = new Date(heute)
    datum.setDate(datum.getDate() + tag)
    const wochentag = datum.getDay() // 0=Sonntag

    // Sonntags kein Kurs
    if (wochentag === 0) continue

    // Samstags reduzierte Kurse
    const istSamstag = wochentag === 6

    // Morgens: Yoga (09:00) + HIIT (10:00)
    if (tag !== 0 || !(await checkExists(yoga.id, grosserRaum.id, trainerFest.id, datum, "09:00"))) {
      await prisma.kurstermin.create({
        data: {
          kursId: yoga.id,
          raumId: grosserRaum.id,
          trainerId: trainerFest.id,
          datum,
          uhrzeit: "09:00",
          status: "findet_statt",
        },
      })
      count++
    }

    if (!istSamstag) {
      if (tag !== 0 || !(await checkExists(hiit.id, grosserRaum.id, trainerHonorar.id, datum, "10:00"))) {
        await prisma.kurstermin.create({
          data: {
            kursId: hiit.id,
            raumId: grosserRaum.id,
            trainerId: trainerHonorar.id,
            datum,
            uhrzeit: "10:00",
            status: "findet_statt",
          },
        })
        count++
      }

      // Mittags: Functional (12:00)
      if (tag !== 0 || !(await checkExists(functional.id, kleinerRaum.id, trainerFest.id, datum, "12:00"))) {
        await prisma.kurstermin.create({
          data: {
            kursId: functional.id,
            raumId: kleinerRaum.id,
            trainerId: trainerFest.id,
            datum,
            uhrzeit: "12:00",
            status: "findet_statt",
          },
        })
        count++
      }
    }

    // Nachmittags: Spinning (17:00) + Yoga (18:30)
    if (tag !== 0 || !(await checkExists(spinning.id, spinningRaum.id, trainerHonorar.id, datum, "17:00"))) {
      await prisma.kurstermin.create({
        data: {
          kursId: spinning.id,
          raumId: spinningRaum.id,
          trainerId: trainerHonorar.id,
          datum,
          uhrzeit: "17:00",
          status: "findet_statt",
        },
      })
      count++
    }

    if (!istSamstag) {
      if (tag !== 0 || !(await checkExists(yoga.id, grosserRaum.id, trainerFest.id, datum, "18:30"))) {
        await prisma.kurstermin.create({
          data: {
            kursId: yoga.id,
            raumId: grosserRaum.id,
            trainerId: trainerFest.id,
            datum,
            uhrzeit: "18:30",
            status: "findet_statt",
          },
        })
        count++
      }
    }
  }

  console.log(`  ✓ ${count} neue Kurstermine erstellt (28 Tage)`)

  // Ein paar vergangene Termine (für "stattgefunden")
  for (let tag = 1; tag <= 5; tag++) {
    const datum = new Date(heute)
    datum.setDate(datum.getDate() - tag)
    const wochentag = datum.getDay()
    if (wochentag === 0) continue

    await prisma.kurstermin.create({
      data: {
        kursId: yoga.id,
        raumId: grosserRaum.id,
        trainerId: trainerFest.id,
        datum,
        uhrzeit: "09:00",
        status: "stattgefunden",
      },
    })
    count++
  }

  console.log(`  ✓ +5 vergangene Termine (stattgefunden)`)
  console.log(`\n✅ ${count} Termine insgesamt erstellt`)
}

async function checkExists(kursId: string, raumId: string, trainerId: string, datum: Date, uhrzeit: string): Promise<boolean> {
  const existing = await prisma.kurstermin.findFirst({
    where: { kursId, raumId, trainerId, datum, uhrzeit },
  })
  return !!existing
}

main()
  .catch((e) => {
    console.error("❌ Seed fehlgeschlagen:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
