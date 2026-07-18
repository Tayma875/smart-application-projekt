"use client"

import { useState, useEffect } from "react"

interface GeburtstagsKind {
  vorname: string
  nachname: string
}

export function GeburtstagsErinnerung() {
  const [loading, setLoading] = useState(false)
  const [geburtstage, setGeburtstage] = useState<GeburtstagsKind[]>([])
  const [erzeugt, setErzeugt] = useState(false)

  useEffect(() => {
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
    } catch { /* silent */ }
    setLoading(false)
  }

  useEffect(() => {
    if (!erzeugt) checken()
  }, [])

  return (
    <div className="min-w-0">
      <h3 className="font-semibold text-[#0F172A]">Geburtstage</h3>
      {geburtstage.length > 0 ? (
        <p className="text-sm text-[#94A3B8] mt-0.5 font-light">
          🎂 {geburtstage.map((m) => `${m.vorname} ${m.nachname}`).join(", ")}
        </p>
      ) : (
        <p className="text-sm text-[#94A3B8] mt-0.5 font-light">
          {loading ? "Prüfe..." : "Heute keine Geburtstage"}
        </p>
      )}
    </div>
  )
}
