"use client"

interface WartelistenEintrag {
  id: string
  mitglied: { vorname: string; nachname: string; email: string }
  termin: {
    id: string
    datum: string
    uhrzeit: string
    kurs: { name: string }
    raum: { name: string }
    trainer: { name: string }
  }
  reihenfolge: number
  eintragungszeitpunkt: string
  bestaetigtBis: string | null
}

export function WartelisteUebersicht({ eintraege }: { eintraege: WartelistenEintrag[] }) {
  // Nach Kurs gruppieren
  const gruppen: Record<string, WartelistenEintrag[]> = {}
  for (const e of eintraege) {
    const key = `${e.termin.kurs.name} – ${new Date(e.termin.datum).toLocaleDateString("de-DE")} ${e.termin.uhrzeit}`
    if (!gruppen[key]) gruppen[key] = []
    gruppen[key].push(e)
  }

  return (
    <div className="space-y-6">
      {Object.entries(gruppen).length === 0 && (
        <p className="text-gray-400 text-center py-12">Keine Einträge auf der Warteliste</p>
      )}
      {Object.entries(gruppen).map(([titel, eintraege]) => (
        <div key={titel} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-sm text-[#0F172A]">{titel}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{eintraege[0].termin.trainer.name} · {eintraege[0].termin.raum.name}</p>
          </div>
          <div className="divide-y divide-gray-100">
            {eintraege.map((e) => (
              <div key={e.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-gray-400 w-6">#{e.reihenfolge}</span>
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">{e.mitglied.vorname} {e.mitglied.nachname}</p>
                    <p className="text-xs text-gray-500">{e.mitglied.email}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {e.bestaetigtBis ? (
                    <span className="text-amber-600">Bestätigung bis {new Date(e.bestaetigtBis).toLocaleTimeString("de-DE")}</span>
                  ) : (
                    <span>Eingetragen am {new Date(e.eintragungszeitpunkt).toLocaleDateString("de-DE")}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
