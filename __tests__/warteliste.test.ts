import { describe, it, expect } from "vitest"

describe("Warteliste", () => {
  // Maximal 5 Personen pro Termin
  function darfAufWarteliste(aktuelleGroesse: number): boolean {
    return aktuelleGroesse < 5
  }

  it("Platz 1-5 sind erlaubt", () => {
    expect(darfAufWarteliste(0)).toBe(true)
    expect(darfAufWarteliste(4)).toBe(true)
  })

  it("Platz 6 ist nicht erlaubt (max 5)", () => {
    expect(darfAufWarteliste(5)).toBe(false)
  })

  it("Platz 0 ist auch erlaubt (leere Warteliste)", () => {
    expect(darfAufWarteliste(0)).toBe(true)
  })
})

describe("Wartelisten-Nachrücken", () => {
  // Nach Stornierung: erster Wartelistenplatz rückt nach
  function sollNachruecken(wartelisteGroesse: number, aktuelleBuchungen: number, kapazitaet: number): boolean {
    if (wartelisteGroesse === 0) return false
    return aktuelleBuchungen < kapazitaet
  }

  it("Bei freiem Platz und Warteliste: nachrücken", () => {
    expect(sollNachruecken(3, 8, 10)).toBe(true)
  })

  it("Ohne Warteliste: kein Nachrücken", () => {
    expect(sollNachruecken(0, 9, 10)).toBe(false)
  })

  it("Bei voller Kapazität: kein Nachrücken", () => {
    expect(sollNachruecken(2, 10, 10)).toBe(false)
  })
})

describe("Bestätigungsfrist (60 Min)", () => {
  // Entscheidung 2026-07-17: 60 Minuten Bestätigungsfrist
  function istFristAbgelaufen(erstellt: Date, jetzt: Date): boolean {
    const diffMs = jetzt.getTime() - erstellt.getTime()
    return diffMs > 60 * 60 * 1000
  }

  function restMinuten(erstellt: Date, jetzt: Date): number {
    const diffMs = 60 * 60 * 1000 - (jetzt.getTime() - erstellt.getTime())
    return Math.max(0, Math.floor(diffMs / 60000))
  }

  it("Frist ist nach 70 Minuten abgelaufen", () => {
    const erstellt = new Date("2026-07-18T10:00:00")
    const jetzt = new Date("2026-07-18T11:10:00")
    expect(istFristAbgelaufen(erstellt, jetzt)).toBe(true)
  })

  it("Frist ist nach 30 Minuten nicht abgelaufen", () => {
    const erstellt = new Date("2026-07-18T10:00:00")
    const jetzt = new Date("2026-07-18T10:30:00")
    expect(istFristAbgelaufen(erstellt, jetzt)).toBe(false)
  })

  it("Exakt bei 60 Minuten ist die Frist noch nicht abgelaufen", () => {
    const erstellt = new Date("2026-07-18T10:00:00")
    const jetzt = new Date("2026-07-18T11:00:00")
    expect(istFristAbgelaufen(erstellt, jetzt)).toBe(false)
  })

  it("Restminuten: 25 Minuten verbleibend", () => {
    const erstellt = new Date("2026-07-18T10:00:00")
    const jetzt = new Date("2026-07-18T10:35:00")
    expect(restMinuten(erstellt, jetzt)).toBe(25)
  })

  it("Restminuten: 0 wenn Frist abgelaufen", () => {
    const erstellt = new Date("2026-07-18T10:00:00")
    const jetzt = new Date("2026-07-18T11:05:00")
    expect(restMinuten(erstellt, jetzt)).toBe(0)
  })
})

describe("Wartelisten-Position", () => {
  // Position auf Warteliste = Anzahl der Leute vor einem + 1
  function berechnePosition(aktuelleBuchungen: number, kapazitaet: number, eigeneReihenfolge: number): number {
    return Math.max(1, eigeneReihenfolge)
  }

  it("Erster auf der Warteliste hat Position 1", () => {
    expect(berechnePosition(15, 15, 1)).toBe(1)
  })

  it("Dritter auf der Warteliste hat Position 3", () => {
    expect(berechnePosition(18, 15, 3)).toBe(3)
  })
})
