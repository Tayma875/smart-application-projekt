import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import HamburgerMenu from "./HamburgerMenu"
import ProfilDropdown from "./ProfilDropdown"

interface NavItem {
  title: string
  href: string
  icon: string
}

const adminNavItems: NavItem[] = [
  { title: "Mitglieder", href: "/admin/mitglieder", icon: "👥" },
  { title: "Tarife", href: "/admin/tarife", icon: "💶" },
  { title: "Kurse", href: "/admin/kurse", icon: "🏋️" },
  { title: "Kurstermine", href: "/admin/kurstermine", icon: "📅" },
  { title: "Trainer", href: "/admin/trainer", icon: "🧑‍🏫" },
  { title: "Räume", href: "/admin/raeume", icon: "🚪" },
  { title: "Online-Content", href: "/admin/online-content", icon: "📺" },
  { title: "Advanced-Freigabe", href: "/admin/advanced-freigabe", icon: "⭐" },
  { title: "Abrechnung", href: "/admin/abrechnung", icon: "💰" },
]

const rezeptionNavItems: NavItem[] = [
  { title: "Mitglieder", href: "/rezeption/mitglieder", icon: "👥" },
  { title: "Buchungen", href: "/rezeption/buchungen", icon: "📋" },
  { title: "Check-in", href: "/rezeption/checkin", icon: "✅" },
]

const trainerNavItems: NavItem[] = [
  { title: "Meine Kurse", href: "/trainer/kurse", icon: "🏋️" },
  { title: "Teilnehmer", href: "/trainer/teilnehmer", icon: "👥" },
]

const mitgliedNavItems: NavItem[] = [
  { title: "Kurse buchen", href: "/mitglied/kurse", icon: "🏋️" },
  { title: "Meine Buchungen", href: "/mitglied/buchungen", icon: "📋" },
  { title: "Check-in", href: "/mitglied/checkin", icon: "✅" },
]

export default async function Navbar() {
  const session = await auth()
  const rolle = session?.user?.rolle ?? "Admin"
  const email = session?.user?.email ?? "lisa@smart-fitness.de"
  const userId = session?.user?.userId

  let vorname = null as string | null
  let nachname = null as string | null
  if (userId) {
    const mitglied = await prisma.mitglied.findFirst({
      where: { accountId: userId },
      select: { vorname: true, nachname: true },
    })
    if (mitglied) {
      vorname = mitglied.vorname
      nachname = mitglied.nachname
    }
  }

  let navItems: NavItem[] = []
  if (rolle === "Admin") navItems = adminNavItems
  else if (rolle === "Rezeption") navItems = rezeptionNavItems
  else if (rolle === "Trainer") navItems = trainerNavItems
  else if (rolle === "Mitglied") navItems = mitgliedNavItems

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
          <ProfilDropdown
            email={email}
            rolle={rolle}
            vorname={vorname}
            nachname={nachname}
          />
          <span className="w-px h-5 bg-[#D4A853]/20" />
          <HamburgerMenu items={navItems} />
        </div>
      </div>
    </header>
  )
}
