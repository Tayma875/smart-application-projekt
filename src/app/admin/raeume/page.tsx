import { auth, hatBerechtigung } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { RaumVerwaltung } from "./RaumVerwaltung"

export default async function RaeumePage() {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) redirect("/login")
  const raeume = await prisma.raum.findMany({ orderBy: { name: "asc" } })
  return <div className="p-6 max-w-6xl mx-auto"><h2 className="text-xl font-semibold mb-6">Räume</h2><RaumVerwaltung raeume={JSON.parse(JSON.stringify(raeume))} /></div>
}
