import { auth, signOut } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ErinnerungenButton } from "@/components/ErinnerungenButton"
import { VertragsMonitoringButton } from "@/components/VertragsMonitoringButton"

export default async function Home() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const rolle = session.user.rolle

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
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#76B900]">Smart Fit</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{session.user.email} ({rolle})</span>
            <form action={async () => { "use server"; await signOut() }}>
              <button type="submit" className="text-sm text-gray-600 hover:text-red-600 transition-colors">Abmelden</button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold mb-6">Dashboard</h2>

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

        {/* SMA-023: Erinnerungen manuell auslösen */}
        {rolle === "Admin" && (
          <div className="mb-6 p-4 bg-white border border-gray-200 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-2">Kurserinnerungen</h3>
            <p className="text-xs text-gray-500 mb-3">Sendet 24h- und 1h-Erinnerungen an alle gebuchten Mitglieder.</p>
            <ErinnerungenButton />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rolle === "Admin" && (
            <>
              <DashboardCard title="Mitglieder" href="/admin/mitglieder" desc={`${zahlungAusstehendCount > 0 ? `⚠ ${zahlungAusstehendCount} Zahlung offen` : "Verwalten"}`} />
              <DashboardCard title="Tarife" href="/admin/tarife" desc="Verwalten" />
              <DashboardCard title="Kurse" href="/admin/kurse" desc="Verwalten" />
              <DashboardCard title="Kurstermine" href="/admin/kurstermine" desc="Planen" />
              <DashboardCard title="Trainer" href="/admin/trainer" desc="Verwalten" />
              <DashboardCard title="Räume" href="/admin/raeume" desc="Verwalten" />
              <DashboardCard title="Online-Content" href="/admin/online-content" desc="Verwalten" />
              <DashboardCard title="Advanced-Freigabe" href="/admin/advanced-freigabe" desc="Fortgeschrittenenkurse" />
              <DashboardCard title="Abrechnung" href="/admin/abrechnung" desc="Honorartrainer" />
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800">Vertrags-Monitoring</h3>
                <p className="text-xs text-gray-500 mt-1 mb-3">Auslaufende/abgelaufene Mitgliedschaften prüfen</p>
                <VertragsMonitoringButton />
              </div>
            </>
            </>
          )}
          {rolle === "Rezeption" && (
            <>
              <DashboardCard title="Mitglieder" href="/rezeption/mitglieder" desc="Verwalten" />
              <DashboardCard title="Buchungen" href="/rezeption/buchungen" desc="Verwalten" />
            </>
          )}
          {rolle === "Trainer" && (
            <>
              <DashboardCard title="Meine Kurse" href="/trainer/kurse" desc="Kursplan" />
              <DashboardCard title="Teilnehmer" href="/trainer/teilnehmer" desc="Anwesenheit" />
            </>
          )}
          {rolle === "Mitglied" && (
            <>
              <DashboardCard title="Kurse buchen" href="/mitglied/kurse" desc="Verfügbare Termine" />
              <DashboardCard title="Meine Buchungen" href="/mitglied/buchungen" desc="Übersicht" />
            </>
          )}
        </div>
      </div>
    </main>
  )
}

function DashboardCard({ title, href, desc }: { title: string; href: string; desc: string }) {
  return (
    <Link href={href} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-[#76B900] transition-all">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
    </Link>
  )
}
