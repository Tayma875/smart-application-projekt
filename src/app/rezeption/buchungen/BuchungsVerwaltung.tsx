"use client"

import { useState, useEffect, useCallback } from "react"

interface Mitglied { id: string; vorname: string; nachname: string }
interface Kurs { name: string }
interface Raum { name: string }
interface Trainer { name: string }
interface Termin { id: string; kurs: Kurs; raum: Raum; trainer: Trainer; datum: string; uhrzeit: string }
interface Buchung { id: string; mitglied: { vorname: string; nachname: string }; termin: Termin; teilnahmeStatus: string; buchungszeitpunkt: string }

const PAGE_SIZE = 50

const STATUS_STYLES: Record<string, string> = {
  angemeldet: "bg-blue-100 text-blue-700",
  teilgenommen: "bg-green-100 text-green-700",
  no_show: "bg-red-100 text-red-700",
  storniert: "bg-gray-100 text-gray-500",
}

export function BuchungsVerwaltung({ mitglieder, termine }: { mitglieder: Mitglied[]; termine: Termin[] }) {
  const [buchungen, setBuchungen] = useState<Buchung[]>([])
  const [showNew, setShowNew] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const laden = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/buchungen?page=${p}`)
      if (res.ok) {
        const data = await res.json()
        setBuchungen(data.buchungen)
        setTotal(data.total)
        setPage(data.page)
        setTotalPages(data.totalPages)
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { laden(1) }, [laden])

  async function buchen(data: { mitgliedId: string; terminId: string }) {
    const res = await fetch("/api/buchungen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) { const e = await res.json(); alert(e.error || "Fehler"); return }
    setShowNew(false)
    laden(1)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-gray-500">{total} Buchungen insgesamt</p>
        <button onClick={() => setShowNew(true)} className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500]">+ Buchung anlegen</button>
      </div>

      {showNew && (
        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); buchen({ mitgliedId: fd.get("mitgliedId") as string, terminId: fd.get("terminId") as string }) }}
          className="bg-white border rounded-xl p-5 mb-4 space-y-3">
          <h3 className="font-semibold">Neue Buchung</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600">Mitglied</label>
              <select name="mitgliedId" required className="w-full px-3 py-2 border rounded-lg text-sm">
                {mitglieder.map(m => <option key={m.id} value={m.id}>{m.vorname} {m.nachname}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Termin</label>
              <select name="terminId" required className="w-full px-3 py-2 border rounded-lg text-sm">
                {termine.map(t => <option key={t.id} value={t.id}>{t.kurs.name} - {new Date(t.datum).toLocaleDateString("de-DE")} {t.uhrzeit}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-gray-600">Abbrechen</button>
            <button type="submit" className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500]">Buchen</button>
          </div>
        </form>
      )}

      {/* Desktop-Tabelle */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 font-medium">Mitglied</th>
              <th className="pb-3 font-medium">Kurs</th>
              <th className="pb-3 font-medium">Datum</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {buchungen.map(b => (
              <tr key={b.id} className="border-b hover:bg-gray-50">
                <td className="py-3">{b.mitglied.vorname} {b.mitglied.nachname}</td>
                <td className="py-3">{b.termin.kurs.name}</td>
                <td className="py-3">{new Date(b.termin.datum).toLocaleDateString("de-DE")} {b.termin.uhrzeit}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[b.teilnahmeStatus] || ""}`}>
                    {b.teilnahmeStatus.replace(/_/g, " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {buchungen.map(b => (
          <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-1">
              <p className="font-semibold text-sm">{b.mitglied.vorname} {b.mitglied.nachname}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[b.teilnahmeStatus] || ""}`}>
                {b.teilnahmeStatus.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-sm text-gray-500">{b.termin.kurs.name}</p>
            <p className="text-xs text-gray-400">{new Date(b.termin.datum).toLocaleDateString("de-DE")} {b.termin.uhrzeit}</p>
          </div>
        ))}
      </div>

      {!loading && buchungen.length === 0 && (
        <p className="text-center py-8 text-gray-400">Keine Buchungen</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => laden(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-30 hover:bg-gray-50"
          >
            ← Zurück
          </button>
          <span className="text-sm text-gray-500">
            Seite {page} von {totalPages}
          </span>
          <button
            onClick={() => laden(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-30 hover:bg-gray-50"
          >
            Weiter →
          </button>
        </div>
      )}
    </div>
  )
}
