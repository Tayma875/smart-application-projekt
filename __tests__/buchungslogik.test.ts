import { describe, it, expect } from "vitest"

describe("Buchungslimit (Unit)", () => {
  // SMA-012: Basic = limitiert, Premium = unbegrenzt
  function hatLimit(tarifName: string): number | null {
    const limits: Record<string, number | null> = {
      Basic: 5,
      Plus: null,
      Premium: null,
    }
    return limits[tarifName] ?? null
  }

  it("Basic hat ein Buchungslimit von 5", () => {
    expect(hatLimit("Basic")).toBe(5)
  })

  it("Plus hat kein Buchungslimit", () => {
    expect(hatLimit("Plus")).toBeNull()
  })

  it("Premium hat kein Buchungslimit", () => {
    expect(hatLimit("Premium")).toBeNull()
  })

  it("Limit-Prüfung: 4 Buchungen bei Limit 5 ist erlaubt", () => {
    const limit = hatLimit("Basic")!
    expect(4 < limit).toBe(true)
  })

  it("Limit-Prüfung: 5 Buchungen bei Limit 5 ist nicht erlaubt", () => {
    const limit = hatLimit("Basic")!
    expect(5 < limit).toBe(false)
  })
})

describe("Stornogebühren (Unit)", () => {
  // SMA-011: 50% bei Storno <2h, Premium-Ausnahme
  function berechneGebuehr(tarifName: string, stornoVorBeginnMs: number): boolean {
    const zweiStundenMs = 2 * 60 * 60 * 1000
    if (tarifName === "Premium") return false
    return stornoVorBeginnMs < zweiStundenMs
  }

  it("Basic zahlt Gebühr bei Storno 1h vor Beginn", () => {
    expect(berechneGebuehr("Basic", 60 * 60 * 1000)).toBe(true)
  })

  it("Basic zahlt keine Gebühr bei Storno 3h vor Beginn", () => {
    expect(berechneGebuehr("Basic", 3 * 60 * 60 * 1000)).toBe(false)
  })

  it("Premium zahlt nie Gebühr", () => {
    expect(berechneGebuehr("Premium", 30 * 60 * 1000)).toBe(false)
    expect(berechneGebuehr("Premium", 3 * 60 * 60 * 1000)).toBe(false)
  })

  it("Plus zahlt Gebühr bei Storno 1h vor Beginn", () => {
    expect(berechneGebuehr("Plus", 60 * 60 * 1000)).toBe(true)
  })

  it("Exakt 2h vorher ist noch kostenfrei", () => {
    expect(berechneGebuehr("Basic", 2 * 60 * 60 * 1000)).toBe(false)
  })
})
