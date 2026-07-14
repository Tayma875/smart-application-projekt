import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starte Seed...\n");

  // Tarife
  const basic = await prisma.tarif.upsert({
    where: { name: "Basic" },
    update: {},
    create: {
      name: "Basic",
      monatspreis: 29.99,
      laufzeit: "monatlich_kuendbar",
      buchungslimit: 5,
      onlineBerechtigung: "kein",
      stornoRegel: "50% Gebühr bei Storno unter 2h vor Kursbeginn",
    },
  });
  console.log("  ✓ Basic-Tarif angelegt");

  const plus = await prisma.tarif.upsert({
    where: { name: "Plus" },
    update: {},
    create: {
      name: "Plus",
      monatspreis: 49.99,
      laufzeit: "monatlich_kuendbar",
      buchungslimit: null,
      onlineBerechtigung: "videos_livestreams",
      stornoRegel: "50% Gebühr bei Storno unter 2h vor Kursbeginn",
    },
  });
  console.log("  ✓ Plus-Tarif angelegt");

  const premium = await prisma.tarif.upsert({
    where: { name: "Premium" },
    update: {},
    create: {
      name: "Premium",
      monatspreis: 79.99,
      laufzeit: "jahresvertrag",
      buchungslimit: null,
      onlineBerechtigung: "alles",
      stornoRegel: "Keine Gebühren, Premium-Ausnahme",
    },
  });
  console.log("  ✓ Premium-Tarif angelegt");

  // Räume
  const grosserRaum = await prisma.raum.upsert({
    where: { name: "Großer Kursraum" },
    update: {},
    create: { name: "Großer Kursraum", kapazitaet: 30, raumtyp: "Kursraum" },
  });
  const kleinerRaum = await prisma.raum.upsert({
    where: { name: "Kleiner Kursraum" },
    update: {},
    create: { name: "Kleiner Kursraum", kapazitaet: 15, raumtyp: "Kursraum" },
  });
  const spinningRaum = await prisma.raum.upsert({
    where: { name: "Spinning-Raum" },
    update: {},
    create: { name: "Spinning-Raum", kapazitaet: 20, raumtyp: "Spinning-Raum" },
  });
  console.log("  ✓ 3 Räume angelegt");

  // Kurse
  const yoga = await prisma.kurs.upsert({
    where: { id: "kurs-yoga" },
    update: {},
    create: {
      id: "kurs-yoga",
      name: "Yoga",
      beschreibung: "Entspannendes Yoga für alle Level",
      level: "anfaenger",
      kategorie: "Yoga",
      dauer: 60,
      maxTeilnehmer: 20,
    },
  });

  const hiit = await prisma.kurs.upsert({
    where: { id: "kurs-hiit" },
    update: {},
    create: {
      id: "kurs-hiit",
      name: "HIIT",
      beschreibung: "Hochintensives Intervalltraining",
      level: "mittel",
      kategorie: "HIIT",
      dauer: 45,
      maxTeilnehmer: 15,
    },
  });

  const spinning = await prisma.kurs.upsert({
    where: { id: "kurs-spinning" },
    update: {},
    create: {
      id: "kurs-spinning",
      name: "Spinning",
      beschreibung: "Intensives Radtraining",
      level: "mittel",
      kategorie: "Spinning",
      dauer: 50,
      maxTeilnehmer: 18,
    },
  });

  const functional = await prisma.kurs.upsert({
    where: { id: "kurs-functional" },
    update: {},
    create: {
      id: "kurs-functional",
      name: "Functional Training",
      beschreibung: "Ganzkörpertraining für Fortgeschrittene",
      level: "fortgeschritten",
      kategorie: "Functional Training",
      dauer: 60,
      maxTeilnehmer: 12,
    },
  });
  console.log("  ✓ 4 Kurse angelegt");

  // Accounts
  const adminAccount = await prisma.account.upsert({
    where: { email: "lisa@smart-fitness.de" },
    update: {},
    create: {
      email: "lisa@smart-fitness.de",
      password: "admin123", // TODO: in Produktion hashen
      rolle: "Admin",
    },
  });
  console.log("  ✓ Admin-Account (lisa@smart-fitness.de)");

  const rezeptionAccount = await prisma.account.upsert({
    where: { email: "rezeption@smart-fitness.de" },
    update: {},
    create: {
      email: "rezeption@smart-fitness.de",
      password: "rezeption123",
      rolle: "Rezeption",
    },
  });
  console.log("  ✓ Rezeption-Account");

  // Trainer
  const trainerAccount = await prisma.account.upsert({
    where: { email: "trainer@smart-fitness.de" },
    update: {},
    create: {
      email: "trainer@smart-fitness.de",
      password: "trainer123",
      rolle: "Trainer",
    },
  });

  const trainer = await prisma.trainer.upsert({
    where: { id: "trainer-marie" },
    update: {},
    create: {
      id: "trainer-marie",
      accountId: trainerAccount.id,
      name: "Marie",
      spezialisierung: "Yoga, Pilates",
      beschaeftigungsart: "fest_angestellt",
    },
  });

  const honorarTrainer = await prisma.trainer.upsert({
    where: { id: "trainer-tom" },
    update: {},
    create: {
      id: "trainer-tom",
      name: "Tom",
      spezialisierung: "HIIT, Spinning",
      beschaeftigungsart: "honorarbasis",
    },
  });
  console.log("  ✓ 2 Trainer angelegt");

  // Trainer-Kurs-Qualifikationen
  await prisma.trainerKurs.upsert({
    where: { trainerId_kursId: { trainerId: "trainer-marie", kursId: "kurs-yoga" } },
    update: {},
    create: { trainerId: "trainer-marie", kursId: "kurs-yoga" },
  });
  await prisma.trainerKurs.upsert({
    where: { trainerId_kursId: { trainerId: "trainer-tom", kursId: "kurs-hiit" } },
    update: {},
    create: { trainerId: "trainer-tom", kursId: "kurs-hiit" },
  });
  await prisma.trainerKurs.upsert({
    where: { trainerId_kursId: { trainerId: "trainer-tom", kursId: "kurs-spinning" } },
    update: {},
    create: { trainerId: "trainer-tom", kursId: "kurs-spinning" },
  });
  await prisma.trainerKurs.upsert({
    where: { trainerId_kursId: { trainerId: "trainer-marie", kursId: "kurs-functional" } },
    update: {},
    create: { trainerId: "trainer-marie", kursId: "kurs-functional" },
  });
  console.log("  ✓ Trainer-Kurs-Qualifikationen angelegt");

  // Beispiel-Mitglied
  const mitgliedAccount = await prisma.account.upsert({
    where: { email: "max@example.com" },
    update: {},
    create: {
      email: "max@example.com",
      password: "mitglied123",
      rolle: "Mitglied",
    },
  });

  await prisma.mitglied.upsert({
    where: { id: "mitglied-max" },
    update: {},
    create: {
      id: "mitglied-max",
      accountId: mitgliedAccount.id,
      tarifId: basic.id,
      vorname: "Max",
      nachname: "Mustermann",
      email: "max@example.com",
      telefon: "01761234567",
      geburtsdatum: new Date("1990-05-15"),
      status: "aktiv",
      zahlungsstatus: "ok",
    },
  });
  console.log("  ✓ Beispiel-Mitglied (max@example.com)");

  console.log("\n✅ Seed abgeschlossen!");
}

main()
  .catch((e) => {
    console.error("❌ Seed fehlgeschlagen:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
