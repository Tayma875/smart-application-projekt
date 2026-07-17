import { describe, it, expect } from "vitest"

// Die Rollen-Logik aus auth.ts testen (ohne DB)
type Rolle = "Admin" | "Rezeption" | "Trainer" | "Mitglied"

const rollenHierarchie: Record<Rolle, number> = {
  Admin: 100,
  Rezeption: 60,
  Trainer: 40,
  Mitglied: 20,
}

function hatBerechtigung(userRolle: string, mindestRolle: Rolle): boolean {
  const userLevel = rollenHierarchie[userRolle as Rolle] ?? 0
  const requiredLevel = rollenHierarchie[mindestRolle]
  return userLevel >= requiredLevel
}

describe("Rollen und Berechtigungen", () => {
  it("Admin hat alle Berechtigungen", () => {
    expect(hatBerechtigung("Admin", "Admin")).toBe(true)
    expect(hatBerechtigung("Admin", "Rezeption")).toBe(true)
    expect(hatBerechtigung("Admin", "Trainer")).toBe(true)
    expect(hatBerechtigung("Admin", "Mitglied")).toBe(true)
  })

  it("Rezeption hat Trainer- und Mitglied-Rechte, aber nicht Admin", () => {
    expect(hatBerechtigung("Rezeption", "Admin")).toBe(false)
    expect(hatBerechtigung("Rezeption", "Rezeption")).toBe(true)
    expect(hatBerechtigung("Rezeption", "Trainer")).toBe(true)
    expect(hatBerechtigung("Rezeption", "Mitglied")).toBe(true)
  })

  it("Trainer hat nur Trainer- und Mitglied-Rechte", () => {
    expect(hatBerechtigung("Trainer", "Admin")).toBe(false)
    expect(hatBerechtigung("Trainer", "Rezeption")).toBe(false)
    expect(hatBerechtigung("Trainer", "Trainer")).toBe(true)
    expect(hatBerechtigung("Trainer", "Mitglied")).toBe(true)
  })

  it("Mitglied kann nur Mitglied-Aktionen", () => {
    expect(hatBerechtigung("Mitglied", "Admin")).toBe(false)
    expect(hatBerechtigung("Mitglied", "Rezeption")).toBe(false)
    expect(hatBerechtigung("Mitglied", "Trainer")).toBe(false)
    expect(hatBerechtigung("Mitglied", "Mitglied")).toBe(true)
  })

  it("Unbekannte Rolle hat keine Berechtigung", () => {
    expect(hatBerechtigung("Gast", "Mitglied")).toBe(false)
  })
})
