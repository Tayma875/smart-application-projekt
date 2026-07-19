"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface VertragsInfo {
  id: string
  name: string
  email: string
  tarif: string
  vertragEnde: string
  diffTage?: number
  status?: string
}

export function VertragsMonitoringButton() {
  const [loading, setLoading] = useState(false)
  const [auslaufend, setAuslaufend] = useState<VertragsInfo[]>([])
  const [abgelaufen, setAbgelaufen] = useState<VertragsInfo[]>([])

  useEffect(() => {
    laden()
  }, [])

  async function laden() {
    setLoading(true)
    try {
      const res = await fetch("/api/vertrags-monitoring")
      const data = await res.json()
      setAuslaufend(data.auslaufend || [])
      setAbgelaufen(data.abgelaufen || [])
    } catch {
      // Fehler ignorieren
    }
    setLoading(false)
  }

  return (
    <div>
      {auslaufend.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-amber-700 mb-2">
            ⚠️ Auslaufende Verträge (innerhalb 30 Tagen)
          </p>
          <ul className="space-y-2">
            {auslaufend.map((m) => (
              <li key={m.id} className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <Link
                  href={`/admin/mitglieder?fokus=${m.id}`}
                  className="font-medium text-amber-900 hover:text-amber-700"
                >
                  {m.name}
                </Link>
                <span className="text-amber-700">
                  {" "}– {m.tarif} – endet in {m.diffTage} Tagen ({m.vertragEnde})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {abgelaufen.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-red-700 mb-2">
            🔴 Abgelaufene Verträge
          </p>
          <ul className="space-y-2">
            {abgelaufen.map((m) => (
              <li key={m.id} className="text-xs bg-red-50 border border-red-200 rounded-lg p-2.5">
                <Link
                  href={`/admin/mitglieder?fokus=${m.id}`}
                  className="font-medium text-red-900 hover:text-red-700"
                >
                  {m.name}
                </Link>
                <span className="text-red-700">
                  {" "}– {m.tarif} – abgelaufen seit {m.vertragEnde}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {auslaufend.length === 0 && abgelaufen.length === 0 && !loading && (
        <p className="text-xs text-green-600 mt-2">✅ Alle Verträge sind aktuell.</p>
      )}
    </div>
  )
}
