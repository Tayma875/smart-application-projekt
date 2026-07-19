import { auth, signOut } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { VertragsMonitoringButton } from "@/components/VertragsMonitoringButton"
import { WartelisteCleanupButton } from "@/components/WartelisteCleanupButton"
import { BenachrichtigungenListe } from "@/components/BenachrichtigungenListe"
import { GeburtstagsErinnerung } from "@/components/GeburtstagsErinnerung"

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
  let vertragAuslaufend: { id: string; name: string; tarif: string; vertragEnde: string; diffTage: number }[] = []
let vertragAbgelaufen: { id: string; name: string; tarif: string; vertragEnde: string }[] = []
let warnungen: { id: string; titel: string; inhalt: string | null }[] = []

  if (rolle === "Admin") {
    zahlungAusstehendCount = await prisma.mitglied.count({ where: { status: "zahlung_ausstehend" } })
    noShowWarnungen = await prisma.mitglied.count({ where: { noShowZaehler: { gte: 2 } } })
    gesperrtCount = await prisma.mitglied.count({ where: { gesperrtBis: { gte: new Date() } } })
    trainerAusfallCount = await prisma.kurstermin.count({ where: { status: "vertretung", datum: { gte: new Date() } } })
    // Vertrags-Monitoring Daten direkt via Prisma
  const jetztVertrag = new Date()
  const in30Tagen = new Date(jetztVertrag.getTime() + 30 * 24 * 60 * 60 * 1000)
  const mitgliederMitTarif = await prisma.mitglied.findMany({
    where: { status: { in: ["aktiv", "pausiert", "gekuendigt"] } },
    include: { tarif: true },
  })
  for (const m of mitgliederMitTarif) {
    const vertragEnde = new Date(m.startdatum)
    if (m.tarif.laufzeit === "jahresvertrag") {
      vertragEnde.setFullYear(vertragEnde.getFullYear() + 1)
      while (vertragEnde <= jetztVertrag) {
        vertragEnde.setFullYear(vertragEnde.getFullYear() + 1)
      }
    }
    const diffTage = (vertragEnde.getTime() - jetztVertrag.getTime()) / (1000 * 60 * 60 * 24)
    if (m.status === "gekuendigt" && diffTage <= 0) {
      vertragAbgelaufen.push({
        id: m.id,
        name: `${m.vorname} ${m.nachname}`,
        tarif: m.tarif.name,
        vertragEnde: vertragEnde.toISOString().split("T")[0],
      })
    } else if (m.status === "gekuendigt") {
      vertragAuslaufend.push({
        id: m.id,
        name: `${m.vorname} ${m.nachname}`,
        tarif: m.tarif.name,
        vertragEnde: vertragEnde.toISOString().split("T")[0],
        diffTage: Math.round(diffTage),
      })
    } else if (diffTage <= 30 && diffTage > 0) {
      vertragAuslaufend.push({
        id: m.id,
        name: `${m.vorname} ${m.nachname}`,
        tarif: m.tarif.name,
        vertragEnde: vertragEnde.toISOString().split("T")[0],
        diffTage: Math.round(diffTage),
      })
    }
  }
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
    const mitgliederFuerUmsatz = await prisma.mitglied.findMany({ where: { status: "aktiv" }, include: { tarif: { select: { monatspreis: true } } } })
    kpiMonatsUmsatz = mitgliederFuerUmsatz.reduce((sum, m) => sum + (m.tarif?.monatspreis || 0), 0)
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
            {/* Geburtstage - Hervorgehoben */}
            <div className="mb-6 bg-gradient-to-r from-[#D4A853]/10 to-[#D4A853]/5 border-2 border-[#D4A853]/30 rounded-2xl px-6 py-5 shadow-md">
              <GeburtstagsErinnerung />
            </div>
            {/* ⚠️ Warnungen – nur anzeigen wenn vorhanden */}
            {(zahlungAusstehendCount > 0 || noShowWarnungen > 0 || trainerAusfallCount > 0 || gesperrtCount > 0 || vertragAbgelaufen.length > 0 || vertragAuslaufend.length > 0) && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">⚠️ Warnungen</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {zahlungAusstehendCount > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-lg">⚠️</span>
                      <p className="text-xs text-orange-800 flex-1"><strong>{zahlungAusstehendCount}</strong> Zahlungen ausstehend</p>
                      <Link href="/admin/mitglieder?zahlung=ausstehend" className="text-xs text-orange-700 hover:underline font-medium shrink-0">Anzeigen →</Link>
                    </div>
                  )}
                  {noShowWarnungen > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-lg">❗</span>
                      <p className="text-xs text-red-800 flex-1"><strong>{noShowWarnungen}</strong> mit 2+ No-Shows</p>
                      <Link href="/admin/mitglieder" className="text-xs text-red-700 hover:underline font-medium shrink-0">Anzeigen →</Link>
                    </div>
                  )}
                  {trainerAusfallCount > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-lg">👤</span>
                      <p className="text-xs text-yellow-800 flex-1"><strong>{trainerAusfallCount}</strong> Trainerausfälle</p>
                      <Link href="/admin/kurstermine" className="text-xs text-yellow-700 hover:underline font-medium shrink-0">Anzeigen →</Link>
                    </div>
                  )}
                  {gesperrtCount > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-lg">🔒</span>
                      <p className="text-xs text-red-800 flex-1"><strong>{gesperrtCount}</strong> gesperrte Mitglieder</p>
                      <Link href="/admin/mitglieder" className="text-xs text-red-700 hover:underline font-medium shrink-0">Anzeigen →</Link>
                    </div>
                  )}
                  {vertragAbgelaufen.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-lg">📄</span>
                      <p className="text-xs text-red-800 flex-1"><strong>{vertragAbgelaufen.length}</strong> Verträge abgelaufen</p>
                      <Link href="/admin/mitglieder?vertrag=abgelaufen" className="text-xs text-red-700 hover:underline font-medium shrink-0">Anzeigen →</Link>
                    </div>
                  )}
                  {vertragAuslaufend.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="text-lg">📅</span>
                      <p className="text-xs text-amber-800 flex-1"><strong>{vertragAuslaufend.length}</strong> Verträge laufen aus</p>
                      <Link href="/admin/mitglieder?vertrag=auslaufend" className="text-xs text-amber-700 hover:underline font-medium shrink-0">Anzeigen →</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 📊 Kennzahlen */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">📊 Kennzahlen</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Aktive Mitglieder" value={kpiAktiveMitglieder} />
                <Link href="/admin/kurstermine?ansicht=kalender" className="block bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-[#D4A853]/30 transition-all duration-300">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Kurse diese Woche</p>
                  <p className="text-2xl font-bold text-[#0F172A] mt-1">{kpiKurseDieseWoche}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Termine im Plan</p>
                </Link>
                <StatCard label="Auslastung" value={`${kpiAuslastungProzent}%`} />
                <StatCard label="Monatsumsatz" value={`${kpiMonatsUmsatz.toLocaleString("de-DE")} €`} sub="aus aktiven Tarifen" />
              </div>
            </div>

            {/* ℹ️ Aktuelle Kurs-Updates */}
            <div className="mb-6">
              <BenachrichtigungenListe warnungen={warnungen} />
            </div>

            {/* 🚀 Verwaltung */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">🚀 Verwaltung</h3>
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

                <DashboardCard title="Wartelisten" href="/admin/warteliste" icon="📋" desc="Warteschlangen je Kurs einsehen" />
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
            <DashboardCard title="Abrechnung" href="/trainer/abrechnung" icon="💰" desc="Honorarübersicht (Honorartrainer)" />
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
