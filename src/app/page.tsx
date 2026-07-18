import { auth, signOut } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { VertragsMonitoringButton } from "@/components/VertragsMonitoringButton"
import { WartelisteCleanupButton } from "@/components/WartelisteCleanupButton"

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

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-[#0F172A] mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default async function Home() {
  const session = await auth()
  if (!session) redirect("/login")
  const rolle = session?.user?.rolle ?? ""
  const userId = session?.user?.userId ?? ""

  let anzeigeName = ""
  if (userId && rolle) {
    if (rolle === "Admin" || rolle === "Rezeption") {
      const account = await prisma.account.findUnique({ where: { id: userId }, select: { email: true } })
      const emailLocal = account?.email?.split("@")[0] ?? null
      anzeigeName = emailLocal ? emailLocal.charAt(0).toUpperCase() + emailLocal.slice(1) : rolle
    } else if (rolle === "Trainer") {
      const trainer = await prisma.trainer.findFirst({ where: { accountId: userId }, select: { name: true } })
      anzeigeName = trainer?.name ?? "Trainer"
    } else if (rolle === "Mitglied") {
      const mitglied = await prisma.mitglied.findFirst({ where: { accountId: userId }, select: { vorname: true, nachname: true, status: true } })
      anzeigeName = mitglied?.vorname ?? "Mitglied"
    }
  }

  const heute = new Date()

  // ── Admin-Daten ──
  let zahlungAusstehendCount = 0
  let noShowWarnungen = 0
  let gesperrtCount = 0
  let trainerAusfallCount = 0
  let kpiAktiveMitglieder = 0
  let kpiKurseDieseWoche = 0
  let kpiAuslastungProzent = 0
  let kpiMonatsUmsatz = 0
  let warnungen: { titel: string; inhalt: string | null }[] = []

  if (rolle === "Admin") {
    zahlungAusstehendCount = await prisma.mitglied.count({ where: { status: "zahlung_ausstehend" } })
    noShowWarnungen = await prisma.mitglied.count({ where: { noShowZaehler: { gte: 2 } } })
    gesperrtCount = await prisma.mitglied.count({ where: { gesperrtBis: { gte: new Date() } } })
    trainerAusfallCount = await prisma.kurstermin.count({ where: { status: "vertretung", datum: { gte: new Date() } } })
    warnungen = await prisma.benachrichtigung.findMany({ where: { gelesen: false, empfaengerRolle: "Admin" }, orderBy: { createdAt: "desc" }, take: 5 })

    kpiAktiveMitglieder = await prisma.mitglied.count({ where: { status: "aktiv" } })
    const wochenStart = new Date(); wochenStart.setHours(0, 0, 0, 0)
    const wochenEnde = new Date(wochenStart); wochenEnde.setDate(wochenEnde.getDate() + 7)
    kpiKurseDieseWoche = await prisma.kurstermin.count({ where: { datum: { gte: wochenStart, lte: wochenEnde }, status: { not: "abgesagt" } } })
    const alleTermine = await prisma.kurstermin.findMany({
      where: { datum: { gte: wochenStart, lte: wochenEnde } },
      include: { kurs: true, raum: true, _count: { select: { buchungen: { where: { teilnahmeStatus: { not: "storniert" } } } } } },
    })
    const auslastungen = alleTermine.map(t => { const kap = Math.min(t.kurs.maxTeilnehmer, t.raum.kapazitaet); return kap > 0 ? t._count.buchungen / kap : 0 })
    kpiAuslastungProzent = auslastungen.length > 0 ? Math.round((auslastungen.reduce((a, b) => a + b, 0) / auslastungen.length) * 100) : 0
    const mitgliederMitTarif = await prisma.mitglied.findMany({ where: { status: "aktiv" }, include: { tarif: { select: { monatspreis: true } } } })
    kpiMonatsUmsatz = mitgliederMitTarif.reduce((sum, m) => sum + (m.tarif?.monatspreis || 0), 0)
  }







  return (
    <main className="min-h-screen bg-[#F0F2F5]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-light tracking-wide text-[#0F172A]">Willkommen zurück, {anzeigeName}</h2>
          <p className="text-sm text-[#94A3B8] mt-1 font-light">
            {rolle === "Admin" && "Übersicht und Verwaltung des Studios"}
            {rolle === "Rezeption" && "Empfang und Mitgliederbetreuung"}
            {rolle === "Trainer" && "Dein Kursplan und Teilnehmer"}
            {rolle === "Mitglied" && "Deine Kurse und Buchungen"}
          </p>
        </div>

        {/* ── ADMIN ── */}
        {rolle === "Admin" && (
          <>
            {/* Warnungen */}
            {zahlungAusstehendCount > 0 && (
              <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <p className="text-sm text-orange-800 flex-1"><strong>{zahlungAusstehendCount} Mitglieder</strong> mit Zahlung ausstehend</p>
                <Link href="/admin/mitglieder" className="text-sm text-orange-700 hover:underline font-medium">Anzeigen →</Link>
              </div>
            )}
            {noShowWarnungen > 0 && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
                <span className="text-xl">❗</span>
                <p className="text-sm text-red-800 flex-1"><strong>{noShowWarnungen} Mitglieder</strong> mit 2+ No-Shows</p>
                <Link href="/admin/mitglieder" className="text-sm text-red-700 hover:underline font-medium">Anzeigen →</Link>
              </div>
            )}
            {trainerAusfallCount > 0 && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 flex items-center gap-3">
                <span className="text-xl">👤</span>
                <p className="text-sm text-yellow-800 flex-1"><strong>{trainerAusfallCount} Termine</strong> mit Trainerausfall</p>
                <Link href="/admin/kurstermine" className="text-sm text-yellow-700 hover:underline font-medium">Anzeigen →</Link>
              </div>
            )}
            {gesperrtCount > 0 && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
                <span className="text-xl">🔒</span>
                <p className="text-sm text-red-800 flex-1"><strong>{gesperrtCount} Mitglieder</strong> sind gesperrt</p>
                <Link href="/admin/mitglieder" className="text-sm text-red-700 hover:underline font-medium">Anzeigen →</Link>
              </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Aktive Mitglieder" value={kpiAktiveMitglieder} />
              <StatCard label="Kurse diese Woche" value={kpiKurseDieseWoche} sub="Termine im Plan" />
              <StatCard label="Auslastung" value={`${kpiAuslastungProzent}%`} />
              <StatCard label="Monatsumsatz" value={`${kpiMonatsUmsatz.toLocaleString("de-DE")} €`} sub="aus aktiven Tarifen" />
            </div>

            {/* Dashboard-Kacheln */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardCard title="Mitglieder" href="/admin/mitglieder" icon="👥" desc="Mitglieder verwalten und einsehen" />
              <DashboardCard title="Tarife" href="/admin/tarife" icon="💶" desc="Tarife verwalten und anpassen" />
              <DashboardCard title="Kurse" href="/admin/kurse" icon="🏋️" desc="Kursarten verwalten" />
              <DashboardCard title="Kurstermine" href="/admin/kurstermine" icon="📅" desc="Termine planen" />
              <DashboardCard title="Trainer" href="/admin/trainer" icon="🧑‍🏫" desc="Trainer verwalten" />
              <DashboardCard title="Räume" href="/admin/raeume" icon="🚪" desc="Räume verwalten" />
              <DashboardCard title="Online-Content" href="/admin/online-content" icon="📺" desc="Videos und Streams" />
              <DashboardCard title="Advanced-Freigabe" href="/admin/advanced-freigabe" icon="⭐" desc="Freigaben" />
              <DashboardCard title="Abrechnung" href="/admin/abrechnung" icon="💰" desc="Honorar abrechnen" />
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800">Vertrags-Monitoring</h3>
                <p className="text-xs text-gray-500 mt-1 mb-3">Auslaufende Mitgliedschaften  prüfen</p>
                <VertragsMonitoringButton />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800">Wartelisten</h3>
                <p className="text-xs text-gray-500 mt-1 mb-3">Abgelaufene Bestätigungen bereinigen</p>
                <WartelisteCleanupButton />
              </div>
            </div>
          </>
        )}

        {/* ── REZEPTION ── */}
        {rolle === "Rezeption" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard title="Mitglieder" href="/rezeption/mitglieder" icon="👥" desc="Mitglieder verwalten und suchen" />
            <DashboardCard title="Buchungen" href="/rezeption/buchungen" icon="📋" desc="Buchungen anlegen und verwalten" />
          </div>
        )}

        {/* ── TRAINER ── */}
        {rolle === "Trainer" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard title="Meine Kurse" href="/trainer/kurse" icon="🏋️" desc="Kalender und Kursplan" />
            <DashboardCard title="Teilnehmer" href="/trainer/teilnehmer" icon="👥" desc="Anwesenheit erfassen" />
          </div>
        )}

        {/* ── MITGLIED ── */}
        {rolle === "Mitglied" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard title="Kurse buchen" href="/mitglied/kurse" icon="🏋️" desc="Verfügbare Kurse ansehen und buchen" />
            <DashboardCard title="Meine Buchungen" href="/mitglied/buchungen" icon="📋" desc="Übersicht mit Kalender und Liste" />
          </div>
        )}
      </div>
    </main>
  )
}
