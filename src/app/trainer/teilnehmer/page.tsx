import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AnwesenheitListe } from "./AnwesenheitListe"

export default async function TrainerTeilnehmerPage(props: { searchParams: Promise<{ terminId: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.rolle !== "Trainer") redirect("/login")
  const { terminId } = await props.searchParams

  const trainer = await prisma.trainer.findFirst({ where: { accountId: session.user.userId } })
  if (!trainer) return <p className="p-6">Kein Trainer-Profil gefunden</p>

  if (!terminId) {
    return <p className="p-6 text-gray-500">Bitte wähle einen Kurs aus deinem Kursplan.</p>
  }

  const termin = await prisma.kurstermin.findFirst({
    where: { id: terminId, trainerId: trainer.id },
    include: { kurs: true, raum: true },
  })
  if (!termin) return <p className="p-6 text-red-500">Termin nicht gefunden oder nicht dein Kurs.</p>

  const buchungen = await prisma.buchung.findMany({
    where: { terminId, teilnahmeStatus: { in: ["angemeldet", "teilgenommen", "no_show"] } },
    include: { mitglied: { select: { vorname: true, nachname: true } } },
    orderBy: { mitglied: { nachname: "asc" } },
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">{termin.kurs.name}</h2>
      <p className="text-sm text-gray-500 mb-6">{new Date(termin.datum).toLocaleDateString("de-DE")} um {termin.uhrzeit} · {termin.raum.name}</p>
      <AnwesenheitListe buchungen={JSON.parse(JSON.stringify(buchungen))} terminId={terminId} />
    </div>
  )
}
