import { auth, hatBerechtigung } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TrainerVerwaltung } from "./TrainerVerwaltung"

export default async function TrainerPage() {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) redirect("/login")
  const [trainer, kurse] = await Promise.all([
    prisma.trainer.findMany({ include: { kurse: { include: { kurs: true } } }, orderBy: { name: "asc" } }),
    prisma.kurs.findMany({ orderBy: { name: "asc" } }),
  ])
  return <div className="p-6 max-w-6xl mx-auto"><h2 className="text-xl font-semibold mb-6">Trainerverwaltung</h2><TrainerVerwaltung trainer={JSON.parse(JSON.stringify(trainer))} kurse={JSON.parse(JSON.stringify(kurse))} /></div>
}
