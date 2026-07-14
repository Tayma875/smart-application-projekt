"use client"

import { useState } from "react"
interface Kurs { id: string; name: string; dauer: number }
interface Count { buchungen: number }
interface Termin { id: string; kurs: Kurs; raum: { name: string; kapazitaet: number }; trainer: { name: string }; datum: string; uhrzeit: string; status: string; _count: Count }

export function KursBuchen({ termine, mitgliedId, gebuchteIds }: { termine: Termin[]; mitgliedId: string; gebuchteIds: string[] }) {
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState<string | null>(null)
  const [gebucht, setGebucht] = useState(new Set(gebuchteIds))
  const [warteliste, setWarteliste] = useState<Set<string>>(new Set())

  async function buchen(terminId: string) {
    setLoading(terminId)
    const res = await fetch("/api/buchungen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mitgliedId, terminId }),
    })
    if (res.ok) { setGebucht(new Set([...gebucht, terminId])); setMsg("Gebucht ✓") }
    else { const e = await res.json(); setMsg(e.error || "Fehler") }
    setLoading(null); setTimeout(() => setMsg(""), 3000)
  }

  async function aufWarteliste(terminId: string) {
    setLoading(terminId)
    const res = await fetch("/api/warteliste", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mitgliedId, terminId }),
    })
    if (res.ok) { setWarteliste(new Set([...warteliste, terminId])); setMsg("Auf Warteliste ✓") }
    else { const e = await res.json(); setMsg(e.error || "Fehler") }
    setLoading(null); setTimeout(() => setMsg(""), 3000)
  }

  return (
    <div>
      {msg && <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg mb-4 text-sm">{msg}</div>}
      <div className="grid gap-4">
        {termine.map(t => {
          const isGebucht = gebucht.has(t.id)
          const aufWarte = warteliste.has(t.id)
          const kapazitaet = Math.min(t.raum.kapazitaet, 999) // wir nutzen Raumkapazität
          const istVoll = t._count.buchungen >= kapazitaet
          const terminDatetime = new Date(`${t.datum.split("T")[0]}T${t.uhrzeit}`)
          const zweiStundenVorher = new Date(terminDatetime.getTime() - 2 * 60 * 60 * 1000)
          const kannBuchen = !isGebucht && !aufWarte && !istVoll && new Date() < zweiStundenVorher

          return (
            <div key={t.id} className={`bg-white border rounded-xl p-5 ${
              isGebucht ? "border-[#76B900]" : aufWarte ? "border-yellow-400" : ""
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{t.kurs.name}</h3>
                    <span className="text-xs text-gray-400">{t.kurs.dauer} Min</span>
                    {istVoll && !isGebucht && !aufWarte && (
                      <span className="text-xs text-orange-600 font-medium">Ausgebucht</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{new Date(t.datum).toLocaleDateString("de-DE")} um {t.uhrzeit}</p>
                  <p className="text-xs text-gray-400">{t.trainer.name} · {t.raum.name} ({t._count.buchungen}/{kapazitaet} Plätze)</p>
                  {aufWarte && <p className="text-xs text-yellow-600 mt-1">Auf Warteliste (Position: {t._count.buchungen - kapazitaet + 1})</p>}
                </div>
                <div className="flex gap-2">
                  {isGebucht ? (
                    <span className="px-4 py-2 rounded-lg text-sm bg-gray-100 text-gray-400">Gebucht ✓</span>
                  ) : aufWarte ? (
                    <span className="px-4 py-2 rounded-lg text-sm bg-yellow-100 text-yellow-700">Warteliste ✓</span>
                  ) : istVoll ? (
                    <button onClick={() => aufWarteliste(t.id)}
                      disabled={loading === t.id}
                      className="px-4 py-2 rounded-lg text-sm bg-yellow-50 text-yellow-700 border border-yellow-300 hover:bg-yellow-100 disabled:opacity-50">
                      {loading === t.id ? "..." : "Warteliste"}
                    </button>
                  ) : kannBuchen ? (
                    <button onClick={() => buchen(t.id)}
                      disabled={loading === t.id}
                      className="px-4 py-2 rounded-lg text-sm bg-[#76B900] text-white hover:bg-[#4A7500] disabled:opacity-50">
                      {loading === t.id ? "..." : "Buchen"}
                    </button>
                  ) : (
                    <span className="px-4 py-2 rounded-lg text-sm bg-gray-100 text-gray-400">
                      {new Date() > zweiStundenVorher ? "Zu spät" : "—"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {termine.length === 0 && <p className="text-gray-400 text-center py-8">Keine verfügbaren Termine</p>}
      </div>
    </div>
  )
}
