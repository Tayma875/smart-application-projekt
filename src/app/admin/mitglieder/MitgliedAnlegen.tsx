"use client"

import { useState } from "react"

interface Tarif { id: string; name: string; monatspreis: number }
interface Mitglied { id: string; vorname: string; nachname: string; email: string; telefon: string | null; status: string; zahlungsstatus: string; tarif: Tarif; geburtsdatum: string | null; noShowZaehler: number }

export function MitgliedAnlegen({ tarife, onClose, onCreated }: { tarife: Tarif[]; onClose: () => void; onCreated: (m: Mitglied) => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(e.currentTarget)
    const data = Object.fromEntries(form)

    const res = await fetch("/api/mitglieder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      setError("Fehler beim Anlegen")
      setLoading(false)
      return
    }

    const mitglied = await res.json()
    onCreated(mitglied)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg space-y-4">
        <h3 className="font-semibold text-lg">Mitglied anlegen</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vorname</label>
            <input name="vorname" required className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nachname</label>
            <input name="nachname" required className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">E-Mail</label>
          <input name="email" type="email" required className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Telefon</label>
          <input name="telefon" className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Geburtsdatum</label>
          <input name="geburtsdatum" type="date" className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tarif</label>
          <select name="tarifId" required className="w-full px-3 py-2 border rounded-lg text-sm">
            {tarife.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.monatspreis}€)</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select name="status" className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="aktiv">Aktiv</option>
              <option value="pausiert">Pausiert</option>
              <option value="gekuendigt">Gekündigt</option>
              <option value="zahlung_ausstehend">Zahlung ausstehend</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Zahlungsstatus</label>
            <select name="zahlungsstatus" className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="ok">OK</option>
              <option value="ausstehend">Ausstehend</option>
            </select>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Abbrechen</button>
          <button type="submit" disabled={loading} className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500] disabled:opacity-50">
            {loading ? "Wird angelegt..." : "Anlegen"}
          </button>
        </div>
      </form>
    </div>
  )
}
