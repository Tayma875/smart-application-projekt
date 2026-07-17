"use client"

import { useState } from "react"

export function WartelisteCleanupButton() {
  const [loading, setLoading] = useState(false)
  const [ergebnis, setErgebnis] = useState<string | null>(null)

  async function clean() {
    setLoading(true)
    setErgebnis(null)
    try {
      const res = await fetch("/api/warteliste/cleanup", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setErgebnis(`✅ ${data.abgelaufenEntfernt} abgelaufene Fristen entfernt, ${data.termineBetroffen} Termine aktualisiert`)
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
        onClick={clean}
        disabled={loading}
        className="text-sm bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Prüfe..." : "Warteliste: Abgelaufene Fristen bereinigen"}
      </button>
      {ergebnis && <p className="text-xs mt-1 text-gray-500">{ergebnis}</p>}
    </div>
  )
}
