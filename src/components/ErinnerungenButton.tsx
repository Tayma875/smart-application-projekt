"use client"

import { useState } from "react"

export function ErinnerungenButton() {
  const [loading, setLoading] = useState(false)
  const [ergebnis, setErgebnis] = useState<string | null>(null)

  async function senden() {
    setLoading(true)
    setErgebnis(null)
    try {
      const res = await fetch("/api/erinnerungen", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setErgebnis(`✅ ${data.erinnerungen24h}x 24h + ${data.erinnerungen1h}x 1h gesendet`)
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
        onClick={senden}
        disabled={loading}
        className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Sende..." : "Erinnerungen senden"}
      </button>
      {ergebnis && <p className="text-xs mt-1 text-gray-500">{ergebnis}</p>}
    </div>
  )
}
