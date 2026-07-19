import { prisma } from "@/lib/prisma"
import { WartelisteUebersicht } from "./WartelisteUebersicht"

export default async function WartelistePage() {
  const eintraege = await prisma.wartelistenEintrag.findMany({
    include: {
      mitglied: { select: { vorname: true, nachname: true, email: true } },
      termin: {
        include: {
          kurs: true,
          raum: true,
          trainer: true,
        },
      },
    },
    orderBy: [{ termin: { datum: "asc" } }, { reihenfolge: "asc" }],
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Wartelisten-Übersicht</h2>
      <WartelisteUebersicht eintraege={JSON.parse(JSON.stringify(eintraege))} />
    </div>
  )
}
