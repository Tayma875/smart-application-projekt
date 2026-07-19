"use client"

import { useState } from "react"

interface Kurs { id: string; name: string; kategorie: string }
interface Raum { id: string; name: string; kapazitaet: number }
interface Trainer { id: string; name: string }
interface Count { buchungen: number }
interface Termin { id: string; kurs: Kurs; raum: Raum; trainer: Trainer; datum: string; uhrzeit: string; status: string; _count: Count }

const KURS_FARBEN: Record<string, string> = {
  "Yoga": "bg-emerald-100 border-emerald-300 text-emerald-800",
  "HIIT": "bg-red-100 border-red-300 text-red-800",
  "Spinning": "bg-blue-100 border-blue-300 text-blue-800",
  "Kraft": "bg-purple-100 border-purple-300 text-purple-800",
  "Pilates": "bg-pink-100 border-pink-300 text-pink-800",
  "Zumba": "bg-orange-100 border-orange-300 text-orange-800",
  "Functional Training": "bg-cyan-100 border-cyan-300 text-cyan-800",
}

function KalenderAnsicht({ termine }: { termine: Termin[] }) {
  const heute = new Date()
  const wochentage = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
  const wochenStart = new Date(heute)
  wochenStart.setHours(0, 0, 0, 0)
  const tag = wochenStart.getDay()
  wochenStart.setDate(wochenStart.getDate() - ((tag + 6) % 7))

  const tage = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(wochenStart)
    d.setDate(d.getDate() + i)
    return d
  })

  function termineFuerTag(d: Date) {
    const datumStr = d.toISOString().split("T")[0]
    return termine
      .filter(t => {
        const tDatum = new Date(t.datum).toISOString().split("T")[0]
        return tDatum === datumStr && t.status !== "abgesagt"
      })
      .sort((a, b) => a.uhrzeit.localeCompare(b.uhrzeit))
  }

  return (
    <div className="grid grid-cols-7 gap-2 mb-8">
      {tage.map((d, i) => {
        const heuteStr = new Date().toISOString().split("T")[0]
        const dStr = d.toISOString().split("T")[0]
        const istHeute = dStr === heuteStr
        const istWochenende = i >= 5
        return (
          <div key={i} className={`rounded-xl border ${istHeute ? "border-[#D4A853] ring-2 ring-[#D4A853]/20" : "border-gray-200"} bg-white`}>
            <div className={`text-center py-2 px-1 ${istHeute ? "bg-[#D4A853]/10" : istWochenende ? "bg-gray-50" : ""} rounded-t-xl`}>
              <p className="text-xs text-gray-500 font-medium">{wochentage[i]}</p>
              <p className={`text-lg font-bold ${istHeute ? "text-[#D4A853]" : "text-[#0F172A]"}`}>{d.getDate()}</p>
            </div>
            <div className="p-1.5 space-y-1 min-h-[100px]">
              {termineFuerTag(d).map(t => {
                const farbe = KURS_FARBEN[t.kurs.kategorie] || "bg-gray-100 border-gray-300 text-gray-700"
                return (
                  <div key={t.id} className={`text-xs p-1.5 rounded-lg border ${farbe} leading-tight`}>
                    <p className="font-semibold">{t.uhrzeit}</p>
                    <p className="truncate">{t.kurs.name}</p>
                    <p className="opacity-70 truncate">{t.trainer.name}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function TerminVerwaltung({ termine: initial, kurse, raeume, trainer, kalenderAnsicht }: { termine: Termin[]; kurse: Kurs[]; raeume: Raum[]; trainer: Trainer[]; kalenderAnsicht?: boolean }) {
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
      {kalenderAnsicht ? (
        <KalenderAnsicht termine={termine} />
      ) : null}

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
