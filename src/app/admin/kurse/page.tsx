import { auth, hatBerechtigung } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { KursVerwaltung } from "./KursVerwaltung"

export default async function KursePage() {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) redirect("/login")

  const kurse = await prisma.kurs.findMany({ orderBy: { name: "asc" } })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Kursverwaltung</h2>
      <KursVerwaltung kurse={JSON.parse(JSON.stringify(kurse))} />
    </div>
  )
}
