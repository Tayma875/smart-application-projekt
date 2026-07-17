-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Buchung" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mitgliedId" TEXT NOT NULL,
    "terminId" TEXT NOT NULL,
    "buchungszeitpunkt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teilnahmeStatus" TEXT NOT NULL DEFAULT 'angemeldet',
    "stornozeitpunkt" DATETIME,
    "gebuehr" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Buchung_mitgliedId_fkey" FOREIGN KEY ("mitgliedId") REFERENCES "Mitglied" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Buchung_terminId_fkey" FOREIGN KEY ("terminId") REFERENCES "Kurstermin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Buchung" ("buchungszeitpunkt", "createdAt", "id", "mitgliedId", "stornozeitpunkt", "teilnahmeStatus", "terminId", "updatedAt") SELECT "buchungszeitpunkt", "createdAt", "id", "mitgliedId", "stornozeitpunkt", "teilnahmeStatus", "terminId", "updatedAt" FROM "Buchung";
DROP TABLE "Buchung";
ALTER TABLE "new_Buchung" RENAME TO "Buchung";
CREATE UNIQUE INDEX "Buchung_mitgliedId_terminId_key" ON "Buchung"("mitgliedId", "terminId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
