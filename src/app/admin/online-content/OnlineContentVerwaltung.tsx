"use client"

import { useState } from "react"

interface Kurs { id: string; name: string }
interface Content { id: string; titel: string; beschreibung: string | null; kategorie: string; videoUrl: string | null; kurs: Kurs | null; dauer: number | null; tarifVoraussetzung: string }

export function OnlineContentVerwaltung({ content: initial, kurse }: { content: Content[]; kurse: Kurs[] }) {
  const [list, setList] = useState(initial)
  const [showNew, setShowNew] = useState(false)

  async function create(data: any) {
    const res = await fetch("/api/online-content", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    })
    if (!res.ok) return alert("Fehler beim Anlegen")
    const c = await res.json()
    setList([c, ...list])
    setShowNew(false)
  }

  async function remove(id: string) {
    if (!confirm("Wirklich löschen?")) return
    await fetch(`/api/online-content/${id}`, { method: "DELETE" })
    setList(list.filter(x => x.id !== id))
  }

  const badge = (s: string) => {
    const m: Record<string, string> = { live_stream: "bg-red-100 text-red-700", on_demand_video: "bg-blue-100 text-blue-700" }
    return m[s] || ""
  }

  const tarifBadge = (s: string) => {
    const m: Record<string, string> = { basic: "bg-green-100 text-green-700", plus: "bg-yellow-100 text-yellow-700", premium: "bg-purple-100 text-purple-700" }
    return m[s] || ""
  }

  return (
    <div>
      <button onClick={() => setShowNew(true)} className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500] mb-4">+ Content hinzufügen</button>

      {showNew && <ContentForm kurse={kurse} onSave={create} onCancel={() => setShowNew(false)} />}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 font-medium">Titel</th>
              <th className="pb-3 font-medium">Kategorie</th>
              <th className="pb-3 font-medium">Kurs</th>
              <th className="pb-3 font-medium">Dauer</th>
              <th className="pb-3 font-medium">Zugang</th>
              <th className="pb-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="py-3 font-medium">{c.titel}</td>
                <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge(c.kategorie)}`}>{c.kategorie.replace(/_/g, " ")}</span></td>
                <td className="py-3">{c.kurs?.name || "—"}</td>
                <td className="py-3">{c.dauer ? `${c.dauer} min` : "—"}</td>
                <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tarifBadge(c.tarifVoraussetzung)}`}>{c.tarifVoraussetzung}</span></td>
                <td className="py-3">
                  <button onClick={() => remove(c.id)} className="text-red-500 hover:underline text-xs">Löschen</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">Noch kein Online-Content</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ContentForm({ kurse, onSave, onCancel }: { kurse: Kurs[]; onSave: (d: any) => void; onCancel: () => void }) {
  const [data, setData] = useState({ titel: "", beschreibung: "", kategorie: "on_demand_video", videoUrl: "", kursId: "", dauer: 30, tarifVoraussetzung: "plus" })

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(data) }} className="bg-white border rounded-xl p-5 mb-4 space-y-3">
      <h3 className="font-semibold">Neuer Content</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600">Titel</label>
          <input value={data.titel} onChange={e => setData({...data, titel: e.target.value})} required className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600">Beschreibung</label>
          <textarea value={data.beschreibung} onChange={e => setData({...data, beschreibung: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Kategorie</label>
          <select value={data.kategorie} onChange={e => setData({...data, kategorie: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="on_demand_video">On-Demand Video</option>
            <option value="live_stream">Live-Stream</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Tarif-Voraussetzung</label>
          <select value={data.tarifVoraussetzung} onChange={e => setData({...data, tarifVoraussetzung: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="basic">Basic</option>
            <option value="plus">Plus</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Kurs (optional)</label>
          <select value={data.kursId} onChange={e => setData({...data, kursId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">— Kein Kursbezug —</option>
            {kurse.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Dauer (min)</label>
          <input type="number" value={data.dauer} onChange={e => setData({...data, dauer: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600">Video-URL</label>
          <input value={data.videoUrl} onChange={e => setData({...data, videoUrl: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="https://..." />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600">Abbrechen</button>
        <button type="submit" className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500]">Anlegen</button>
      </div>
    </form>
  )
}
