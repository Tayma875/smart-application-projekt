"use client"

import { useState } from "react"

interface Tarif { id: string; name: string; monatspreis: number }
interface Mitglied { id: string; vorname: string; nachname: string; email: string; telefon: string | null; status: string; zahlungsstatus: string; tarif: Tarif; geburtsdatum: string | null; noShowZaehler: number; gesperrtBis?: string | null; pausiertBis?: string | null }

export function MitgliedBearbeiten({ mitglied, tarife, onClose, onUpdated }: {
  mitglied: Mitglied; tarife: Tarif[]; onClose: () => void; onUpdated: (m: Mitglied) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(e.currentTarget)
    const data: any = Object.fromEntries(form)

    if (!data.pausiertBis) delete data.pausiertBis

    const res = await fetch(`/api/mitglieder/${mitglied.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) { const err = await res.json(); setError(err.error || "Fehler"); setLoading(false); return }
    const updated = await res.json()
    onUpdated(updated)
    onClose()
  }

  async function entsperren() {
    if (!confirm(`${mitglied.vorname} ${mitglied.nachname} wirklich entsperren?`)) return
    const res = await fetch(`/api/mitglieder/${mitglied.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gesperrtBis: null, noShowZaehler: 0 }),
    })
    if (res.ok) { const updated = await res.json(); onUpdated(updated); onClose() }
  }

  const istGesperrt = mitglied.gesperrtBis && new Date(mitglied.gesperrtBis) > new Date()
  const istPausiert = mitglied.status === "pausiert"

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
        <h3 className="font-semibold text-lg">Mitglied bearbeiten</h3>
        <p className="text-sm text-gray-400">{mitglied.vorname} {mitglied.nachname}</p>

        {istGesperrt && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Gesperrt für Live-Buchungen</p>
              <p className="text-xs text-red-500">Bis {new Date(mitglied.gesperrtBis!).toLocaleDateString("de-DE")}</p>
            </div>
            <button type="button" onClick={entsperren} className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Entsperren</button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vorname</label>
            <input name="vorname" defaultValue={mitglied.vorname} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nachname</label>
            <input name="nachname" defaultValue={mitglied.nachname} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select name="status" defaultValue={mitglied.status} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="aktiv">Aktiv</option>
            <option value="pausiert">Pausiert</option>
            <option value="gekuendigt">Gekündigt</option>
            <option value="zahlung_ausstehend">Zahlung ausstehend</option>
          </select>
        </div>

        {istPausiert && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Pausiert bis</label>
            <input name="pausiertBis" type="date" defaultValue={mitglied.pausiertBis?.split("T")[0] || ""} className="w-full px-3 py-2 border rounded-lg text-sm" />
            <p className="text-xs text-gray-400 mt-1">Max. 3 Monate Pause pro Jahr</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Zahlungsstatus</label>
          <select name="zahlungsstatus" defaultValue={mitglied.zahlungsstatus} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="ok">OK</option>
            <option value="ausstehend">Ausstehend</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tarif</label>
          <select name="tarifId" defaultValue={mitglied.tarif.id} className="w-full px-3 py-2 border rounded-lg text-sm">
            {tarife.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.monatspreis}€)</option>)}
          </select>
        </div>

        <p className="text-xs text-gray-400">No-Shows: {mitglied.noShowZaehler}x</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Abbrechen</button>
          <button type="submit" disabled={loading} className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500] disabled:opacity-50">{loading ? "Speichern..." : "Speichern"}</button>
        </div>
      </form>
    </div>
  )
}
