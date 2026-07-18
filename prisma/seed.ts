import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Vorhandene Daten in richtiger Reihenfolge löschen
  await prisma.auditLog.deleteMany({});
  await prisma.benachrichtigung.deleteMany({});
  await prisma.advancedFreigabe.deleteMany({});
  await prisma.wartelistenEintrag.deleteMany({});
  await prisma.buchung.deleteMany({});
  await prisma.mitgliedsHistorie.deleteMany({});
  await prisma.mitglied.deleteMany({});
  await prisma.kurstermin.deleteMany({});
  await prisma.trainerKurs.deleteMany({});
  await prisma.trainer.deleteMany({});
  await prisma.raum.deleteMany({});
  await prisma.kurs.deleteMany({});
  await prisma.tarif.deleteMany({});
  await prisma.onlineContent.deleteMany({});
  await prisma.account.deleteMany({});
  console.log("🌱 Starte Seed...\n");

  // ── Tarife ──────────────────────────────────────────────
  const basic = await prisma.tarif.upsert({
    where: { name: "Basic" },
    update: {
      onlineBerechtigung: "videos", // Beschluss 2026-07-17: Basic nur On-Demand-Videos
    },
    create: {
      name: "Basic",
      monatspreis: 29.99,
      laufzeit: "monatlich_kuendbar",
      buchungslimit: 5,
      onlineBerechtigung: "videos",
      stornoRegel: "50% Gebühr bei Storno unter 2h vor Kursbeginn",
    },
  });
  console.log("  ✓ Basic-Tarif (29,99 €, 5 Buchungen/Monat, On-Demand-Videos)");

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
  console.log("  ✓ Plus-Tarif (49,99 €, unbegrenzt, Videos + Live-Streams)");

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
  console.log("  ✓ Premium-Tarif (79,99 €, Jahresvertrag, alles unbegrenzt)");

  // ── Räume ──────────────────────────────────────────────
  const grosserRaum = await prisma.raum.upsert({
    where: { name: "Großer Kursraum" },
    update: {},
    create: { name: "Großer Kursraum", kapazitaet: 30, raumtyp: "Kursraum" },
  });
  await prisma.raum.upsert({
    where: { name: "Kleiner Kursraum" },
    update: {},
    create: { name: "Kleiner Kursraum", kapazitaet: 15, raumtyp: "Kursraum" },
  });
  await prisma.raum.upsert({
    where: { name: "Spinning-Raum" },
    update: {},
    create: { name: "Spinning-Raum", kapazitaet: 20, raumtyp: "Spinning-Raum" },
  });
  console.log("  ✓ 3 Räume angelegt");

  // ── Kurse ──────────────────────────────────────────────
  // Bestehende Kurse zuerst löschen (wegen ID-Konflikt beim Upsert mit custom ID)
  // Wir nutzen upsert ohne custom IDs
  const yoga = await prisma.kurs.create({
    data: {
      name: "Yoga",
      beschreibung: "Entspannendes Yoga für alle Level – Atemübungen, Dehnung und Meditation.",
      level: "anfaenger",
      kategorie: "Yoga",
      dauer: 60,
      maxTeilnehmer: 20,
    },
  });

  const hiit = await prisma.kurs.create({
    data: {
      name: "HIIT",
      beschreibung: "Hochintensives Intervalltraining für maximale Fettverbrennung.",
      level: "mittel",
      kategorie: "HIIT",
      dauer: 45,
      maxTeilnehmer: 15,
    },
  });

  const spinning = await prisma.kurs.create({
    data: {
      name: "Spinning",
      beschreibung: "Intensives Radtraining zu motivierender Musik.",
      level: "mittel",
      kategorie: "Spinning",
      dauer: 50,
      maxTeilnehmer: 18,
    },
  });

  const functional = await prisma.kurs.create({
    data: {
      name: "Functional Training",
      beschreibung: "Ganzkörpertraining mit Fokus auf Kraft, Koordination und Beweglichkeit.",
      level: "fortgeschritten",
      kategorie: "Functional Training",
      dauer: 60,
      maxTeilnehmer: 12,
    },
  });
  console.log("  ✓ 4 Kurse angelegt");

  // ── Accounts ────────────────────────────────────────────
  const adminAccount = await prisma.account.create({
    data: {
      email: "lisa@smart-fitness.de",
      password: await bcrypt.hash("admin123", 10), //在生产中应使用哈希密码
      rolle: "Admin",
    },
  });
  console.log("  ✓ Admin-Account (lisa@smart-fitness.de)");

  const rezeptionAccount = await prisma.account.create({
    data: {
      email: "rezeption@smart-fitness.de",
      password: await bcrypt.hash("rezeption123", 10),
      rolle: "Rezeption",
    },
  });
  console.log("  ✓ Rezeption-Account (rezeption@smart-fitness.de)");

  const trainerAccount = await prisma.account.create({
    data: {
      email: "trainer@smart-fitness.de",
      password: await bcrypt.hash("trainer123", 10),
      rolle: "Trainer",
    },
  });
  const trainerAccount2 = await prisma.account.create({
    data: {
      email: "tom@smart-fitness.de",
      password: await bcrypt.hash("trainer123", 10),
      rolle: "Trainer",
    },
  });
  console.log("  ✓ Trainer-Accounts");

  const mitgliedAccount = await prisma.account.create({
    data: {
      email: "max@example.com",
      password: await bcrypt.hash("mitglied123", 10),
      rolle: "Mitglied",
    },
  });
  const mitgliedAccount2 = await prisma.account.create({
    data: {
      email: "anna@example.com",
      password: await bcrypt.hash("mitglied123", 10),
      rolle: "Mitglied",
    },
  });
  console.log("  ✓ Mitglieder-Accounts");

  // ── Trainer ─────────────────────────────────────────────
  const trainer = await prisma.trainer.create({
    data: {
      accountId: trainerAccount.id,
      name: "Marie",
      spezialisierung: "Yoga, Pilates",
      beschaeftigungsart: "fest_angestellt",
    },
  });

  const honorarTrainer = await prisma.trainer.create({
    data: {
      accountId: trainerAccount2.id,
      name: "Tom",
      spezialisierung: "HIIT, Spinning",
      beschaeftigungsart: "honorarbasis",
    },
  });
  console.log("  ✓ 2 Trainer (Marie fest angestellt, Tom Honorarbasis)");

  // ── Trainer-Kurs-Qualifikationen ────────────────────────
  await prisma.trainerKurs.createMany({
    data: [
      { trainerId: trainer.id, kursId: yoga.id },
      { trainerId: trainer.id, kursId: functional.id },
      { trainerId: honorarTrainer.id, kursId: hiit.id },
      { trainerId: honorarTrainer.id, kursId: spinning.id },
    ],
  });
  console.log("  ✓ Trainer-Qualifikationen zugewiesen");

  // ── Mitglieder ──────────────────────────────────────────
  const mitgliedMax = await prisma.mitglied.create({
    data: {
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

  const mitgliedAnna = await prisma.mitglied.create({
    data: {
      accountId: mitgliedAccount2.id,
      tarifId: premium.id,
      vorname: "Anna",
      nachname: "Schmidt",
      email: "anna@example.com",
      telefon: "01769876543",
      geburtsdatum: new Date("1988-12-03"),
      status: "aktiv",
      zahlungsstatus: "ok",
    },
  });

  await prisma.mitglied.create({
    data: {
      tarifId: plus.id,
      vorname: "Julia",
      nachname: "Becker",
      email: "julia@example.com",
      telefon: "01765554433",
      geburtsdatum: new Date("1995-08-22"),
      status: "aktiv",
      zahlungsstatus: "ok",
    },
  });
  console.log("  ✓ 3 Mitglieder (Max – Basic, Anna – Premium, Julia – Plus)");

  // ── Kurstermine ─────────────────────────────────────────
  const heute = new Date();
  const heuteStr = heute.toISOString().split("T")[0];
  const morgen = new Date(heute);
  morgen.setDate(morgen.getDate() + 1);
  const morgenStr = morgen.toISOString().split("T")[0];
  const uebermorgen = new Date(heute);
  uebermorgen.setDate(uebermorgen.getDate() + 2);
  const uebermorgenStr = uebermorgen.toISOString().split("T")[0];

  const termin1 = await prisma.kurstermin.create({
    data: {
      kursId: yoga.id,
      raumId: grosserRaum.id,
      trainerId: trainer.id,
      datum: new Date(heuteStr),
      uhrzeit: "09:00",
      status: "findet_statt",
    },
  });

  const termin2 = await prisma.kurstermin.create({
    data: {
      kursId: hiit.id,
      raumId: grosserRaum.id,
      trainerId: honorarTrainer.id,
      datum: new Date(heuteStr),
      uhrzeit: "10:00",
      status: "findet_statt",
    },
  });

  const termin3 = await prisma.kurstermin.create({
    data: {
      kursId: spinning.id,
      raumId: grosserRaum.id,
      trainerId: honorarTrainer.id,
      datum: new Date(morgenStr),
      uhrzeit: "17:00",
      status: "findet_statt",
    },
  });

  const termin4 = await prisma.kurstermin.create({
    data: {
      kursId: functional.id,
      raumId: grosserRaum.id,
      trainerId: trainer.id,
      datum: new Date(uebermorgenStr),
      uhrzeit: "08:00",
      status: "findet_statt",
    },
  });

  await prisma.kurstermin.create({
    data: {
      kursId: yoga.id,
      raumId: grosserRaum.id,
      trainerId: trainer.id,
      datum: new Date(uebermorgenStr),
      uhrzeit: "18:30",
      status: "findet_statt",
    },
  });
  console.log("  ✓ 5 Kurstermine (heute–übermorgen)");

  // ── Buchungen ───────────────────────────────────────────
  await prisma.buchung.createMany({
    data: [
      {
        mitgliedId: mitgliedMax.id,
        terminId: termin1.id,
        buchungszeitpunkt: new Date(Date.now() - 86400000), // gestern gebucht
        teilnahmeStatus: "angemeldet",
      },
      {
        mitgliedId: mitgliedAnna.id,
        terminId: termin1.id,
        buchungszeitpunkt: new Date(Date.now() - 7200000), // 2h her
        teilnahmeStatus: "angemeldet",
      },
      {
        mitgliedId: mitgliedAnna.id,
        terminId: termin3.id,
        buchungszeitpunkt: new Date(Date.now() - 86400000),
        teilnahmeStatus: "angemeldet",
      },
      {
        mitgliedId: mitgliedMax.id,
        terminId: termin2.id,
        buchungszeitpunkt: new Date(Date.now() - 172800000),
        teilnahmeStatus: "angemeldet",
      },
    ],
  });
  console.log("  ✓ 4 Buchungen");

  // ── Online-Content ──────────────────────────────────────
  await prisma.onlineContent.createMany({
    data: [
      {
        titel: "Yoga für Anfänger – Morgenroutine",
        beschreibung: "Sanfte 20-minütige Yoga-Einheit für den perfekten Start in den Tag.",
        kategorie: "on_demand_video",
        videoUrl: "https://example.com/videos/yoga-morgenroutine",
        kursId: yoga.id,
        dauer: 20,
        tarifVoraussetzung: "basic",
      },
      {
        titel: "HIIT Power Workout – Live",
        beschreibung: "Live-Stream: 45 Minuten High Intensity Intervall Training.",
        kategorie: "live_stream",
        videoUrl: "https://example.com/live/hiit-power",
        kursId: hiit.id,
        dauer: 45,
        tarifVoraussetzung: "plus",
      },
      {
        titel: "Spinning Ausdauer-Challenge",
        beschreibung: "Aufgezeichnetes Spinning-Workout für zu Hause.",
        kategorie: "on_demand_video",
        videoUrl: "https://example.com/videos/spinning-ausdauer",
        kursId: spinning.id,
        dauer: 50,
        tarifVoraussetzung: "basic",
      },
      {
        titel: "Functional Training Advanced",
        beschreibung: "Fortgeschrittenes Functional Training als Live-Stream.",
        kategorie: "live_stream",
        videoUrl: "https://example.com/live/functional-advanced",
        kursId: functional.id,
        dauer: 60,
        tarifVoraussetzung: "premium",
      },
    ],
  });
  console.log("  ✓ 4 Online-Content-Einträge");

  // ── Benachrichtigungen (Demo) ───────────────────────────
  await prisma.benachrichtigung.create({
    data: {
      typ: "info",
      titel: "Seed abgeschlossen",
      inhalt: "Die Datenbank wurde erfolgreich mit Demodaten befüllt.",
      empfaengerRolle: "admin",
    },
  });
  console.log("  ✓ Demo-Benachrichtigung");

  // ── Historie (Demo) ─────────────────────────────────────
  await prisma.mitgliedsHistorie.create({
    data: {
      mitgliedId: mitgliedMax.id,
      tarifId: basic.id,
      startdatum: new Date("2026-01-01"),
      bemerkung: "Initialer Tarif bei Mitgliedsbeginn",
    },
  });
  await prisma.mitgliedsHistorie.create({
    data: {
      mitgliedId: mitgliedAnna.id,
      tarifId: premium.id,
      startdatum: new Date("2026-03-01"),
      bemerkung: "Premium-Tarif bei Mitgliedsbeginn",
    },
  });
  console.log("  ✓ 2 Historieneinträge");

  console.log("\n✅ Seed erfolgreich abgeschlossen!");
  console.log("   ───────────────────────────────────────");
  console.log("   Login         | Rolle      | Passwort");
  console.log("   ───────────────────────────────────────");
  console.log("   lisa@smart-fitness.de | Admin      | admin123");
  console.log("   rezeption@smart-fitness.de | Rezeption  | rezeption123");
  console.log("   trainer@smart-fitness.de  | Trainer    | trainer123");
  console.log("   tom@smart-fitness.de     | Trainer    | trainer123");
  console.log("   max@example.com          | Mitglied   | mitglied123");
  console.log("   anna@example.com         | Mitglied   | mitglied123");
  console.log("   ───────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed fehlgeschlagen:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
