import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ProfilDropdown from "./ProfilDropdown"

export default async function Navbar() {
  const session = await auth()
  const rolle = session?.user?.rolle ?? ""
  const email = session?.user?.email ?? ""
  const userId = session?.user?.userId

  let vorname = null as string | null
  let nachname = null as string | null

  if (userId && rolle) {
    if (rolle === "Admin" || rolle === "Rezeption") {
      const account = await prisma.account.findUnique({
        where: { id: userId },
        select: { email: true },
      })
      const emailLocal = account?.email?.split("@")[0] ?? null
      if (emailLocal) {
        vorname = emailLocal.charAt(0).toUpperCase() + emailLocal.slice(1)
      }
    } else if (rolle === "Trainer") {
      const trainer = await prisma.trainer.findFirst({
        where: { accountId: userId },
        select: { name: true },
      })
      if (trainer) {
        vorname = trainer.name
      }
    } else if (rolle === "Mitglied") {
      const mitglied = await prisma.mitglied.findFirst({
        where: { accountId: userId },
        select: { vorname: true, nachname: true },
      })
      if (mitglied) {
        vorname = mitglied.vorname
        nachname = mitglied.nachname
      }
    }
  }

  return (
    <header className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] shadow-lg border-b border-[#D4A853]/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold tracking-wider text-[#D4A853]">
            Smart Fit
          </Link>
          <span className="hidden sm:block w-px h-6 bg-[#D4A853]/30" />
          <span className="text-xs text-[#94A3B8] italic hidden sm:inline font-light tracking-wide">
            Exzellenz in Bewegung
          </span>
        </div>
        <div className="flex items-center gap-4">
          {session ? (
            <ProfilDropdown
              email={email}
              rolle={rolle}
              vorname={vorname}
              nachname={nachname}
            />
          ) : null}
        </div>
      </div>
    </header>
  )
}
