"use client"

import { useState, useEffect } from "react"

export function WartelisteBestaetigung({ mitgliedId }: { mitgliedId: string }) {
  const [ausstehend, setAusstehend] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bestaetigend, setBestaetigend] = useState<string | null>(null)
  const [msg, setMsg] = useState("")

  async function laden() {
    setLoading(true)
    try {
      const res = await fetch(`/api/warteliste/ausstehend?mitgliedId=${mitgliedId}`)
      if (res.ok) {
        const data = await res.json()
        setAusstehend(data)
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { laden() }, [mitgliedId])

  async function bestaetigen(terminId: string) {
    setBestaetigend(terminId)
    setMsg("")
    try {
      const res = await fetch("/api/warteliste/bestaetigen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mitgliedId, terminId }),
      })
      const data = await res.json()
      if (res.ok) {
        setMsg("✅ Platz bestätigt!")
        laden()
      } else {
        setMsg(`❌ ${data.error}`)
        laden()
      }
    } catch {
      setMsg("❌ Fehler bei der Bestätigung")
    }
    setBestaetigend(null)
    setTimeout(() => setMsg(""), 5000)
  }

  if (loading && ausstehend.length === 0) return null
  if (ausstehend.length === 0) return null

  return (
    <div className="mb-6 space-y-3">
      <h3 className="font-semibold text-gray-800">⚡ Platz freigeworden – Bestätigung erforderlich</h3>
      {msg && (
        <div className={`text-sm px-4 py-2 rounded-lg ${msg.startsWith("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {msg}
        </div>
      )}
      {ausstehend.map((e: any) => {
        const restMs = new Date(e.bestaetigtBis).getTime() - Date.now()
        const restMin = Math.max(0, Math.floor(restMs / 60000))
        return (
          <div key={e.id} className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800 font-medium">{e.termin.kurs.name}</p>
              <p className="text-xs text-yellow-700">
                {new Date(e.termin.datum).toLocaleDateString("de-DE")} um {e.termin.uhrzeit} · {e.termin.trainer.name} · {restMin} Min. Zeit
              </p>
            </div>
            <button
              onClick={() => bestaetigen(e.terminId)}
              disabled={bestaetigend === e.terminId}
              className="px-4 py-2 rounded-lg text-sm bg-[#76B900] text-white hover:bg-[#4A7500] disabled:opacity-50 transition-colors"
            >
              {bestaetigend === e.terminId ? "..." : "Bestätigen"}
            </button>
          </div>
        )
      })}
    </div>
  )
}
