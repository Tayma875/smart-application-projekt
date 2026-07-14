import { auth, hatBerechtigung } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AbrechnungView } from "./AbrechnungView"

export default async function AbrechnungPage() {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) redirect("/login")

  const trainer = await prisma.trainer.findMany({
    where: { beschaeftigungsart: "honorarbasis" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">Honorartrainer-Abrechnung</h2>
      <p className="text-sm text-gray-500 mb-6">Nur stattgefundene Termine von Honorartrainern werden abgerechnet.</p>
      <AbrechnungView trainer={JSON.parse(JSON.stringify(trainer))} />
    </div>
  )
}
