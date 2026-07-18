import { describe, it, expect } from "vitest"

describe("Mitglieds-Status bei Buchung", () => {
  // Nur aktive Mitglieder dürfen buchen
  // "zahlung_ausstehend" blockiert nicht automatisch (Entscheidung: Warnung, keine Sperre)
  function darfBuchen(status: string): boolean {
    // Zahlung ausstehend ist ein Zahlungsstatus, blockiert nicht
    if (status === "zahlung_ausstehend") return true
    return status === "aktiv"
  }

  it("Aktives Mitglied darf buchen", () => {
    expect(darfBuchen("aktiv")).toBe(true)
  })

  it("Pausiertes Mitglied darf NICHT buchen", () => {
    expect(darfBuchen("pausiert")).toBe(false)
  })

  it("Gekündigtes Mitglied darf NICHT buchen", () => {
    expect(darfBuchen("gekuendigt")).toBe(false)
  })

  it("Mitglied mit Zahlung ausstehend darf buchen (keine automatische Sperre)", () => {
    // Entscheidung: Warnung, aber keine Sperre
    expect(darfBuchen("zahlung_ausstehend")).toBe(true)
  })
})

describe("Stornierte Buchung reaktivieren", () => {
  // Wenn eine Buchung storniert wurde, soll man neu buchen können
  // ohne dass "Bereits gebucht" kommt
  function kannNeuBuchen(existierendeBuchung: { teilnahmeStatus: string } | null): { erlaubt: boolean; grund?: string } {
    if (!existierendeBuchung) return { erlaubt: true }
    if (existierendeBuchung.teilnahmeStatus === "storniert") return { erlaubt: true }
    return { erlaubt: false, grund: "Bereits gebucht" }
  }

  it("Keine existierende Buchung: Buchen erlaubt", () => {
    expect(kannNeuBuchen(null).erlaubt).toBe(true)
  })

  it("Stornierte Buchung: Neu buchen erlaubt", () => {
    expect(kannNeuBuchen({ teilnahmeStatus: "storniert" }).erlaubt).toBe(true)
  })

  it("Aktive Buchung: Neu buchen nicht erlaubt", () => {
    const result = kannNeuBuchen({ teilnahmeStatus: "angemeldet" })
    expect(result.erlaubt).toBe(false)
    expect(result.grund).toBe("Bereits gebucht")
  })

  it("Teilgenommene Buchung: Neu buchen nicht erlaubt", () => {
    const result = kannNeuBuchen({ teilnahmeStatus: "teilgenommen" })
    expect(result.erlaubt).toBe(false)
    expect(result.grund).toBe("Bereits gebucht")
  })

  it("No-Show-Buchung: Neu buchen nicht erlaubt", () => {
    const result = kannNeuBuchen({ teilnahmeStatus: "no_show" })
    expect(result.erlaubt).toBe(false)
    expect(result.grund).toBe("Bereits gebucht")
  })
})

describe("Monatslimit zählt nur nicht-stornierte Buchungen", () => {
  // Stornierte Buchungen sollen nicht aufs Monatslimit angerechnet werden
  function monatsBuchungen(alleBuchungen: { teilnahmeStatus: string }[]): number {
    return alleBuchungen.filter(b => b.teilnahmeStatus !== "storniert").length
  }

  function limitErreicht(alleBuchungen: { teilnahmeStatus: string }[], limit: number): boolean {
    return monatsBuchungen(alleBuchungen) >= limit
  }

  it("Stornierte Buchungen werden nicht gezählt", () => {
    const buchungen = [
      { teilnahmeStatus: "angemeldet" },
      { teilnahmeStatus: "storniert" },
      { teilnahmeStatus: "angemeldet" },
    ]
    expect(monatsBuchungen(buchungen)).toBe(2)
  })

  it("5 aktive Buchungen bei Limit 5: Limit erreicht", () => {
    const buchungen = [
      { teilnahmeStatus: "angemeldet" },
      { teilnahmeStatus: "angemeldet" },
      { teilnahmeStatus: "angemeldet" },
      { teilnahmeStatus: "angemeldet" },
      { teilnahmeStatus: "angemeldet" },
    ]
    expect(limitErreicht(buchungen, 5)).toBe(true)
  })

  it("4 aktive + 1 storniert bei Limit 5: Limit nicht erreicht", () => {
    const buchungen = [
      { teilnahmeStatus: "angemeldet" },
      { teilnahmeStatus: "angemeldet" },
      { teilnahmeStatus: "angemeldet" },
      { teilnahmeStatus: "angemeldet" },
      { teilnahmeStatus: "storniert" },
    ]
    expect(limitErreicht(buchungen, 5)).toBe(false)
  })
})
