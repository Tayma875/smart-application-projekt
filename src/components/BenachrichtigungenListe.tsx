"use client"

interface Benachrichtigung {
  id: string
  titel: string
  inhalt: string | null
}

export function BenachrichtigungenListe({ warnungen }: { warnungen: Benachrichtigung[] }) {
  async function alsGelesen(id: string) {
    await fetch(`/api/erinnerungen?gelesen=${id}`, { method: "PATCH" })
    window.location.reload()
  }

  if (warnungen.length === 0) return null

  const kursUpdates = warnungen.filter(
    (w) => w.titel.includes("Kurs") || w.titel.includes("Buchung") || w.titel.includes("Erinnerung") 
  )

  if (kursUpdates.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Aktuelle Kurs-Updates</h3>
      <div className="space-y-2">
        {kursUpdates.map((w, i) => (
          <div
            key={w.id || i}
            className="bg-white border border-gray-200 rounded-xl px-5 py-3 flex items-start gap-3 shadow-sm"
          >
            <span className="text-lg mt-0.5">
              {w.titel.includes("abgesagt") ? "❌" : w.titel.includes("Erinnerung") ? "⏰" : w.titel.includes("Auslastung") ? "📊" : w.titel.includes("Geburtstag") ? "🎂" : "ℹ️"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0F172A]">{w.titel}</p>
              {w.inhalt && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{w.inhalt}</p>}
            </div>
            <button
              onClick={() => alsGelesen(w.id)}
              className="text-xs text-gray-400 hover:text-[#76B900] transition-colors shrink-0 mt-1"
              title="Als gelesen markieren"
            >
              ✓
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
