import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AnwesenheitListe } from "./AnwesenheitListe"
import Link from "next/link"

export default async function TrainerTeilnehmerPage(props: { searchParams: Promise<{ terminId: string }> }) {
  const session = await auth()
  const trainer = await prisma.trainer.findFirst({ where: { accountId: session?.user?.userId } })
  const { terminId } = await props.searchParams

  if (!trainer) return <p className="p-6">Kein Trainer-Profil gefunden</p>

  // Wenn kein Termin ausgewählt: alle Kurse des Trainers anzeigen
  if (!terminId) {
    const termine = await prisma.kurstermin.findMany({
      where: {
        trainerId: trainer.id,
        status: { in: ["findet_statt", "vertretung", "stattgefunden"] },
      },
      include: {
        kurs: true,
        raum: true,
        _count: { select: { buchungen: { where: { teilnahmeStatus: { not: "storniert" } } } } },
      },
      orderBy: [{ datum: "desc" }, { uhrzeit: "desc" }],
    })

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Meine Kurse – Teilnehmer anzeigen</h2>
        <div className="grid gap-3">
          {termine.map((t) => (
            <Link
              key={t.id}
              href={`/trainer/teilnehmer?terminId=${t.id}`}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-md hover:border-[#D4A853]/30 transition-all duration-300 flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-sm text-[#0F172A]">{t.kurs.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(t.datum).toLocaleDateString("de-DE")} um {t.uhrzeit} · {t.raum.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#D4A853]">{t._count.buchungen}</p>
                <p className="text-xs text-gray-400">Teilnehmer</p>
              </div>
            </Link>
          ))}
          {termine.length === 0 && (
            <p className="text-gray-400 text-center py-12">Keine Kurse gefunden</p>
          )}
        </div>
      </div>
    )
  }

  // Termin ausgewählt – Teilnehmer anzeigen
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
      <div className="mb-4">
        <Link href="/trainer/teilnehmer" className="text-xs text-[#D4A853] hover:underline">
          ← Zurück zur Kursauswahl
        </Link>
      </div>
      <h2 className="text-xl font-semibold mb-2">{termin.kurs.name}</h2>
      <p className="text-sm text-gray-500 mb-6">{new Date(termin.datum).toLocaleDateString("de-DE")} um {termin.uhrzeit} · {termin.raum.name}</p>
      <AnwesenheitListe buchungen={JSON.parse(JSON.stringify(buchungen))} terminId={terminId} />
    </div>
  )
}
