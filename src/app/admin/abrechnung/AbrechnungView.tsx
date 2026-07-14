"use client"

import { useState } from "react"

interface Trainer { id: string; name: string }

export function AbrechnungView({ trainer }: { trainer: Trainer[] }) {
  const [von, setVon] = useState("")
  const [bis, setBis] = useState("")
  const [trainerId, setTrainerId] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")

  async function laden() {
    if (!von || !bis) return
    setLoading(true)
    setError("")
    setData(null)
    const params = new URLSearchParams({ von, bis })
    if (trainerId) params.set("trainerId", trainerId)
    try {
      const res = await fetch(`/api/abrechnung?${params}`)
      if (!res.ok) { setError("Fehler beim Laden"); return }
      setData(await res.json())
    } catch { setError("Fehler") }
    setLoading(false)
  }

  return (
    <div>
      <div className="bg-white border rounded-xl p-5 mb-6 space-y-3">
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Von</label>
            <input type="date" value={von} onChange={e => setVon(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bis</label>
            <input type="date" value={bis} onChange={e => setBis(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          {trainer.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Trainer (optional)</label>
              <select value={trainerId} onChange={e => setTrainerId(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
                <option value="">— Alle —</option>
                {trainer.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          <button onClick={laden} disabled={loading} className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500] disabled:opacity-50">{loading ? "Lade..." : "Laden"}</button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      {data && (
        <div className="bg-white border rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Abrechnung {data.zeitraum.von} bis {data.zeitraum.bis}</h3>
            <div className="text-sm text-gray-500">
              <span className="font-medium">{data.anzahlTermine} Termine</span> · <span className="font-medium">{data.gesamtStunden} Std.</span>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Datum</th>
                <th className="pb-3 font-medium">Uhrzeit</th>
                <th className="pb-3 font-medium">Kurs</th>
                <th className="pb-3 font-medium">Trainer</th>
                <th className="pb-3 font-medium">Dauer</th>
                <th className="pb-3 font-medium">TN</th>
              </tr>
            </thead>
            <tbody>
              {data.termine.map((t: any, i: number) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-2">{t.datum}</td>
                  <td className="py-2">{t.uhrzeit}</td>
                  <td className="py-2">{t.kursName}</td>
                  <td className="py-2">{t.trainerName}</td>
                  <td className="py-2">{t.dauer} min</td>
                  <td className="py-2">{t.teilnehmer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
