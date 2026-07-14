import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function TrainerKursePage() {
  const session = await auth()
  if (!session?.user || session.user.rolle !== "Trainer") redirect("/login")

  const trainer = await prisma.trainer.findFirst({ where: { accountId: session.user.userId } })
  if (!trainer) return <p className="p-6">Kein Trainer-Profil gefunden</p>

  const termine = await prisma.kurstermin.findMany({
    where: { trainerId: trainer.id, datum: { gte: new Date() }, status: { not: "abgesagt" } },
    include: { kurs: true, raum: true, _count: { select: { buchungen: { where: { teilnahmeStatus: "angemeldet" } } } } },
    orderBy: [{ datum: "asc" }, { uhrzeit: "asc" }],
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Mein Kursplan</h2>
      <p className="text-sm text-gray-500 mb-4">Trainer: {trainer.name}</p>
      <div className="grid gap-4">
        {termine.map(t => (
          <Link key={t.id} href={`/trainer/teilnehmer?terminId=${t.id}`}
            className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow block">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{t.kurs.name}</h3>
                <p className="text-sm text-gray-500">{new Date(t.datum).toLocaleDateString("de-DE")} um {t.uhrzeit}</p>
                <p className="text-xs text-gray-400">{t.raum.name} · {t._count.buchungen} Teilnehmer</p>
              </div>
              <span className={`text-sm ${t.status === "findet_statt" ? "text-green-600" : t.status === "vertretung" ? "text-yellow-600" : ""}`}>
                {t.status.replace(/_/g, " ")} →
              </span>
            </div>
          </Link>
        ))}
        {termine.length === 0 && <p className="text-gray-400 text-center py-8">Keine anstehenden Kurse</p>}
      </div>
    </div>
  )
}
