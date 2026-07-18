import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BuchungenListe } from "./BuchungenListe"
import { MitgliedKalender } from "./MitgliedKalender"

export default async function MeineBuchungenPage() {
  const session = await auth()
  const mitglied = await prisma.mitglied.findFirst({
    where: { accountId: session?.user?.userId },
    include: {
      buchungen: {
        include: { termin: { include: { kurs: true, raum: true, trainer: true } } },
        orderBy: { buchungszeitpunkt: "desc" },
      },
    },
  })
  if (!mitglied) return <p className="p-6">Kein Mitglied gefunden</p>

  const buchungen = JSON.parse(JSON.stringify(mitglied.buchungen))

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Meine Buchungen</h2>
      <p className="text-sm text-gray-500 mb-6">{buchungen.length} Buchungen</p>

      {/* Kalender-Kachel */}
      <details className="mb-6 group" open>
        <summary className="cursor-pointer bg-white border border-[#E2E8F0] rounded-xl p-4 hover:shadow-md transition-shadow list-none flex items-center justify-between">
          <h3 className="font-semibold text-[#0F172A]">📅 Kalender-Ansicht</h3>
          <span className="text-xs text-gray-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="bg-white border border-t-0 border-[#E2E8F0] rounded-b-xl p-4">
          <MitgliedKalender buchungen={buchungen} />
        </div>
      </details>

      {/* Listen-Kachel */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
        <BuchungenListe buchungen={buchungen} />
      </div>
    </div>
  )
}
