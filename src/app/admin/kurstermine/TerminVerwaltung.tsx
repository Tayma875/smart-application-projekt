"use client"

import { useState } from "react"

interface Kurs { id: string; name: string }
interface Raum { id: string; name: string; kapazitaet: number }
interface Trainer { id: string; name: string }
interface Count { buchungen: number }
interface Termin { id: string; kurs: Kurs; raum: Raum; trainer: Trainer; datum: string; uhrzeit: string; status: string; _count: Count }

export function TerminVerwaltung({ termine: initial, kurse, raeume, trainer }: { termine: Termin[]; kurse: Kurs[]; raeume: Raum[]; trainer: Trainer[] }) {
  const [termine, setTermine] = useState(initial)
  const [showNew, setShowNew] = useState(false)
  const [edit, setEdit] = useState<Termin | null>(null)

  async function save(data: any, id?: string) {
    const url = id ? `/api/kurstermine/${id}` : "/api/kurstermine"
    const method = id ? "PATCH" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (!res.ok) return
    const t = await res.json()
    if (id) setTermine(termine.map(x => x.id === id ? t : x))
    else setTermine([...termine, { ...t, _count: { buchungen: 0 } }])
    setEdit(null); setShowNew(false)
  }

  async function cancelTermin(id: string) {
    if (!confirm("Termin wirklich absagen? Alle Buchungen werden gebührenfrei storniert und die Warteliste wird geleert.")) return
    await fetch(`/api/kurstermine/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "abgesagt" }) })
    const res = await fetch("/api/kurstermine")
    if (res.ok) setTermine(await res.json())
  }

  async function remove(id: string) {
    if (!confirm("Termin wirklich löschen?")) return
    await fetch(`/api/kurstermine/${id}`, { method: "DELETE" })
    setTermine(termine.filter(x => x.id !== id))
  }

  const statusBadge = (s: string) => {
    const m: Record<string, string> = { findet_statt: "bg-green-100 text-green-700", abgesagt: "bg-red-100 text-red-700", vertretung: "bg-yellow-100 text-yellow-700", stattgefunden: "bg-blue-100 text-blue-700" }
    return m[s] || ""
  }

  return (
    <div>
      <button onClick={() => setShowNew(true)}
        className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500] mb-4">+ Termin anlegen</button>

      {(showNew || edit) && <TerminForm termin={edit} kurse={kurse} raeume={raeume} trainer={trainer} onSave={(d) => save(d, edit?.id)} onCancel={() => { setEdit(null); setShowNew(false) }} />}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 font-medium">Datum</th>
              <th className="pb-3 font-medium">Uhrzeit</th>
              <th className="pb-3 font-medium">Kurs</th>
              <th className="pb-3 font-medium">Raum</th>
              <th className="pb-3 font-medium">Trainer</th>
              <th className="pb-3 font-medium">Buchungen</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {termine.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="py-3">{new Date(t.datum).toLocaleDateString("de-DE")}</td>
                <td className="py-3">{t.uhrzeit}</td>
                <td className="py-3">{t.kurs.name}</td>
                <td className="py-3">{t.raum.name}</td>
                <td className="py-3">{t.trainer.name}</td>
                <td className="py-3">{t._count.buchungen}</td>
                <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(t.status)}`}>{t.status.replace(/_/g, " ")}</span></td>
                <td className="py-3 flex gap-2">
                  <button onClick={() => setEdit(t)} className="text-[#76B900] hover:underline text-xs">Bearbeiten</button>
                  {(t.status === "findet_statt" || t.status === "vertretung") && (
                    <button onClick={() => cancelTermin(t.id)} className="text-red-500 hover:underline text-xs font-semibold">Absagen</button>
                  )}
                  <button onClick={() => remove(t.id)} className="text-red-500 hover:underline text-xs">Löschen</button>
                </td>
              </tr>
            ))}
            {termine.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-400">Noch keine Termine angelegt</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TerminForm({ termin, kurse, raeume, trainer, onSave, onCancel }: {
  termin: Termin | null; kurse: Kurs[]; raeume: Raum[]; trainer: Trainer[]
  onSave: (d: any) => void; onCancel: () => void
}) {
  const [data, setData] = useState({
    kursId: termin?.kurs.id || kurse[0]?.id || "",
    raumId: termin?.raum.id || raeume[0]?.id || "",
    trainerId: termin?.trainer.id || trainer[0]?.id || "",
    datum: termin?.datum ? new Date(termin.datum).toISOString().split("T")[0] : "",
    uhrzeit: termin?.uhrzeit || "09:00",
    status: termin?.status || "findet_statt",
  })

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(data) }}
      className="bg-white border rounded-xl p-5 mb-4 space-y-3">
      <h3 className="font-semibold">{termin ? "Termin bearbeiten" : "Neuer Termin"}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600">Kurs</label>
          <select value={data.kursId} onChange={e => setData({...data, kursId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
            {kurse.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Raum</label>
          <select value={data.raumId} onChange={e => setData({...data, raumId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
            {raeume.map(r => <option key={r.id} value={r.id}>{r.name} ({r.kapazitaet} Plätze)</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Trainer</label>
          <select value={data.trainerId} onChange={e => setData({...data, trainerId: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
            {trainer.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Status</label>
          <select value={data.status} onChange={e => setData({...data, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="findet_statt">Findet statt</option>
            <option value="abgesagt">Abgesagt</option>
            <option value="vertretung">Vertretung</option>
            <option value="stattgefunden">Stattgefunden</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Datum</label>
          <input type="date" value={data.datum} onChange={e => setData({...data, datum: e.target.value})} required className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Uhrzeit</label>
          <input type="time" value={data.uhrzeit} onChange={e => setData({...data, uhrzeit: e.target.value})} required className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600">Abbrechen</button>
        <button type="submit" className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500]">{termin ? "Speichern" : "Anlegen"}</button>
      </div>
    </form>
  )
}
