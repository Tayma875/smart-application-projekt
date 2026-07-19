import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TrainerAbrechnung } from "./TrainerAbrechnung"

export default async function TrainerAbrechnungPage() {
  const session = await auth()
  const trainer = await prisma.trainer.findFirst({
    where: { accountId: session?.user?.userId },
    select: { id: true, name: true, beschaeftigungsart: true },
  })

  if (!trainer) return <p className="p-6">Kein Trainer-Profil gefunden</p>
  if (trainer.beschaeftigungsart !== "honorarbasis") {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Abrechnung</h2>
        <p className="text-gray-500">Diese Funktion steht nur Honorartrainern zur Verfügung.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Meine Abrechnung</h2>
      <p className="text-sm text-gray-500 mb-6">Als Honorartrainer siehst du hier alle stattgefundenen Kurstermine.</p>
      <TrainerAbrechnung trainerId={trainer.id} trainerName={trainer.name} />
    </div>
  )
}
