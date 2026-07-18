"use client"

import { useState, useMemo } from "react"
import Link from "next/link"

interface Kurs { id: string; name: string; dauer: number }
interface Raum { id: string; name: string }
interface Trainer { name: string }
interface Count { buchungen: number }
interface Termin {
  id: string; kurs: Kurs; raum: Raum; trainer: Trainer
  datum: string; uhrzeit: string; status: string
  _count: Count
}

const STATUS_FARBEN: Record<string, string> = {
  findet_statt: "bg-green-50 border-green-200 text-green-800",
  vertretung: "bg-yellow-50 border-yellow-200 text-yellow-800",
  stattgefunden: "bg-gray-50 border-gray-200 text-gray-500",
}

const STATUS_ICONS: Record<string, string> = {
  findet_statt: "✅",
  vertretung: "🔄",
  stattgefunden: "✔️",
}

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

export function TrainerKalender({ termine }: { termine: Termin[] }) {
  const [heuteRef] = useState(new Date())
  const [wocheOffset, setWocheOffset] = useState(0)

  const wochenTage = useMemo(() => {
    const ref = new Date(heuteRef)
    ref.setDate(ref.getDate() + wocheOffset * 7)
    return getWeekDates(ref)
  }, [heuteRef, wocheOffset])

  const terminMap = useMemo(() => {
    const map = new Map<string, Termin[]>()
    for (const t of termine) {
      const tagStr = new Date(t.datum).toISOString().split("T")[0]
      const existing = map.get(tagStr) || []
      existing.push(t)
      map.set(tagStr, existing)
    }
    return map
  }, [termine])

  function getTermineFuerTag(datum: Date): Termin[] {
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

      {/* Quick-Jump zu heute */}
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

      {/* Kalender-Raster: Desktop (Tabelle) */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header: Wochentage */}
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

            {/* Stunden-Zeilen */}
            {STUNDEN.map((stunde) => (
              <>
                <div key={`${stunde}-label`} className="bg-white p-2 text-xs text-gray-400 text-right pr-3 border-t">
                  {stunde}
                </div>
                {wochenTage.map((tag, j) => {
                  const termineAnDemTag = getTermineFuerTag(tag)
                  const terminInDieserStunde = termineAnDemTag.find(t => t.uhrzeit.startsWith(stunde.split(":")[0]))
                  const isHeute = isSameDay(tag, heute)

                  return (
                    <div key={`${stunde}-${j}`} className={`bg-white p-1 border-t border-l min-h-[48px] ${
                      isHeute ? "bg-[#D4A853]/[0.03]" : ""
                    }`}>
                      {terminInDieserStunde && (
                        <Link
                          href={`/trainer/teilnehmer?terminId=${terminInDieserStunde.id}`}
                          className={`block text-xs p-2 rounded-lg border ${
                            STATUS_FARBEN[terminInDieserStunde.status] || "bg-blue-50 border-blue-200"
                          } hover:shadow-md transition-shadow h-full`}
                        >
                          <div className="font-semibold">{terminInDieserStunde.kurs.name}</div>
                          <div className="mt-0.5">{terminInDieserStunde.uhrzeit} · {terminInDieserStunde.kurs.dauer} Min</div>
                          <div className="mt-0.5">{terminInDieserStunde.raum.name} · {terminInDieserStunde._count.buchungen} TN</div>
                          <div className="mt-0.5">
                            {STATUS_ICONS[terminInDieserStunde.status] || ""} {terminInDieserStunde.status.replace(/_/g, " ")}
                          </div>
                        </Link>
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
          const termineAnDemTag = getTermineFuerTag(tag)
          const isHeute = isSameDay(tag, heute)
          if (termineAnDemTag.length === 0) return null

          return (
            <div key={tag.toISOString()}>
              <h3 className={`text-sm font-semibold mb-2 ${isHeute ? "text-[#D4A853]" : "text-gray-700"}`}>
                {formatDateDE(tag)} {isHeute && "· HEUTE"}
              </h3>
              <div className="space-y-2">
                {termineAnDemTag.map(t => (
                  <Link
                    key={t.id}
                    href={`/trainer/teilnehmer?terminId=${t.id}`}
                    className={`block p-3 rounded-xl border ${
                      STATUS_FARBEN[t.status] || "bg-white border-gray-200"
                    } hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{t.kurs.name}</div>
                        <div className="text-xs mt-0.5 opacity-70">{t.uhrzeit} · {t.raum.name}</div>
                      </div>
                      <div className="text-right text-xs">
                        <div>{t._count.buchungen} TN</div>
                        <div>{STATUS_ICONS[t.status] || ""}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}

        {wochenTage.every(t => getTermineFuerTag(t).length === 0) && (
          <p className="text-gray-400 text-center py-8">Keine Kurse in dieser Woche</p>
        )}
      </div>

      {/* Desktop: Keine Kurse */}
      <div className="hidden lg:block">
        {termine.every(t => {
          const d = new Date(t.datum)
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
