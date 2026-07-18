import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TrainerKalender } from "./TrainerKalender"

export default async function TrainerKursePage() {
  const session = await auth()
  const trainer = await prisma.trainer.findFirst({ where: { accountId: session?.user?.userId } })
  if (!trainer) return <div className="p-6"><p className="text-gray-500">Kein Trainer-Profil gefunden.</p></div>

  const heute = new Date()
  const vierWochen = new Date()
  vierWochen.setDate(vierWochen.getDate() + 27)

  const termine = await prisma.kurstermin.findMany({
    where: {
      trainerId: trainer.id,
      datum: { gte: heute, lte: vierWochen },
      status: { not: "abgesagt" },
    },
    include: {
      kurs: true,
      raum: true,
      trainer: { select: { name: true } },
      _count: { select: { buchungen: { where: { teilnahmeStatus: "angemeldet" } } } },
    },
    orderBy: [{ datum: "asc" }, { uhrzeit: "asc" }],
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Mein Kursplan</h2>
      <p className="text-sm text-gray-500 mb-6">Trainer: {trainer.name} – nächste 4 Wochen ({termine.length} Termine)</p>

      {/* Kalender-Kachel (aufklappbar) */}
      <details className="mb-6 group" open>
        <summary className="cursor-pointer bg-white border border-[#E2E8F0] rounded-xl p-4 hover:shadow-md transition-shadow list-none flex items-center justify-between">
          <h3 className="font-semibold text-[#0F172A]">📅 Kalender-Ansicht</h3>
          <span className="text-xs text-gray-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="bg-white border border-t-0 border-[#E2E8F0] rounded-b-xl p-4">
          <TrainerKalender termine={JSON.parse(JSON.stringify(termine))} />
        </div>
      </details>

      {/* Kurs-Liste Kachel */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
        <h3 className="font-semibold text-[#0F172A] mb-4">📋 Kurs-Liste</h3>
        <div className="grid gap-3">
          {termine.map(t => (
            <div key={t.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <div>
                <div className="font-semibold text-sm">{t.kurs.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {new Date(t.datum).toLocaleDateString("de-DE")} um {t.uhrzeit}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {t.raum.name} · {t._count.buchungen} TN
                </div>
              </div>
              <a
                href={`/trainer/teilnehmer?terminId=${t.id}`}
                className="text-xs text-[#D4A853] hover:underline font-medium"
              >
                Teilnehmer →
              </a>
            </div>
          ))}
          {termine.length === 0 && (
            <p className="text-gray-400 text-center py-8">Keine Termine in den nächsten 4 Wochen</p>
          )}
        </div>
      </div>
    </div>
  )
}
