"use client"

import { useState, useMemo } from "react"
import { MitgliedAnlegen } from "./MitgliedAnlegen"
import { MitgliedBearbeiten } from "./MitgliedBearbeiten"

interface Mitglied {
  id: string
  vorname: string
  nachname: string
  email: string
  telefon: string | null
  status: string
  zahlungsstatus: string
  tarif: { id: string; name: string; monatspreis: number }
  geburtsdatum: string | null
  noShowZaehler: number
  gesperrtBis?: string | null
}

interface Tarif {
  id: string
  name: string
  monatspreis: number
}

const STATUS_COLORS: Record<string, string> = {
  aktiv: "bg-green-100 text-green-800",
  pausiert: "bg-yellow-100 text-yellow-800",
  gekuendigt: "bg-red-100 text-red-800",
  zahlung_ausstehend: "bg-orange-100 text-orange-800",
}

const ZAHLUNG_COLORS: Record<string, string> = {
  ok: "bg-green-100 text-green-800",
  ausstehend: "bg-red-100 text-red-800",
  ueberfaellig: "bg-red-100 text-red-800",
}

export function MitgliederListe({ mitglieder, tarife }: { mitglieder: Mitglied[]; tarife: Tarif[] }) {
  const [showAnlegen, setShowAnlegen] = useState(false)
  const [bearbeite, setBearbeite] = useState<Mitglied | null>(null)
  const [list, setList] = useState(mitglieder)

  // Filter- und Such-Status
  const [suche, setSuche] = useState("")
  const [filterStatus, setFilterStatus] = useState("alle")
  const [filterTarif, setFilterTarif] = useState("alle")

  const gefiltert = useMemo(() => {
    return list.filter((m) => {
      // Volltext-Suche über Name, E-Mail, Telefon
      if (suche) {
        const q = suche.toLowerCase()
        const name = `${m.vorname} ${m.nachname}`.toLowerCase()
        const email = m.email.toLowerCase()
        const telefon = (m.telefon || "").toLowerCase()
        if (!name.includes(q) && !email.includes(q) && !telefon.includes(q)) return false
      }
      if (filterStatus !== "alle" && m.status !== filterStatus) return false
      if (filterTarif !== "alle" && m.tarif.name !== filterTarif) return false
      return true
    })
  }, [list, suche, filterStatus, filterTarif])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-gray-500">
          {gefiltert.length} / {list.length} Mitglieder
        </p>
        <button
          onClick={() => setShowAnlegen(true)}
          className="bg-[#76B900] text-white px-4 py-2 rounded-lg hover:bg-[#4A7500] transition-colors text-sm"
        >
          + Mitglied anlegen
        </button>
      </div>

      {/* Suche + Filter */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="🔍 Suchen nach Name, E-Mail, Telefon…"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40 focus:border-[#D4A853]"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
        >
          <option value="alle">Alle Status</option>
          <option value="aktiv">Aktiv</option>
          <option value="pausiert">Pausiert</option>
          <option value="gekuendigt">Gekündigt</option>
          <option value="zahlung_ausstehend">Zahlung ausstehend</option>
        </select>
        <select
          value={filterTarif}
          onChange={(e) => setFilterTarif(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40"
        >
          <option value="alle">Alle Tarife</option>
          {tarife.map((t) => (
            <option key={t.id} value={t.name}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Aktive Filter anzeigen + zurücksetzen */}
      {(suche || filterStatus !== "alle" || filterTarif !== "alle") && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-gray-500">Aktive Filter:</span>
          {suche && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#D4A853]/10 text-[#D4A853] text-xs rounded-full">
              Suche: „{suche}"
              <button onClick={() => setSuche("")} className="hover:text-red-500">✕</button>
            </span>
          )}
          {filterStatus !== "alle" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#D4A853]/10 text-[#D4A853] text-xs rounded-full">
              Status: {filterStatus.replace(/_/g, " ")}
              <button onClick={() => setFilterStatus("alle")} className="hover:text-red-500">✕</button>
            </span>
          )}
          {filterTarif !== "alle" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#D4A853]/10 text-[#D4A853] text-xs rounded-full">
              Tarif: {filterTarif}
              <button onClick={() => setFilterTarif("alle")} className="hover:text-red-500">✕</button>
            </span>
          )}
          <button
            onClick={() => { setSuche(""); setFilterStatus("alle"); setFilterTarif("alle") }}
            className="text-xs text-gray-400 hover:text-red-500 underline ml-2"
          >
            Alle zurücksetzen
          </button>
        </div>
      )}

      {showAnlegen && (
        <MitgliedAnlegen
          tarife={tarife}
          onClose={() => setShowAnlegen(false)}
          onCreated={(m) => setList([...list, m])}
        />
      )}

      {bearbeite && (
        <MitgliedBearbeiten
          mitglied={bearbeite}
          tarife={tarife}
          onClose={() => setBearbeite(null)}
          onUpdated={(m) => setList(list.map((x) => (x.id === m.id ? m : x)))}
        />
      )}

      {/* Mobile Card-Ansicht, Desktop Tabelle */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">E-Mail</th>
              <th className="pb-3 font-medium">Tarif</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Zahlung</th>
              <th className="pb-3 font-medium">No-Shows</th>
              <th className="pb-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {gefiltert.map((m) => (
              <tr key={m.id} className="border-b hover:bg-gray-50">
                <td className="py-3 font-medium">{m.vorname} {m.nachname}</td>
                <td className="py-3 text-gray-500">{m.email}</td>
                <td className="py-3">{m.tarif.name}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[m.status] || "bg-gray-100"}`}>
                    {m.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${ZAHLUNG_COLORS[m.zahlungsstatus] || "bg-gray-100"}`}>
                    {m.zahlungsstatus}
                  </span>
                </td>
                <td className="py-3">
                  {m.noShowZaehler > 0 ? (
                    <span className={m.noShowZaehler >= 2 ? "text-red-600 font-medium" : ""}>
                      {m.noShowZaehler}x
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="py-3">
                  <button onClick={() => setBearbeite(m)} className="text-[#76B900] hover:underline text-xs font-medium">
                    Bearbeiten
                  </button>
                  {m.gesperrtBis && new Date(m.gesperrtBis) > new Date() && (
                    <span className="ml-2 text-xs text-red-500">🔒</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card-Ansicht */}
      <div className="md:hidden space-y-3">
        {gefiltert.map((m) => (
          <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm">{m.vorname} {m.nachname}</p>
                <p className="text-xs text-gray-500">{m.email}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setBearbeite(m)} className="text-[#76B900] hover:underline text-xs">
                  Bearbeiten
                </button>
                {m.gesperrtBis && new Date(m.gesperrtBis) > new Date() && (
                  <span className="text-xs text-red-500">🔒</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[m.status] || "bg-gray-100"}`}>
                {m.status.replace(/_/g, " ")}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{m.tarif.name}</span>
              {m.noShowZaehler > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${m.noShowZaehler >= 2 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
                  {m.noShowZaehler}x No-Show
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {gefiltert.length === 0 && (
        <p className="text-center py-12 text-gray-400">
          {suche || filterStatus !== "alle" || filterTarif !== "alle"
            ? "Keine Mitglieder gefunden, die den Filtern entsprechen."
            : "Keine Mitglieder vorhanden."}
        </p>
      )}
    </div>
  )
}
