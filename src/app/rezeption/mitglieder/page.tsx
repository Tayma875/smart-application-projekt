import { MitgliederListe } from "@/app/admin/mitglieder/MitgliederListe"
import { prisma } from "@/lib/prisma"

export default async function RezeptionMitgliederPage() {

  const mitglieder = await prisma.mitglied.findMany({
    include: { tarif: true },
    orderBy: { nachname: "asc" },
  })

  const tarife = await prisma.tarif.findMany({ orderBy: { monatspreis: "asc" } })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Mitglieder (Rezeption)</h2>
      <MitgliederListe mitglieder={JSON.parse(JSON.stringify(mitglieder))} tarife={JSON.parse(JSON.stringify(tarife))} />
    </div>
  )
}
