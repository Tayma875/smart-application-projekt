import { auth, hatBerechtigung } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TarifVerwaltung } from "./TarifVerwaltung"

export default async function TarifePage() {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) {
    redirect("/login")
  }

  const tarife = await prisma.tarif.findMany({ orderBy: { monatspreis: "asc" } })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Tarifverwaltung</h2>
      <TarifVerwaltung tarife={JSON.parse(JSON.stringify(tarife))} />
    </div>
  )
}
