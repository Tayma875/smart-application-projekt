"use client"

import { useState } from "react"

export function VertragsMonitoringButton() {
  const [loading, setLoading] = useState(false)
  const [ergebnis, setErgebnis] = useState<string | null>(null)

  async function checken() {
    setLoading(true)
    setErgebnis(null)
    try {
      const res = await fetch("/api/vertrags-monitoring", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setErgebnis(`✅ ${data.benachrichtigungenErstellt} neue Benachrichtigungen`)
      } else {
        setErgebnis("❌ Fehler")
      }
    } catch {
      setErgebnis("❌ Fehler")
    }
    setLoading(false)
  }

  return (
    <div>
      <button
        onClick={checken}
        disabled={loading}
        className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Prüfe..." : "Verträge prüfen"}
      </button>
      {ergebnis && <p className="text-xs mt-1 text-gray-500">{ergebnis}</p>}
    </div>
  )
}
