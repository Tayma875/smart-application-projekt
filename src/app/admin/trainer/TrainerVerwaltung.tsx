"use client"

import { useState } from "react"
interface Kurs { id: string; name: string; kategorie: string }
interface TrainerKurs { trainerId: string; kursId: string; kurs: Kurs }
interface Trainer { id: string; name: string; spezialisierung: string | null; beschaeftigungsart: string; kurse: TrainerKurs[] }

export function TrainerVerwaltung({ trainer: initial, kurse }: { trainer: Trainer[]; kurse: Kurs[] }) {
  const [trainer, setTrainer] = useState(initial); const [edit, setEdit] = useState<Trainer | null>(null); const [showNew, setShowNew] = useState(false)

  async function save(data: any, id?: string) {
    const url = id ? `/api/trainer/${id}` : "/api/trainer"; const method = id ? "PATCH" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (!res.ok) return; const t = await res.json()
    if (id) setTrainer(trainer.map(x => x.id === id ? t : x)); else setTrainer([...trainer, t])
    setEdit(null); setShowNew(false)
  }

  async function remove(id: string) {
    if (!confirm("Trainer wirklich löschen?")) return; await fetch(`/api/trainer/${id}`, { method: "DELETE" })
    setTrainer(trainer.filter(x => x.id !== id))
  }

  async function toggleQual(trainerId: string, kursId: string, has: boolean) {
    const res = await fetch("/api/trainer-qualifikation", {
      method: has ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainerId, kursId }),
    })
    if (!res.ok) return
    setTrainer(trainer.map(t => {
      if (t.id !== trainerId) return t
      const updatedKurse = has ? t.kurse.filter(k => k.kursId !== kursId) : [...t.kurse, { trainerId, kursId, kurs: kurse.find(k => k.id === kursId)! }]
      return { ...t, kurse: updatedKurse }
    }))
  }

  return (
    <div>
      <button onClick={() => setShowNew(true)} className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500] mb-4">+ Trainer anlegen</button>
      {(showNew || edit) && (
        <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); save(Object.fromEntries(fd), edit?.id) }}
          className="bg-white border rounded-xl p-5 mb-4 space-y-3">
          <h3 className="font-semibold">{edit ? "Trainer bearbeiten" : "Neuer Trainer"}</h3>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-gray-600">Name</label><input name="name" defaultValue={edit?.name} required className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-600">Spezialisierung</label><input name="spezialisierung" defaultValue={edit?.spezialisierung || ""} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-xs font-medium text-gray-600">Beschäftigungsart</label>
              <select name="beschaeftigungsart" defaultValue={edit?.beschaeftigungsart || "fest_angestellt"} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="fest_angestellt">Fest angestellt</option><option value="honorarbasis">Honorarbasis</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setEdit(null); setShowNew(false) }} className="px-4 py-2 text-sm text-gray-600">Abbrechen</button>
            <button type="submit" className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500]">{edit ? "Speichern" : "Anlegen"}</button>
          </div>
        </form>
      )}
      <div className="grid gap-4">
        {trainer.map(t => (
          <div key={t.id} className="bg-white border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-sm text-gray-500">{t.spezialisierung || "—"} · {t.beschaeftigungsart.replace(/_/g, " ")}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEdit(t)} className="text-sm text-[#76B900] hover:underline">Bearbeiten</button>
                <button onClick={() => remove(t.id)} className="text-sm text-red-500 hover:underline">Löschen</button>
              </div>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Qualifikationen (Kurse):</p>
              <div className="flex flex-wrap gap-2">
                {kurse.map(k => {
                  const has = t.kurse.some(tk => tk.kursId === k.id)
                  return (
                    <button key={k.id} onClick={() => toggleQual(t.id, k.id, has)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${has ? "bg-[#76B900] text-white border-[#76B900]" : "bg-white text-gray-500 border-gray-300 hover:border-[#76B900]"}`}>
                      {k.name} {has ? "✓" : "+"}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
