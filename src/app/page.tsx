import { auth, signOut } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { VertragsMonitoringButton } from "@/components/VertragsMonitoringButton"
import { WartelisteCleanupButton } from "@/components/WartelisteCleanupButton"

export default async function Home() {
  const session = await auth()
  const rolle = session?.user?.rolle ?? "Admin"
  const userId = session?.user?.userId ?? ""
  const email = session?.user?.email ?? "gast@demo.de"

  // Anzeigenamen dynamisch auflösen
  let anzeigeName = ""
  if (userId) {
    if (rolle === "Admin" || rolle === "Rezeption") {
      const account = await prisma.account.findUnique({ where: { id: userId }, select: { email: true } })
      anzeigeName = account?.email?.split("@")[0] ?? rolle
    } else if (rolle === "Trainer") {
      const trainer = await prisma.trainer.findFirst({ where: { accountId: userId }, select: { name: true } })
      anzeigeName = trainer?.name ?? "Trainer"
    } else if (rolle === "Mitglied") {
      const mitglied = await prisma.mitglied.findFirst({ where: { accountId: userId }, select: { vorname: true } })
      anzeigeName = mitglied?.vorname ?? "Mitglied"
    }
  } else {
    anzeigeName = "Admin"
  }

  // Geburtstage heute
  const heute = new Date()
  const heuteMonatTag = `\${String(heute.getMonth() + 1).padStart(2, "0")}-\${String(heute.getDate()).padStart(2, "0")}`
  const alleMitglieder = await prisma.mitglied.findMany({
    where: { geburtsdatum: { not: null }, status: { in: ["aktiv", "pausiert"] } },
    select: { vorname: true, nachname: true, geburtsdatum: true },
  })
  const geburtstagHeute = alleMitglieder.filter((m) => {
    if (!m.geburtsdatum) return false
    const mm = String(m.geburtsdatum.getMonth() + 1).padStart(2, "0")
    const dd = String(m.geburtsdatum.getDate()).padStart(2, "0")
    return `${mm}-${dd}` === heuteMonatTag
  })

  // Warnungen für Admin
  let zahlungAusstehendCount = 0
  let noShowWarnungen = 0
  let gesperrtCount = 0
  let trainerAusfallCount = 0
  let auslastungWarnungen = 0
  let warnungen: { titel: string; inhalt: string | null }[] = []

  if (rolle === "Admin") {
    zahlungAusstehendCount = await prisma.mitglied.count({ where: { status: "zahlung_ausstehend" } })
    noShowWarnungen = await prisma.mitglied.count({ where: { noShowZaehler: { gte: 2 } } })
    gesperrtCount = await prisma.mitglied.count({ where: { gesperrtBis: { gte: new Date() } } })
    trainerAusfallCount = await prisma.kurstermin.count({
      where: { status: "vertretung", datum: { gte: new Date() } },
    })
    auslastungWarnungen = await prisma.benachrichtigung.count({
      where: { typ: "warnung", titel: { contains: "80%" }, gelesen: false },
    })
    warnungen = await prisma.benachrichtigung.findMany({
      where: { gelesen: false, empfaengerRolle: "Admin" },
      orderBy: { createdAt: "desc" },
      take: 5,
    })
  }

  return (
    <main className="min-h-screen bg-[#F0F2F5]">

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
        <h2 className="text-2xl font-light tracking-wide text-[#0F172A]">Startseite</h2>
        <p className="text-sm text-[#94A3B8] mt-1 font-light">Willkommen zurück, {anzeigeName}</p>
      </div>

      {/* Geburtstags-Kachel */}
      {rolle === "Admin" && geburtstagHeute.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🎂</span>
            <div>
              <h3 className="text-lg font-bold">Geburtstage heute!</h3>
              <p className="text-red-100 mt-1">
                {geburtstagHeute.map((m) => m.vorname + " " + m.nachname).join(", ")}
              </p>
              <p className="text-red-200 text-sm mt-1">
                Bitte persönlich gratulieren oder ein individuelles Angebot versenden.
              </p>
            </div>
          </div>
        </div>
      )}

        {/* SMA-020: Warnungen für Admin */}
        {rolle === "Admin" && (zahlungAusstehendCount > 0 || noShowWarnungen > 0 || gesperrtCount > 0) && (
          <div className="mb-6 space-y-2">
            {zahlungAusstehendCount > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <p className="text-sm text-orange-800">
                  <strong>{zahlungAusstehendCount} Mitglieder</strong> mit Zahlung ausstehend — keine automatische Sperre,
                  bitte prüfen.
                </p>
                <Link href="/admin/mitglieder" className="ml-auto text-sm text-orange-700 hover:underline font-medium">
                  Anzeigen →
                </Link>
              </div>
            )}
            {noShowWarnungen > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
                <span className="text-xl">❗</span>
                <p className="text-sm text-red-800">
                  <strong>{noShowWarnungen} Mitglieder</strong> mit 2+ No-Shows.
                </p>
                <Link href="/admin/mitglieder" className="ml-auto text-sm text-red-700 hover:underline font-medium">
                  Anzeigen →
                </Link>
              </div>
            )}
            {trainerAusfallCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 flex items-center gap-3">
                <span className="text-xl">👤</span>
                <p className="text-sm text-yellow-800">
                  <strong>{trainerAusfallCount} Termine</strong> mit Trainerausfall — bitte Ersatz eintragen.
                </p>
                <Link href="/admin/kurstermine" className="ml-auto text-sm text-yellow-700 hover:underline font-medium">
                  Anzeigen →
                </Link>
              </div>
            )}
            {auslastungWarnungen > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl px-5 py-3 flex items-center gap-3">
                <span className="text-xl">📊</span>
                <p className="text-sm text-purple-800">
                  <strong>{auslastungWarnungen} Termine</strong> mit 80%+ Auslastung — Zusatztermine prüfen.
                </p>
                <Link href="/admin/kurstermine" className="ml-auto text-sm text-purple-700 hover:underline font-medium">
                  Anzeigen →
                </Link>
              </div>
            )}
            {gesperrtCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
                <span className="text-xl">🔒</span>
                <p className="text-sm text-red-800">
                  <strong>{gesperrtCount} Mitglieder</strong> sind für Live-Buchungen gesperrt.
                </p>
                <Link href="/admin/mitglieder" className="ml-auto text-sm text-red-700 hover:underline font-medium">
                  Anzeigen →
                </Link>
              </div>
            )}
            {warnungen.map((w, i) => (
              <div key={i} className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
                <p className="text-sm font-medium text-blue-800">{w.titel}</p>
                <p className="text-xs text-blue-600">{w.inhalt}</p>
              </div>
            ))}
          </div>
        )}






        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rolle === "Admin" && (
            <>
              <DashboardCard title="Mitglieder" href="/admin/mitglieder" icon="👥" desc="Mitglieder verwalten und einsehen" />
              <DashboardCard title="Tarife" href="/admin/tarife" icon="💶" desc="Tarife verwalten und anpassen" />
              <DashboardCard title="Kurse" href="/admin/kurse" icon="🏋️" desc="Kursarten verwalten" />
              <DashboardCard title="Kurstermine" href="/admin/kurstermine" icon="📅" desc="Termine planen und verwalten" />
              <DashboardCard title="Trainer" href="/admin/trainer" icon="🧑‍🏫" desc="Trainer verwalten" />
              <DashboardCard title="Räume" href="/admin/raeume" icon="🚪" desc="Räume verwalten" />
              <DashboardCard title="Online-Content" href="/admin/online-content" icon="📺" desc="Videos und Streams verwalten" />
              <DashboardCard title="Advanced-Freigabe" href="/admin/advanced-freigabe" icon="⭐" desc="Freigaben für Fortgeschrittene" />
              <DashboardCard title="Abrechnung" href="/admin/abrechnung" icon="💰" desc="Honorar der Trainer abrechnen" />

          
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800">Vertrags-Monitoring</h3>
                <p className="text-xs text-gray-500 mt-1 mb-3">Auslaufende/abgelaufene Mitgliedschaften prüfen</p>
                <VertragsMonitoringButton />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800">Wartelisten-Bestätigungen</h3>
                <p className="text-xs text-gray-500 mt-1 mb-3">Abgelaufene Bestätigungsfristen (60 Min) bereinigen</p>
                <WartelisteCleanupButton />
              </div>
            </>
          )}
          {rolle === "Rezeption" && (
            <>
              <DashboardCard title="Mitglieder" href="/rezeption/mitglieder" icon="👥" desc="Mitglieder verwalten" />
              <DashboardCard title="Buchungen" href="/rezeption/buchungen" icon="📋" desc="Buchungen verwalten" />
            </>
          )}
          {rolle === "Trainer" && (
            <>
              <DashboardCard title="Meine Kurse" href="/trainer/kurse" icon="🏋️" desc="Mein Kursplan" />
              <DashboardCard title="Teilnehmer" href="/trainer/teilnehmer" icon="👥" desc="Anwesenheit erfassen" />
            </>
          )}
          {rolle === "Mitglied" && (
            <>
              <DashboardCard title="Kurse buchen" href="/mitglied/kurse" icon="🏋️" desc="Verfügbare Kurse buchen" />
              <DashboardCard title="Meine Buchungen" href="/mitglied/buchungen" icon="📋" desc="Übersicht meiner Kurse" />
            </>
          )}
        </div>
      </div>
    </main>
  )
}

function DashboardCard({ title, href, icon, desc }: { title: string; href: string; icon: string; desc: string }) {
  return (
    <Link href={href} className="group bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 hover:shadow-xl hover:border-[#D4A853]/30 hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A853]/10 to-[#D4A853]/5 flex items-center justify-center group-hover:from-[#D4A853]/20 group-hover:to-[#D4A853]/10 transition-all duration-300">
          <span className="text-xl">{icon}</span>
        </div>
        <div>
          <h3 className="font-semibold text-[#0F172A] group-hover:text-[#D4A853] transition-colors duration-300">{title}</h3>
          <p className="text-sm text-[#94A3B8] mt-0.5 font-light">{desc}</p>
        </div>
      </div>
    </Link>
  )
}
