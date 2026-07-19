import { prisma } from "@/lib/prisma"
import { TerminVerwaltung } from "./TerminVerwaltung"

export default async function KursterminePage({
  searchParams,
}: {
  searchParams: Promise<{ ansicht?: string }>
}) {
  const sp = await searchParams
  const ansicht = sp.ansicht || ""

  const [termine, kurse, raeume, trainer] = await Promise.all([
    prisma.kurstermin.findMany({ include: { kurs: true, raum: true, trainer: true, _count: { select: { buchungen: true } } }, orderBy: [{ datum: "asc" }, { uhrzeit: "asc" }] }),
    prisma.kurs.findMany({ orderBy: { name: "asc" } }),
    prisma.raum.findMany({ orderBy: { name: "asc" } }),
    prisma.trainer.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Kurstermine</h2>
        {ansicht === "kalender" && (
          <a href="/admin/kurstermine" className="text-sm text-[#76B900] hover:underline">
            Tabellen-Ansicht →
          </a>
        )}
      </div>
      <TerminVerwaltung
        termine={JSON.parse(JSON.stringify(termine))}
        kurse={JSON.parse(JSON.stringify(kurse))}
        raeume={JSON.parse(JSON.stringify(raeume))}
        trainer={JSON.parse(JSON.stringify(trainer))}
        kalenderAnsicht={ansicht === "kalender"}
      />
    </div>
  )
}
