"use client"

import { useState } from "react"

export function TrainerAbrechnung({ trainerId, trainerName }: { trainerId: string; trainerName: string }) {
  const jetzt = new Date()
  const monatStart = new Date(jetzt.getFullYear(), jetzt.getMonth(), 1).toISOString().split("T")[0]
  const heute = jetzt.toISOString().split("T")[0]

  const [von, setVon] = useState(monatStart)
  const [bis, setBis] = useState(heute)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")

  async function laden() {
    setLoading(true)
    setError("")
    setData(null)
    try {
      const res = await fetch(`/api/abrechnung?von=${von}&bis=${bis}`)
      if (!res.ok) { setError("Fehler beim Laden"); return }
      const json = await res.json()
      setData(json)
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
          <button onClick={laden} disabled={loading} className="bg-[#D4A853] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#B8943F] disabled:opacity-50 font-medium">
            {loading ? "Lade..." : "Abrechnung laden"}
          </button>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>

      {data && (
        <div className="bg-white border rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold">{trainerName}</h3>
              <p className="text-xs text-gray-500">{data.zeitraum.von} bis {data.zeitraum.bis}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500"><span className="font-bold text-lg text-[#0F172A]">{data.anzahlTermine}</span> Termine</p>
              <p className="text-sm text-gray-500"><span className="font-bold text-lg text-[#D4A853]">{data.gesamtStunden}</span> Stunden</p>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">Datum</th>
                <th className="pb-3 font-medium">Uhrzeit</th>
                <th className="pb-3 font-medium">Kurs</th>
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
                  <td className="py-2">{t.dauer} min</td>
                  <td className="py-2">{t.teilnehmer}</td>
                </tr>
              ))}
              {data.termine.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">Keine Termine im gewählten Zeitraum</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
