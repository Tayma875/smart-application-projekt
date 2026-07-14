"use client"

import { useState } from "react"

interface Buchung { id: string; teilnahmeStatus: string; mitglied: { vorname: string; nachname: string } }

export function AnwesenheitListe({ buchungen: initial, terminId }: { buchungen: Buchung[]; terminId: string }) {
  const [buchungen, setBuchungen] = useState(initial)

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/buchungen/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teilnahmeStatus: status }),
    })
    if (res.ok) {
      setBuchungen(buchungen.map(b => b.id === id ? { ...b, teilnahmeStatus: status } : b))
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{buchungen.length} Teilnehmer</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 font-medium">Mitglied</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {buchungen.map(b => (
              <tr key={b.id} className="border-b hover:bg-gray-50">
                <td className="py-3">{b.mitglied.vorname} {b.mitglied.nachname}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    b.teilnahmeStatus === "teilgenommen" ? "bg-green-100 text-green-700" :
                    b.teilnahmeStatus === "no_show" ? "bg-red-100 text-red-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {b.teilnahmeStatus.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setStatus(b.id, "teilgenommen")}
                      disabled={b.teilnahmeStatus === "teilgenommen"}
                      className="text-xs px-3 py-1 rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-40">
                      Anwesend
                    </button>
                    <button onClick={() => setStatus(b.id, "no_show")}
                      disabled={b.teilnahmeStatus === "no_show"}
                      className="text-xs px-3 py-1 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-40">
                      No-Show
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {buchungen.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-gray-400">Keine Teilnehmer</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
