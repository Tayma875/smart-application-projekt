"use client"

import { useState } from "react"
interface Raum { id: string; name: string; kapazitaet: number; raumtyp: string | null }

export function RaumVerwaltung({ raeume: initial }: { raeume: Raum[] }) {
  const [raeume, setRaeume] = useState(initial); const [edit, setEdit] = useState<Raum | null>(null); const [showNew, setShowNew] = useState(false)

  async function save(data: any, id?: string) {
    const url = id ? `/api/raeume/${id}` : "/api/raeume"; const method = id ? "PATCH" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (!res.ok) return; const r = await res.json()
    if (id) setRaeume(raeume.map(x => x.id === id ? r : x)); else setRaeume([...raeume, r])
    setEdit(null); setShowNew(false)
  }

  async function remove(id: string) {
    if (!confirm("Raum wirklich löschen?")) return; await fetch(`/api/raeume/${id}`, { method: "DELETE" })
    setRaeume(raeume.filter(x => x.id !== id))
  }

  return (
    <div>
      <button onClick={() => setShowNew(true)} className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500] mb-4">+ Raum anlegen</button>
      {(showNew || edit) && (
        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); save(Object.fromEntries(fd), edit?.id) }} className="bg-white border rounded-xl p-5 mb-4 space-y-3">
          <h3 className="font-semibold">{edit ? "Raum bearbeiten" : "Neuer Raum"}</h3>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-gray-600">Name</label><input name="name" defaultValue={edit?.name} required className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-600">Kapazität</label><input name="kapazitaet" type="number" defaultValue={edit?.kapazitaet} required className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-600">Raumtyp</label><input name="raumtyp" defaultValue={edit?.raumtyp || ""} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Kursraum, Spinning..." /></div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setEdit(null); setShowNew(false) }} className="px-4 py-2 text-sm text-gray-600">Abbrechen</button>
            <button type="submit" className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500]">{edit ? "Speichern" : "Anlegen"}</button>
          </div>
        </form>
      )}
      <div className="grid gap-4">
        {raeume.map(r => (
          <div key={r.id} className="bg-white border rounded-xl p-5 flex items-center justify-between">
            <div><h3 className="font-semibold">{r.name}</h3><p className="text-sm text-gray-500">{r.kapazitaet} Plätze {r.raumtyp ? `· ${r.raumtyp}` : ""}</p></div>
            <div className="flex gap-2">
              <button onClick={() => setEdit(r)} className="text-sm text-[#76B900] hover:underline">Bearbeiten</button>
              <button onClick={() => remove(r.id)} className="text-sm text-red-500 hover:underline">Löschen</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
