"use client"

import { useState } from "react"

interface Kurs {
  id: string; name: string; beschreibung: string | null; level: string
  kategorie: string; dauer: number; maxTeilnehmer: number; voraussetzungId: string | null
}

export function KursVerwaltung({ kurse: initial }: { kurse: Kurs[] }) {
  const [kurse, setKurse] = useState(initial)
  const [edit, setEdit] = useState<Kurs | null>(null)
  const [showNew, setShowNew] = useState(false)

  async function save(data: any, id?: string) {
    const url = id ? `/api/kurse/${id}` : "/api/kurse"
    const method = id ? "PATCH" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (!res.ok) return
    const k = await res.json()
    if (id) setKurse(kurse.map(x => x.id === id ? k : x))
    else setKurse([...kurse, k])
    setEdit(null); setShowNew(false)
  }

  async function remove(id: string) {
    if (!confirm("Kurs wirklich löschen?")) return
    await fetch(`/api/kurse/${id}`, { method: "DELETE" })
    setKurse(kurse.filter(x => x.id !== id))
  }

  const levelBadge = (l: string) => {
    const c: Record<string, string> = { anfaenger: "bg-green-100 text-green-700", mittel: "bg-yellow-100 text-yellow-700", fortgeschritten: "bg-red-100 text-red-700" }
    return c[l] || ""
  }

  return (
    <div>
      <button onClick={() => setShowNew(true)}
        className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500] mb-4">+ Kurs anlegen</button>

      {(showNew || edit) && (
        <KursForm kurs={edit} onSave={(d) => save(d, edit?.id)} onCancel={() => { setEdit(null); setShowNew(false) }} />
      )}

      <div className="grid gap-4">
        {kurse.map(k => (
          <div key={k.id} className="bg-white border rounded-xl p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">{k.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelBadge(k.level)}`}>{k.level}</span>
                <span className="text-xs text-gray-400">{k.kategorie}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{k.beschreibung || "—"}</p>
              <p className="text-xs text-gray-400 mt-1">{k.dauer} Min · max. {k.maxTeilnehmer} TN</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEdit(k)} className="text-sm text-[#76B900] hover:underline">Bearbeiten</button>
              <button onClick={() => remove(k.id)} className="text-sm text-red-500 hover:underline">Löschen</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function KursForm({ kurs, onSave, onCancel }: { kurs: Kurs | null; onSave: (d: any) => void; onCancel: () => void }) {
  const [data, setData] = useState({
    name: kurs?.name || "", beschreibung: kurs?.beschreibung || "", level: kurs?.level || "anfaenger",
    kategorie: kurs?.kategorie || "", dauer: kurs?.dauer?.toString() || "60",
    maxTeilnehmer: kurs?.maxTeilnehmer?.toString() || "20", voraussetzungId: kurs?.voraussetzungId || "",
  })

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(data) }}
      className="bg-white border rounded-xl p-5 mb-4 space-y-3">
      <h3 className="font-semibold">{kurs ? "Kurs bearbeiten" : "Neuer Kurs"}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600">Name</label>
          <input value={data.name} onChange={e => setData({...data, name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Kategorie</label>
          <input value={data.kategorie} onChange={e => setData({...data, kategorie: e.target.value})} required className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Yoga, HIIT..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Level</label>
          <select value={data.level} onChange={e => setData({...data, level: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="anfaenger">Anfänger</option>
            <option value="mittel">Mittel</option>
            <option value="fortgeschritten">Fortgeschritten</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Dauer (Min.)</label>
          <input type="number" value={data.dauer} onChange={e => setData({...data, dauer: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600">Beschreibung</label>
          <textarea value={data.beschreibung} onChange={e => setData({...data, beschreibung: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600">Abbrechen</button>
        <button type="submit" className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500]">
          {kurs ? "Speichern" : "Anlegen"}
        </button>
      </div>
    </form>
  )
}
