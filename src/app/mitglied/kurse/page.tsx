import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { KursBuchen } from "./KursBuchen"

export default async function MitgliedKursePage() {
  const session = await auth()
  if (!session?.user || session.user.rolle !== "Mitglied") redirect("/login")

  const mitglied = await prisma.mitglied.findFirst({
    where: { accountId: session.user.userId },
    include: { tarif: true, buchungen: { include: { termin: { include: { kurs: true } } }, where: { teilnahmeStatus: { not: "storniert" } } } },
  })
  if (!mitglied) return <p>Kein Mitglied gefunden</p>

  const termine = await prisma.kurstermin.findMany({
    where: { datum: { gte: new Date() }, status: { not: "abgesagt" } },
    include: { kurs: true, raum: true, trainer: true, _count: { select: { buchungen: true } } },
    orderBy: [{ datum: "asc" }, { uhrzeit: "asc" }],
    take: 20,
  })

  const gebuchteTerminIds = new Set(mitglied.buchungen.map(b => b.terminId))

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Kurse buchen</h2>
      <KursBuchen
        termine={JSON.parse(JSON.stringify(termine))}
        mitgliedId={mitglied.id}
        gebuchteIds={Array.from(gebuchteTerminIds)}
      />
    </div>
  )
}
