"use client"

import { useState } from "react"

interface Mitglied { id: string; vorname: string; nachname: string }
interface Kurs { name: string }
interface Raum { name: string }
interface Trainer { name: string }
interface Termin { id: string; kurs: Kurs; raum: Raum; trainer: Trainer; datum: string; uhrzeit: string }
interface Buchung { id: string; mitglied: { vorname: string; nachname: string }; termin: Termin; teilnahmeStatus: string; buchungszeitpunkt: string }

export function BuchungsVerwaltung({ buchungen: initial, mitglieder, termine }: { buchungen: Buchung[]; mitglieder: Mitglied[]; termine: Termin[] }) {
  const [buchungen, setBuchungen] = useState(initial)
  const [showNew, setShowNew] = useState(false)

  async function buchen(data: { mitgliedId: string; terminId: string }) {
    const res = await fetch("/api/buchungen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (!res.ok) { alert("Fehler beim Buchen"); return }
    const b = await res.json()
    setBuchungen([b, ...buchungen])
    setShowNew(false)
  }

  const statusBadge = (s: string) => {
    const m: Record<string, string> = { angemeldet: "bg-blue-100 text-blue-700", teilgenommen: "bg-green-100 text-green-700", no_show: "bg-red-100 text-red-700", storniert: "bg-gray-100 text-gray-500" }
    return m[s] || ""
  }

  return (
    <div>
      <button onClick={() => setShowNew(true)} className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500] mb-4">+ Buchung anlegen</button>

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

      <div className="overflow-x-auto">
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
                <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(b.teilnahmeStatus)}`}>{b.teilnahmeStatus.replace(/_/g, " ")}</span></td>
              </tr>
            ))}
            {buchungen.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-400">Keine Buchungen</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
