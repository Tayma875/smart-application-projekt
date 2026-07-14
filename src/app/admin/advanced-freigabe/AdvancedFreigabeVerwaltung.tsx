"use client"

import { useState } from "react"

interface Mitglied { id: string; vorname: string; nachname: string }
interface Freigabe { id: string; mitglied: Mitglied; kategorie: string; erteiltVon: string; createdAt: string }

const KATEGORIEN = ["Yoga", "HIIT", "Spinning", "Functional Training"]

export function AdvancedFreigabeVerwaltung({ freigaben: initial, mitglieder }: { freigaben: Freigabe[]; mitglieder: Mitglied[] }) {
  const [list, setList] = useState(initial)
  const [mitgliedId, setMitgliedId] = useState(mitglieder[0]?.id || "")
  const [kategorie, setKategorie] = useState(KATEGORIEN[0])
  const [hinweis, setHinweis] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function freigeben() {
    setError("")
    setHinweis(null)
    const res = await fetch("/api/advanced-freigabe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mitgliedId, kategorie }),
    })
    if (!res.ok) { const e = await res.json(); setError(e.error || "Fehler"); return }
    const data = await res.json()
    setList([{ id: data.id, mitglied: data.mitglied, kategorie: data.kategorie, erteiltVon: data.erteiltVon, createdAt: data.createdAt }, ...list])
    setHinweis(data.hinweis)
  }

  async function entfernen(id: string) {
    if (!confirm("Freigabe wirklich entfernen?")) return
    await fetch("/api/advanced-freigabe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setList(list.filter(x => x.id !== id))
  }

  return (
    <div>
      <div className="bg-white border rounded-xl p-5 mb-6 space-y-3">
        <h3 className="font-semibold">Neue Freigabe</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Mitglied</label>
            <select value={mitgliedId} onChange={e => setMitgliedId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              {mitglieder.map(m => <option key={m.id} value={m.id}>{m.vorname} {m.nachname}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Kategorie</label>
            <select value={kategorie} onChange={e => setKategorie(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
              {KATEGORIEN.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <button onClick={freigeben} className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500] whitespace-nowrap">Freigeben</button>
        </div>
        {hinweis && <p className="text-xs text-blue-600">💡 {hinweis}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 font-medium">Mitglied</th>
              <th className="pb-3 font-medium">Kategorie</th>
              <th className="pb-3 font-medium">Erteilt am</th>
              <th className="pb-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {list.map(f => (
              <tr key={f.id} className="border-b hover:bg-gray-50">
                <td className="py-3">{f.mitglied.vorname} {f.mitglied.nachname}</td>
                <td className="py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{f.kategorie}</span></td>
                <td className="py-3 text-gray-500">{new Date(f.createdAt).toLocaleDateString("de-DE")}</td>
                <td className="py-3"><button onClick={() => entfernen(f.id)} className="text-red-500 hover:underline text-xs">Entfernen</button></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-400">Keine Freigaben</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
