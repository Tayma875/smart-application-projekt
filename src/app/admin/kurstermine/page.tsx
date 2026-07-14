import { auth, hatBerechtigung } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TerminVerwaltung } from "./TerminVerwaltung"

export default async function KursterminePage() {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) redirect("/login")

  const [termine, kurse, raeume, trainer] = await Promise.all([
    prisma.kurstermin.findMany({ include: { kurs: true, raum: true, trainer: true, _count: { select: { buchungen: true } } }, orderBy: [{ datum: "asc" }, { uhrzeit: "asc" }] }),
    prisma.kurs.findMany({ orderBy: { name: "asc" } }),
    prisma.raum.findMany({ orderBy: { name: "asc" } }),
    prisma.trainer.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Kurstermine</h2>
      <TerminVerwaltung
        termine={JSON.parse(JSON.stringify(termine))}
        kurse={JSON.parse(JSON.stringify(kurse))}
        raeume={JSON.parse(JSON.stringify(raeume))}
        trainer={JSON.parse(JSON.stringify(trainer))}
      />
    </div>
  )
}
