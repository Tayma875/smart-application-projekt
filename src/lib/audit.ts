import { prisma } from "./prisma"
import { auth } from "./auth"

export async function logAudit(
  aktion: string,
  details: string,
  entityId?: string,
  entityTyp?: string
) {
  try {
    const session = await auth()
    const adminId = session?.user?.userId
    const adminEmail = session?.user?.email

    await prisma.auditLog.create({
      data: {
        aktion,
        adminId,
        adminEmail: adminEmail || null,
        details,
        entityId: entityId || null,
        entityTyp: entityTyp || null,
      },
    })
  } catch (error) {
    // Audit-Log soll nie die Hauptaktion blockieren
    console.error("Audit-Log Fehler:", error)
  }
}
