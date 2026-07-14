import { auth, hatBerechtigung } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BuchungsVerwaltung } from "./BuchungsVerwaltung"

export default async function RezeptionBuchungenPage() {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Rezeption")) redirect("/login")

  const [buchungen, mitglieder, termine] = await Promise.all([
    prisma.buchung.findMany({
      include: { mitglied: { select: { vorname: true, nachname: true } }, termin: { include: { kurs: true, raum: true, trainer: true } } },
      orderBy: { buchungszeitpunkt: "desc" },
      take: 50,
    }),
    prisma.mitglied.findMany({ orderBy: { nachname: "asc" }, select: { id: true, vorname: true, nachname: true } }),
    prisma.kurstermin.findMany({
      where: { datum: { gte: new Date() }, status: { not: "abgesagt" } },
      include: { kurs: true }, orderBy: [{ datum: "asc" }, { uhrzeit: "asc" }], take: 20,
    }),
  ])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Buchungen verwalten</h2>
      <BuchungsVerwaltung
        buchungen={JSON.parse(JSON.stringify(buchungen))}
        mitglieder={JSON.parse(JSON.stringify(mitglieder))}
        termine={JSON.parse(JSON.stringify(termine))}
      />
    </div>
  )
}
