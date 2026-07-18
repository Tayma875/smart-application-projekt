import { prisma } from "@/lib/prisma"
import { BuchungsVerwaltung } from "./BuchungsVerwaltung"

export default async function RezeptionBuchungenPage() {
  const [mitglieder, termine] = await Promise.all([
    prisma.mitglied.findMany({ orderBy: { nachname: "asc" }, select: { id: true, vorname: true, nachname: true } }),
    prisma.kurstermin.findMany({
      where: { datum: { gte: new Date() }, status: { not: "abgesagt" } },
      include: { kurs: true, trainer: true }, orderBy: [{ datum: "asc" }, { uhrzeit: "asc" }], take: 20,
    }),
  ])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Buchungen verwalten</h2>
      <BuchungsVerwaltung
        mitglieder={JSON.parse(JSON.stringify(mitglieder))}
        termine={JSON.parse(JSON.stringify(termine))}
      />
    </div>
  )
}
