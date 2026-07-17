import { describe, it, expect } from "vitest"

describe("Kapazitätslogik", () => {
  // Regel: Kapazität = min(Kurslimit, Raumkapazität)
  function berechneKapazitaet(kursLimit: number, raumKapazitaet: number): number {
    return Math.min(kursLimit, raumKapazitaet)
  }

  it("Raumkapazität ist restriktiver als Kurslimit", () => {
    expect(berechneKapazitaet(30, 20)).toBe(20)
  })

  it("Kurslimit ist restriktiver als Raumkapazität", () => {
    expect(berechneKapazitaet(12, 30)).toBe(12)
  })

  it("Gleiche Werte ergeben denselben Wert", () => {
    expect(berechneKapazitaet(15, 15)).toBe(15)
  })

  it("Kleine Räume mit großen Kursen begrenzen die Kapazität", () => {
    expect(berechneKapazitaet(50, 10)).toBe(10)
  })

  it("Große Räume mit kleinen Kursen begrenzen die Kapazität", () => {
    expect(berechneKapazitaet(10, 50)).toBe(10)
  })
})

describe("2-Stunden-Regel", () => {
  // Buchungen nur bis 2h vor Kursbeginn
  function kannBuchen(jetzt: Date, terminStart: Date): boolean {
    const zweiStundenVorher = new Date(terminStart.getTime() - 2 * 60 * 60 * 1000)
    return jetzt <= zweiStundenVorher
  }

  it("Buchung 3h vorher ist erlaubt", () => {
    const jetzt = new Date("2026-07-17T07:00:00")
    const termin = new Date("2026-07-17T10:00:00")
    expect(kannBuchen(jetzt, termin)).toBe(true)
  })

  it("Buchung 2h vorher ist genau erlaubt", () => {
    const jetzt = new Date("2026-07-17T08:00:00")
    const termin = new Date("2026-07-17T10:00:00")
    expect(kannBuchen(jetzt, termin)).toBe(true)
  })

  it("Buchung 1h vorher ist nicht erlaubt", () => {
    const jetzt = new Date("2026-07-17T09:00:00")
    const termin = new Date("2026-07-17T10:00:00")
    expect(kannBuchen(jetzt, termin)).toBe(false)
  })

  it("Buchung nach Kursbeginn ist nicht erlaubt", () => {
    const jetzt = new Date("2026-07-17T10:30:00")
    const termin = new Date("2026-07-17T10:00:00")
    expect(kannBuchen(jetzt, termin)).toBe(false)
  })
})
