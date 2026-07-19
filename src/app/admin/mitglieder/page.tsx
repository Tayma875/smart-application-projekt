import { MitgliederListe } from "./MitgliederListe"
import { prisma } from "@/lib/prisma"

export default async function MitgliederPage({
  searchParams,
}: {
  searchParams: Promise<{ vertrag?: string; zahlung?: string }>
}) {

  const sp = await searchParams
  const vertragFilter = sp.vertrag || ""
  const zahlungFilter = sp.zahlung || ""

  const mitglieder = await prisma.mitglied.findMany({
    include: { tarif: true },
    orderBy: { nachname: "asc" },
  })

  const tarife = await prisma.tarif.findMany({ orderBy: { monatspreis: "asc" } })

  // Vertragsstatus berechnen
  const jetzt = new Date()
  const in30Tagen = new Date(jetzt.getTime() + 30 * 24 * 60 * 60 * 1000)
  const vertragAbgelaufen = new Set<string>()
  const vertragAuslaufend = new Set<string>()

  for (const m of mitglieder) {
    if (!["aktiv", "pausiert", "gekuendigt"].includes(m.status)) continue
    const vertragEnde = new Date(m.startdatum)
    if (m.tarif.laufzeit === "jahresvertrag") {
      vertragEnde.setFullYear(vertragEnde.getFullYear() + 1)
      while (vertragEnde <= jetzt) {
        vertragEnde.setFullYear(vertragEnde.getFullYear() + 1)
      }
    }
    const diffTage = (vertragEnde.getTime() - jetzt.getTime()) / (1000 * 60 * 60 * 24)
    if (m.status === "gekuendigt" && diffTage <= 0) {
      vertragAbgelaufen.add(m.id)
    } else if (m.status === "gekuendigt") {
      vertragAuslaufend.add(m.id)
    } else if (diffTage <= 30 && diffTage > 0) {
      vertragAuslaufend.add(m.id)
    }
  }

  const serialized = JSON.parse(JSON.stringify(mitglieder))
  const abgelaufenIds = JSON.parse(JSON.stringify([...vertragAbgelaufen]))
  const auslaufendIds = JSON.parse(JSON.stringify([...vertragAuslaufend]))

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Mitgliederverwaltung</h2>
      <MitgliederListe
        mitglieder={serialized}
        tarife={JSON.parse(JSON.stringify(tarife))}
        vertragFilter={vertragFilter}
        vertragAbgelaufenIds={abgelaufenIds}
        vertragAuslaufendIds={auslaufendIds}
        zahlungFilter={zahlungFilter}
      />
    </div>
  )
}
