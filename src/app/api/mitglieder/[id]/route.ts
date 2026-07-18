import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: { id: string } }) {

  const mitglied = await prisma.mitglied.findUnique({
    where: { id: params.id },
    include: { tarif: true, buchungen: { include: { termin: true } }, histories: { orderBy: { startdatum: "desc" } } },
  })
  if (!mitglied) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 })
  return NextResponse.json(mitglied)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {

  const data = await req.json()
  const mitglied = await prisma.mitglied.findUnique({ where: { id: params.id } })
  if (!mitglied) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 })

  const updateData: any = {}
  if (data.vorname) updateData.vorname = data.vorname
  if (data.nachname) updateData.nachname = data.nachname
  if (data.email) updateData.email = data.email
  if (data.telefon !== undefined) updateData.telefon = data.telefon
  if (data.zahlungsstatus) updateData.zahlungsstatus = data.zahlungsstatus
  if (data.geburtsdatum) updateData.geburtsdatum = new Date(data.geburtsdatum)
  if (data.gesperrtBis !== undefined) updateData.gesperrtBis = data.gesperrtBis
  if (data.noShowZaehler !== undefined) updateData.noShowZaehler = data.noShowZaehler

  // SMA-019: Pausieren mit 3-Monats-Prüfung pro Jahr
  if (data.status === "pausiert" && data.status !== mitglied.status) {
    const einJahrZurueck = new Date()
    einJahrZurueck.setFullYear(einJahrZurueck.getFullYear() - 1)

    const pausenzeiten = await prisma.mitgliedsHistorie.findMany({
      where: {
        mitgliedId: params.id,
        bemerkung: { contains: "Pause" },
        startdatum: { gte: einJahrZurueck },
      },
    })

    const gesamtPauseMonate = pausenzeiten.reduce((sum, h) => {
      if (h.enddatum) {
        const diffMonate = (h.enddatum.getTime() - h.startdatum.getTime()) / (1000 * 60 * 60 * 24 * 30)
        return sum + diffMonate
      }
      return sum
    }, 0)

    if (gesamtPauseMonate >= 3) {
      return NextResponse.json({ error: "Maximal 3 Monate Pause pro Jahr erlaubt" }, { status: 400 })
    }

    // Pause starten
    updateData.status = "pausiert"
    updateData.pausiertBis = data.pausiertBis ? new Date(data.pausiertBis) : null

    await prisma.mitgliedsHistorie.create({
      data: {
        mitgliedId: params.id,
        tarifId: mitglied.tarifId,
        startdatum: new Date(),
        bemerkung: `Pause ${data.pausiertBis ? `bis ${new Date(data.pausiertBis).toLocaleDateString("de-DE")}` : "gestartet"}`,
      },
    })
  } else if (data.status) {
    updateData.status = data.status
  }

  // Historie bei Statuswechsel
  if (data.status && data.status !== mitglied.status && data.status !== "pausiert") {
    await prisma.mitgliedsHistorie.create({
      data: { mitgliedId: params.id, tarifId: mitglied.tarifId, startdatum: new Date(), bemerkung: `Statusänderung: ${mitglied.status} → ${data.status}` },
    })
  }

  // Historie bei Tarifwechsel
  if (data.tarifId && data.tarifId !== mitglied.tarifId) {
    updateData.tarifId = data.tarifId
    await prisma.mitgliedsHistorie.updateMany({
      where: { mitgliedId: params.id, enddatum: null },
      data: { enddatum: new Date() },
    })
    await prisma.mitgliedsHistorie.create({
      data: { mitgliedId: params.id, tarifId: data.tarifId, startdatum: new Date(), bemerkung: `Tarifwechsel auf ${data.tarifId}` },
    })
  }

  // SMA-020: Warnung bei Zahlung ausstehend
  const neuerStatus = data.status || mitglied.status
  const neuerZahlungsstatus = data.zahlungsstatus || mitglied.zahlungsstatus
  if (neuerStatus === 'zahlung_ausstehend' || neuerZahlungsstatus === 'ausstehend') {
    if (mitglied.status !== 'zahlung_ausstehend' || mitglied.zahlungsstatus !== 'ausstehend') {
      const name = `${updateData.vorname || mitglied.vorname} ${updateData.nachname || mitglied.nachname}`
      await prisma.benachrichtigung.create({
        data: {
          typ: 'warnung',
          titel: 'Zahlung ausstehend',
          inhalt: `${name} hat Zahlung ausstehend`,
          empfaengerRolle: 'Admin',
        },
      })
    }
  }

  // Audit-Log für kritische Admin-Aktionen
  let auditDetails: string[] = []
  if (data.status && data.status !== mitglied.status) {
    auditDetails.push(`Status: ${mitglied.status} → ${data.status}`)
  }
  if (data.tarifId && data.tarifId !== mitglied.tarifId) {
    auditDetails.push(`Tarifwechsel`)
  }
  if (data.gesperrtBis !== undefined) {
    if (data.gesperrtBis === null) {
      auditDetails.push('Sperre manuell aufgehoben')
    } else {
      auditDetails.push(`Sperre gesetzt bis ${new Date(data.gesperrtBis).toLocaleDateString("de-DE")}`)
    }
  }
  if (data.noShowZaehler !== undefined && data.noShowZaehler !== mitglied.noShowZaehler) {
    auditDetails.push(`No-Show-Zähler: ${mitglied.noShowZaehler} → ${data.noShowZaehler}`)
  }
  if (auditDetails.length > 0) {
    await logAudit("mitglied_bearbeitet", `${mitglied.vorname} ${mitglied.nachname}: ${auditDetails.join(", ")}`, params.id, "Mitglied")
  }

  const updated = await prisma.mitglied.update({
    where: { id: params.id },
    data: updateData,
    include: { tarif: true, histories: { orderBy: { startdatum: "desc" } } },
  })
  return NextResponse.json(updated)
}
