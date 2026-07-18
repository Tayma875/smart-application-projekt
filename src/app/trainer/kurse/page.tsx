import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TrainerKalender } from "./TrainerKalender"

export default async function TrainerKursePage() {
  const session = await auth()
  const trainer = await prisma.trainer.findFirst({ where: { accountId: session?.user?.userId } })
  if (!trainer) return <div className="p-6"><p className="text-gray-500">Kein Trainer-Profil gefunden.</p></div>

  // 4 Wochen im Voraus laden (heute + 27 Tage)
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Mein Kursplan</h2>
        <p className="text-sm text-gray-500 mt-1">Trainer: {trainer.name} – nächste 4 Wochen</p>
      </div>
      <TrainerKalender termine={JSON.parse(JSON.stringify(termine))} />
    </div>
  )
}
