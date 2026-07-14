import { auth, hatBerechtigung } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { OnlineContentVerwaltung } from "./OnlineContentVerwaltung"

export default async function OnlineContentPage() {
  const session = await auth()
  if (!session?.user || !hatBerechtigung(session.user.rolle, "Admin")) redirect("/login")

  const [content, kurse] = await Promise.all([
    prisma.onlineContent.findMany({ include: { kurs: true }, orderBy: { createdAt: "desc" } }),
    prisma.kurs.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">Online-Content</h2>
      <OnlineContentVerwaltung content={JSON.parse(JSON.stringify(content))} kurse={JSON.parse(JSON.stringify(kurse))} />
    </div>
  )
}
