import { auth, hatBerechtigung } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdvancedFreigabeVerwaltung } from "./AdvancedFreigabeVerwaltung"

export default async function AdvancedFreigabePage() {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) redirect("/login")

  const [freigaben, mitglieder] = await Promise.all([
    prisma.advancedFreigabe.findMany({
      include: { mitglied: { select: { vorname: true, nachname: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.mitglied.findMany({
      where: { status: "aktiv" },
      orderBy: { nachname: "asc" },
      select: { id: true, vorname: true, nachname: true },
    }),
  ])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Advanced-Freigabe</h2>
      <p className="text-sm text-gray-500 mb-4">Fortgeschrittenenkurse können nur nach manueller Admin-Freigabe gebucht werden.</p>
      <AdvancedFreigabeVerwaltung
        freigaben={JSON.parse(JSON.stringify(freigaben))}
        mitglieder={JSON.parse(JSON.stringify(mitglieder))}
      />
    </div>
  )
}
