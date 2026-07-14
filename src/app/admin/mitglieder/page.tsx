import { auth, hatBerechtigung } from "@/lib/auth"
import { redirect } from "next/navigation"
import { MitgliederListe } from "./MitgliederListe"
import { prisma } from "@/lib/prisma"

export default async function MitgliederPage() {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Rezeption")) {
    redirect("/login")
  }

  const mitglieder = await prisma.mitglied.findMany({
    include: { tarif: true },
    orderBy: { nachname: "asc" },
  })

  const tarife = await prisma.tarif.findMany({ orderBy: { monatspreis: "asc" } })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Mitgliederverwaltung</h2>
      <MitgliederListe mitglieder={JSON.parse(JSON.stringify(mitglieder))} tarife={JSON.parse(JSON.stringify(tarife))} />
    </div>
  )
}
