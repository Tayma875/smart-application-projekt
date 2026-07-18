"use client"

import { useState, useMemo } from "react"
import Link from "next/link"

interface Kurs { id: string; name: string; dauer: number }
interface Raum { name: string }
interface Trainer { name: string }
interface Termin { id: string; kurs: Kurs; raum: Raum; trainer: Trainer; datum: string; uhrzeit: string; status: string }
interface Buchung { id: string; termin: Termin; teilnahmeStatus: string; buchungszeitpunkt: string; stornozeitpunkt: string | null }

function getWeekDates(reference: Date): Date[] {
  const start = new Date(reference)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return d
  })
}

const STUNDEN = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
]

function formatDateDE(d: Date): string {
  return d.toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "2-digit" })
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

const STATUS_BADGE: Record<string, string> = {
  angemeldet: "bg-blue-100 text-blue-700",
  teilgenommen: "bg-green-100 text-green-700",
  no_show: "bg-red-100 text-red-700",
  storniert: "bg-gray-100 text-gray-500",
}

export function MitgliedKalender({ buchungen }: { buchungen: Buchung[] }) {
  const [heuteRef] = useState(new Date())
  const [wocheOffset, setWocheOffset] = useState(0)

  const wochenTage = useMemo(() => {
    const ref = new Date(heuteRef)
    ref.setDate(ref.getDate() + wocheOffset * 7)
    return getWeekDates(ref)
  }, [heuteRef, wocheOffset])

  const terminMap = useMemo(() => {
    const map = new Map<string, Buchung[]>()
    for (const b of buchungen) {
      const tagStr = new Date(b.termin.datum).toISOString().split("T")[0]
      const existing = map.get(tagStr) || []
      existing.push(b)
      map.set(tagStr, existing)
    }
    return map
  }, [buchungen])

  function getBuchungenFuerTag(datum: Date): Buchung[] {
    const tagStr = datum.toISOString().split("T")[0]
    return terminMap.get(tagStr) || []
  }

  const heute = new Date()

  return (
    <div>
      {/* Wochen-Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWocheOffset(o => o - 1)}
          className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Vorherige Woche
        </button>
        <span className="text-sm font-medium text-gray-600">
          KW {getWeekNumber(new Date(heuteRef.getTime() + wocheOffset * 7 * 24 * 60 * 60 * 1000))}
        </span>
        <button
          onClick={() => setWocheOffset(o => o + 1)}
          className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
        >
          Nächste Woche →
        </button>
      </div>

      {wocheOffset !== 0 && (
        <div className="mb-4 text-center">
          <button
            onClick={() => setWocheOffset(0)}
            className="text-xs text-[#D4A853] hover:underline"
          >
            ⬆ Zurück zu heute
          </button>
        </div>
      )}

      {/* Desktop: Tabellen-Raster */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-px bg-gray-200 rounded-t-xl overflow-hidden">
            <div className="bg-gray-50 p-3" />
            {wochenTage.map((tag, i) => {
              const isHeute = isSameDay(tag, heute)
              return (
                <div key={i} className={`p-3 text-center font-medium text-sm ${
                  isHeute ? "bg-[#D4A853]/20 text-[#D4A853]" : "bg-gray-50 text-gray-700"
                }`}>
                  <div>{formatDateDE(tag)}</div>
                  {isHeute && <div className="text-[10px] font-bold">HEUTE</div>}
                </div>
              )
            })}

            {STUNDEN.map((stunde) => (
              <>
                <div key={`${stunde}-label`} className="bg-white p-2 text-xs text-gray-400 text-right pr-3 border-t">
                  {stunde}
                </div>
                {wochenTage.map((tag, j) => {
                  const buchungenAnDemTag = getBuchungenFuerTag(tag)
                  const terminInDieserStunde = buchungenAnDemTag.find(
                    b => b.termin.uhrzeit.startsWith(stunde.split(":")[0]) && b.teilnahmeStatus !== "storniert"
                  )
                  const isHeute = isSameDay(tag, heute)

                  return (
                    <div key={`${stunde}-${j}`} className={`bg-white p-1 border-t border-l min-h-[48px] ${
                      isHeute ? "bg-[#D4A853]/[0.03]" : ""
                    }`}>
                      {terminInDieserStunde && (
                        <div className={`block text-xs p-2 rounded-lg border hover:shadow-md transition-shadow ${
                          STATUS_BADGE[terminInDieserStunde.teilnahmeStatus] || "bg-blue-50 border-blue-200"
                        }`}>
                          <div className="font-semibold">{terminInDieserStunde.termin.kurs.name}</div>
                          <div className="mt-0.5">{terminInDieserStunde.termin.uhrzeit} · {terminInDieserStunde.termin.kurs.dauer} Min</div>
                          <div className="mt-0.5">{terminInDieserStunde.termin.trainer.name} · {terminInDieserStunde.termin.raum.name}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Tages-Liste */}
      <div className="lg:hidden space-y-4">
        {wochenTage.map((tag) => {
          const buchungenAnDemTag = getBuchungenFuerTag(tag)
          const isHeute = isSameDay(tag, heute)
          if (buchungenAnDemTag.length === 0) return null

          return (
            <div key={tag.toISOString()}>
              <h3 className={`text-sm font-semibold mb-2 ${isHeute ? "text-[#D4A853]" : "text-gray-700"}`}>
                {formatDateDE(tag)} {isHeute && "· HEUTE"}
              </h3>
              <div className="space-y-2">
                {buchungenAnDemTag.map(b => (
                  <div key={b.id}
                    className={`block p-3 rounded-xl border ${
                      STATUS_BADGE[b.teilnahmeStatus] || "bg-white border-gray-200"
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{b.termin.kurs.name}</div>
                        <div className="text-xs mt-0.5 opacity-70">{b.termin.uhrzeit} · {b.termin.trainer.name}</div>
                      </div>
                      <div className="text-right text-xs">
                        <div>{b.termin.raum.name}</div>
                        <div className="mt-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium inline-block bg-white/60">
                          {b.teilnahmeStatus.replace(/_/g, " ")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {wochenTage.every(t => getBuchungenFuerTag(t).length === 0) && (
          <p className="text-gray-400 text-center py-8">Keine Kurse in dieser Woche</p>
        )}
      </div>

      <div className="hidden lg:block">
        {buchungen.every(b => {
          const d = new Date(b.termin.datum)
          return !wochenTage.some(wt => isSameDay(d, wt))
        }) && (
          <p className="text-gray-400 text-center py-8">Keine Kurse in dieser Woche</p>
        )}
      </div>
    </div>
  )
}

function getWeekNumber(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = d.getTime() - start.getTime()
  return Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
}
