import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const VORNAMEN = [
  "Jonas", "Mia", "Lukas", "Emma", "Finn", "Sophie", "Leon", "Hannah",
  "Paul", "Lina", "Felix", "Lea", "Maximilian", "Leni", "Elias", "Lara",
  "Noah", "Amelie", "Ben", "Lilly", "Luis", "Maja", "Henry", "Frieda",
  "Oskar", "Nele", "Moritz", "Luisa", "Niklas", "Clara", "Julian", "Marie",
  "Timo", "Greta", "David", "Ida", "Tom", "Ella", "Nils", "Sofia",
  "Jakob", "Marlene", "Jannik", "Romy", "Matteo", "Alma", "Milan", "Lotta",
  "Henryk", "Anni"
]

const NACHNAMEN = [
  "Schmidt", "Weber", "Wagner", "Becker", "Schäfer", "Koch", "Bauer",
  "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Schwarz", "Zimmermann",
  "Braun", "Krüger", "Hoffmann", "Schmitz", "Lange", "Jung", "König",
  "Meyer", "Peters", "Lang", "Scholz", "Seidel", "Vogel", "Keller",
]

interface TerminInfo { id: string; kursId: string; kursName: string }

async function main() {
  console.log("🌱 Seed: 50 Mitglieder mit Buchungen...\n")

  // Referenzdaten laden
  const tarife = await prisma.tarif.findMany()
  const basic = tarife.find(t => t.name === "Basic")!
  const plus = tarife.find(t => t.name === "Plus")!
  const premium = tarife.find(t => t.name === "Premium")!

  const termine = await prisma.kurstermin.findMany({
    include: { kurs: { select: { name: true } } }
  })
  const alleTermine: TerminInfo[] = termine.map(t => ({
    id: t.id,
    kursId: t.kursId,
    kursName: t.kurs.name,
  }))

  if (alleTermine.length === 0) {
    console.log("❌ Keine Kurstermine gefunden – bitte zuerst `npm run db:seed` ausführen")
    process.exit(1)
  }

  // 50 Mitglieder erstellen + Buchungen
  for (let i = 0; i < VORNAMEN.length; i++) {
    const vorname = VORNAMEN[i]
    const nachname = NACHNAMEN[i % NACHNAMEN.length]
    const email = `${vorname.toLowerCase()}.${nachname.toLowerCase()}${i > 0 ? i : ""}@example.com`

    // Tarif verteilen: ~30% Basic, ~40% Plus, ~30% Premium
    const tarifRand = Math.random()
    const tarif = tarifRand < 0.3 ? basic : tarifRand < 0.7 ? plus : premium

    const account = await prisma.account.create({
      data: {
        email,
        password: await bcrypt.hash("mitglied123", 10),
        rolle: "Mitglied",
      },
    })

    // Zufälliges Geburtsdatum (18–70 Jahre)
    const jahr = new Date().getFullYear() - 18 - Math.floor(Math.random() * 52)
    const monat = Math.floor(Math.random() * 12)
    const tag = Math.floor(Math.random() * 28) + 1

    const mitglied = await prisma.mitglied.create({
      data: {
        accountId: account.id,
        tarifId: tarif.id,
        vorname,
        nachname,
        email,
        telefon: `+49${String(170 + Math.floor(Math.random() * 100)).slice(0, 11)}`,
        geburtsdatum: new Date(jahr, monat, tag),
        status: Math.random() < 0.85 ? "aktiv" : Math.random() < 0.5 ? "pausiert" : "zahlung_ausstehend",
        startdatum: new Date(Date.now() - Math.floor(Math.random() * 365 * 86400000)),
      },
    })

    await prisma.mitgliedsHistorie.create({
      data: {
        mitgliedId: mitglied.id,
        tarifId: tarif.id,
        startdatum: mitglied.startdatum,
        bemerkung: "Initialer Tarif bei Mitgliedsbeginn",
      },
    })

    // 1–4 zufällige Buchungen pro Mitglied
    const buchungenAnzahl = 1 + Math.floor(Math.random() * 4)
    const gebuchteTermine = new Set<string>()

    for (let b = 0; b < buchungenAnzahl; b++) {
      const termin = alleTermine[Math.floor(Math.random() * alleTermine.length)]
      if (gebuchteTermine.has(termin.id)) continue
      gebuchteTermine.add(termin.id)

      const statusRand = Math.random()
      const teilnahmeStatus = statusRand < 0.7
        ? "angemeldet"
        : statusRand < 0.85
          ? "teilgenommen"
          : statusRand < 0.95
            ? "no_show"
            : "storniert"

      await prisma.buchung.create({
        data: {
          mitgliedId: mitglied.id,
          terminId: termin.id,
          buchungszeitpunkt: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)),
          teilnahmeStatus,
          stornozeitpunkt: teilnahmeStatus === "storniert" ? new Date(Date.now() - 3600000) : undefined,
        },
      })
    }
  }

  console.log("  ✓ 50 Mitglieder mit Buchungen erstellt")
  console.log("\n✅ Seed erfolgreich!")
  console.log("   Alle Mitglieder: <vorname>.<nachname>@example.com / mitglied123")
}

main()
  .catch((e) => {
    console.error("❌ Seed fehlgeschlagen:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
