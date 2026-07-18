-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aktion" TEXT NOT NULL,
    "adminId" TEXT,
    "adminEmail" TEXT,
    "details" TEXT,
    "entityId" TEXT,
    "entityTyp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
