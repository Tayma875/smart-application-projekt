-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rolle" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Mitglied" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT,
    "tarifId" TEXT NOT NULL,
    "vorname" TEXT NOT NULL,
    "nachname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefon" TEXT,
    "geburtsdatum" DATETIME,
    "status" TEXT NOT NULL,
    "zahlungsstatus" TEXT NOT NULL DEFAULT 'ok',
    "startdatum" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fotoUrl" TEXT,
    "noShowZaehler" INTEGER NOT NULL DEFAULT 0,
    "gesperrtBis" DATETIME,
    "pausiertBis" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Mitglied_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Mitglied_tarifId_fkey" FOREIGN KEY ("tarifId") REFERENCES "Tarif" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MitgliedsHistorie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mitgliedId" TEXT NOT NULL,
    "tarifId" TEXT NOT NULL,
    "startdatum" DATETIME NOT NULL,
    "enddatum" DATETIME,
    "bemerkung" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MitgliedsHistorie_mitgliedId_fkey" FOREIGN KEY ("mitgliedId") REFERENCES "Mitglied" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tarif" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "monatspreis" REAL NOT NULL,
    "laufzeit" TEXT NOT NULL,
    "buchungslimit" INTEGER,
    "onlineBerechtigung" TEXT NOT NULL,
    "stornoRegel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Kurs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "beschreibung" TEXT,
    "level" TEXT NOT NULL,
    "kategorie" TEXT NOT NULL,
    "dauer" INTEGER NOT NULL,
    "maxTeilnehmer" INTEGER NOT NULL,
    "voraussetzungId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Kurstermin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kursId" TEXT NOT NULL,
    "raumId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "datum" DATETIME NOT NULL,
    "uhrzeit" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'findet_statt',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Kurstermin_kursId_fkey" FOREIGN KEY ("kursId") REFERENCES "Kurs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Kurstermin_raumId_fkey" FOREIGN KEY ("raumId") REFERENCES "Raum" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Kurstermin_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trainer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT,
    "name" TEXT NOT NULL,
    "spezialisierung" TEXT,
    "beschaeftigungsart" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trainer_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainerKurs" (
    "trainerId" TEXT NOT NULL,
    "kursId" TEXT NOT NULL,

    PRIMARY KEY ("trainerId", "kursId"),
    CONSTRAINT "TrainerKurs_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainerKurs_kursId_fkey" FOREIGN KEY ("kursId") REFERENCES "Kurs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Raum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "kapazitaet" INTEGER NOT NULL,
    "raumtyp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Buchung" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mitgliedId" TEXT NOT NULL,
    "terminId" TEXT NOT NULL,
    "buchungszeitpunkt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teilnahmeStatus" TEXT NOT NULL DEFAULT 'angemeldet',
    "stornozeitpunkt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Buchung_mitgliedId_fkey" FOREIGN KEY ("mitgliedId") REFERENCES "Mitglied" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Buchung_terminId_fkey" FOREIGN KEY ("terminId") REFERENCES "Kurstermin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WartelistenEintrag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mitgliedId" TEXT NOT NULL,
    "terminId" TEXT NOT NULL,
    "reihenfolge" INTEGER NOT NULL,
    "eintragungszeitpunkt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WartelistenEintrag_mitgliedId_fkey" FOREIGN KEY ("mitgliedId") REFERENCES "Mitglied" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WartelistenEintrag_terminId_fkey" FOREIGN KEY ("terminId") REFERENCES "Kurstermin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OnlineContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titel" TEXT NOT NULL,
    "beschreibung" TEXT,
    "kategorie" TEXT NOT NULL,
    "videoUrl" TEXT,
    "kursId" TEXT,
    "dauer" INTEGER,
    "tarifVoraussetzung" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OnlineContent_kursId_fkey" FOREIGN KEY ("kursId") REFERENCES "Kurs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdvancedFreigabe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mitgliedId" TEXT NOT NULL,
    "kategorie" TEXT NOT NULL,
    "erteiltVon" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdvancedFreigabe_mitgliedId_fkey" FOREIGN KEY ("mitgliedId") REFERENCES "Mitglied" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Benachrichtigung" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "typ" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "inhalt" TEXT,
    "empfaengerRolle" TEXT,
    "mitgliedId" TEXT,
    "terminId" TEXT,
    "gelesen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mitglied_accountId_key" ON "Mitglied"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Mitglied_email_key" ON "Mitglied"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tarif_name_key" ON "Tarif"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_accountId_key" ON "Trainer"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Raum_name_key" ON "Raum"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Buchung_mitgliedId_terminId_key" ON "Buchung"("mitgliedId", "terminId");

-- CreateIndex
CREATE UNIQUE INDEX "WartelistenEintrag_mitgliedId_terminId_key" ON "WartelistenEintrag"("mitgliedId", "terminId");

-- CreateIndex
CREATE UNIQUE INDEX "AdvancedFreigabe_mitgliedId_kategorie_key" ON "AdvancedFreigabe"("mitgliedId", "kategorie");
