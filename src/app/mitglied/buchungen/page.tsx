import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BuchungenListe } from "./BuchungenListe"

export default async function MeineBuchungenPage() {
  const session = await auth()
  if (!session?.user || session.user.rolle !== "Mitglied") redirect("/login")

  const mitglied = await prisma.mitglied.findFirst({
    where: { accountId: session.user.userId },
    include: {
      buchungen: {
        include: { termin: { include: { kurs: true, raum: true, trainer: true, kurstermin: true } } },
        orderBy: { buchungszeitpunkt: "desc" },
      },
    },
  })
  if (!mitglied) return <p className="p-6">Kein Mitglied gefunden</p>

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Meine Buchungen</h2>
      <BuchungenListe buchungen={JSON.parse(JSON.stringify(mitglied.buchungen))} />
    </div>
  )
}
