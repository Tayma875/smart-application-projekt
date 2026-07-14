"use client"

import { useState } from "react"

interface Kurs { id: string; name: string; dauer: number }
interface Raum { name: string }
interface Trainer { name: string }
interface Termin { id: string; kurs: Kurs; raum: Raum; trainer: Trainer; datum: string; uhrzeit: string; status: string }
interface Buchung { id: string; termin: Termin; teilnahmeStatus: string; buchungszeitpunkt: string; gebuehr: boolean; stornozeitpunkt: string | null }

export function BuchungenListe({ buchungen: initial }: { buchungen: Buchung[] }) {
  const [buchungen, setBuchungen] = useState(initial)

  async function stornieren(id: string) {
    if (!confirm("Wirklich stornieren?")) return
    const res = await fetch(`/api/buchungen/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teilnahmeStatus: "storniert" }),
    })
    if (!res.ok) { const e = await res.json(); alert(e.error); return }
    const updated = await res.json()
    setBuchungen(buchungen.map(b => b.id === id ? { ...b, ...updated } : b))
  }

  const statusBadge = (s: string, gebuehr?: boolean) => {
    if (s === "storniert" && gebuehr) return "bg-orange-100 text-orange-700"
    const m: Record<string, string> = { angemeldet: "bg-blue-100 text-blue-700", teilgenommen: "bg-green-100 text-green-700", no_show: "bg-red-100 text-red-700", storniert: "bg-gray-100 text-gray-500" }
    return m[s] || ""
  }

  return (
    <div className="grid gap-4">
      {buchungen.map(b => {
        const terminStart = new Date(`${b.termin.datum.split("T")[0]}T${b.termin.uhrzeit}`)
        const zweiStundenVorher = new Date(terminStart.getTime() - 2 * 60 * 60 * 1000)
        const kannStornieren = b.teilnahmeStatus === "angemeldet"

        return (
          <div key={b.id} className={`bg-white border rounded-xl p-5 flex items-center justify-between ${b.gebuehr ? "border-orange-300" : ""}`}>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">{b.termin.kurs.name}</h3>
                {b.gebuehr && <span className="text-xs text-orange-600 font-medium">⚠ 50% Gebühr</span>}
              </div>
              <p className="text-sm text-gray-500">{new Date(b.termin.datum).toLocaleDateString("de-DE")} um {b.termin.uhrzeit}</p>
              <p className="text-xs text-gray-400">{b.termin.trainer.name} · {b.termin.raum.name}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(b.teilnahmeStatus, b.gebuehr)}`}>
                {b.gebuehr ? "storniert (50% Gebühr)" : b.teilnahmeStatus.replace(/_/g, " ")}
              </span>
            </div>
            {kannStornieren && (
              <button onClick={() => stornieren(b.id)}
                className="text-sm text-red-500 hover:text-red-700 hover:underline">
                Stornieren
              </button>
            )}
          </div>
        )
      })}
      {buchungen.length === 0 && <p className="text-gray-400 text-center py-8">Keine Buchungen</p>}
    </div>
  )
}
