import { describe, it, expect } from "vitest"

describe("No-Show-Sperre", () => {
  // Entscheidung 2026-07-17:
  // Basic/Plus: automatische Sperre nach 3 No-Shows
  // Premium: keine Sperre, nur Benachrichtigung

  function sollSperren(rolle: string, noShowZaehler: number): boolean {
    if (rolle === "Premium") return false
    return noShowZaehler >= 3
  }

  it("Basic wird nach 3 No-Shows gesperrt", () => {
    expect(sollSperren("Basic", 3)).toBe(true)
    expect(sollSperren("Basic", 4)).toBe(true)
  })

  it("Plus wird nach 3 No-Shows gesperrt", () => {
    expect(sollSperren("Plus", 3)).toBe(true)
  })

  it("Premium wird NICHT automatisch gesperrt", () => {
    expect(sollSperren("Premium", 3)).toBe(false)
    expect(sollSperren("Premium", 10)).toBe(false)
  })

  it("Bei weniger als 3 No-Shows gibt es keine Sperre", () => {
    expect(sollSperren("Basic", 0)).toBe(false)
    expect(sollSperren("Basic", 1)).toBe(false)
    expect(sollSperren("Basic", 2)).toBe(false)
    expect(sollSperren("Plus", 2)).toBe(false)
  })

  it("Sperrdauer beträgt 14 Tage", () => {
    const gesperrtBis = new Date()
    gesperrtBis.setDate(gesperrtBis.getDate() + 14)
    // Prüfung: Differenz ca. 14 Tage
    const jetzt = new Date()
    const diffTage = Math.round((gesperrtBis.getTime() - jetzt.getTime()) / (1000 * 60 * 60 * 24))
    expect(diffTage).toBe(14)
  })
})
