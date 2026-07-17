"use client"

import { useState, useEffect } from "react"

export function GeburtstagsErinnerung() {
  const [loading, setLoading] = useState(false)
  const [geburtstage, setGeburtstage] = useState<{ vorname: string; nachname: string }[]>([])
  const [erzeugt, setErzeugt] = useState(false)

  useEffect(() => {
    // Beim Laden prüfen, ob schon Erinnerungen existieren
    fetch("/api/geburtstage")
      .then((r) => r.json())
      .then((data) => {
        if (data.geburtstage?.length > 0) {
          setGeburtstage(
            data.geburtstage.map((g: { inhalt: string }) => {
              const name = g.inhalt.replace(" hat heute Geburtstag!", "")
              const [vorname, nachname] = name.split(" ")
              return { vorname, nachname }
            })
          )
          setErzeugt(true)
        }
      })
      .catch(() => {})
  }, [])

  async function checken() {
    if (erzeugt) return
    setLoading(true)
    try {
      const res = await fetch("/api/geburtstage", { method: "POST" })
      const data = await res.json()
      if (data.success) {
        setGeburtstage(data.mitglieder)
        setErzeugt(data.erinnerungenErzeugt > 0 || data.mitglieder.length > 0)
      }
    } catch {
      // silent
    }
    setLoading(false)
  }

  // Automatisch checken beim ersten Rendern
  useEffect(() => {
    if (!erzeugt) checken()
  }, [])

  if (geburtstage.length === 0 && !loading) return null

  return (
    <div className="bg-pink-50 border border-pink-200 rounded-xl px-5 py-3 flex items-center gap-3">
      <span className="text-xl">🎂</span>
      <div>
        <p className="text-sm text-pink-800">
          <strong>Geburtstag{geburtstage.length > 1 ? "e" : ""}:</strong>{" "}
          {geburtstage.map((m) => `${m.vorname} ${m.nachname}`).join(", ")}
        </p>
        <p className="text-xs text-pink-600 mt-0.5">
          Bitte persönlich gratulieren oder ein individuelles Angebot versenden.
        </p>
      </div>
    </div>
  )
}
