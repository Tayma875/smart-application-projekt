import { describe, it, expect } from "vitest"

describe("Tarifbasierter Online-Zugang", () => {
  // Entscheidung 2026-07-17:
  // Basic: nur On-Demand-Videos (keine Live-Streams)
  // Plus: Videos + Live-Streams
  // Premium: alles unbegrenzt

  function hatZugang(tarifBerechtigung: string, contentKategorie: string): boolean {
    if (tarifBerechtigung === "alles") return true
    if (tarifBerechtigung === "videos_livestreams") return true

    // Basic ("videos"): nur on_demand_video
    if (tarifBerechtigung === "videos" && contentKategorie === "on_demand_video") return true

    return false
  }

  describe("Basic-Tarif", () => {
    it("Basic hat Zugriff auf On-Demand-Videos", () => {
      expect(hatZugang("videos", "on_demand_video")).toBe(true)
    })

    it("Basic hat KEINEN Zugriff auf Live-Streams", () => {
      expect(hatZugang("videos", "live_stream")).toBe(false)
    })
  })

  describe("Plus-Tarif", () => {
    it("Plus hat Zugriff auf On-Demand-Videos", () => {
      expect(hatZugang("videos_livestreams", "on_demand_video")).toBe(true)
    })

    it("Plus hat Zugriff auf Live-Streams", () => {
      expect(hatZugang("videos_livestreams", "live_stream")).toBe(true)
    })
  })

  describe("Premium-Tarif", () => {
    it("Premium hat Zugriff auf alles", () => {
      expect(hatZugang("alles", "on_demand_video")).toBe(true)
      expect(hatZugang("alles", "live_stream")).toBe(true)
    })
  })
})
