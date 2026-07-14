"use client"

import { useState } from "react"

interface Tarif {
  id: string; name: string; monatspreis: number; laufzeit: string
  buchungslimit: number | null; onlineBerechtigung: string; stornoRegel: string | null
}

export function TarifVerwaltung({ tarife: initial }: { tarife: Tarif[] }) {
  const [tarife, setTarife] = useState(initial)
  const [edit, setEdit] = useState<Tarif | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [msg, setMsg] = useState("")

  async function save(data: Partial<Tarif>, id?: string) {
    const url = id ? `/api/tarife/${id}` : "/api/tarife"
    const method = id ? "PATCH" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (!res.ok) { setMsg("Fehler"); return }
    const t = await res.json()
    if (id) setTarife(tarife.map(x => x.id === id ? t : x))
    else setTarife([...tarife, t])
    setEdit(null); setShowNew(false); setMsg("Gespeichert ✓")
    setTimeout(() => setMsg(""), 3000)
  }

  async function remove(id: string) {
    if (!confirm("Wirklich löschen?")) return
    await fetch(`/api/tarife/${id}`, { method: "DELETE" })
    setTarife(tarife.filter(x => x.id !== id))
  }

  return (
    <div>
      {msg && <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg mb-4 text-sm">{msg}</div>}

      <button onClick={() => setShowNew(true)}
        className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500] mb-4">
        + Tarif anlegen
      </button>

      {(showNew || edit) && (
        <TarifForm
          tarif={edit}
          onSave={(data) => save(data, edit?.id)}
          onCancel={() => { setEdit(null); setShowNew(false) }}
        />
      )}

      <div className="grid gap-4">
        {tarife.map(t => (
          <div key={t.id} className="bg-white border rounded-xl p-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{t.name}</h3>
              <p className="text-sm text-gray-500">{t.monatspreis}€/Monat · {t.laufzeit.replace(/_/g, " ")}</p>
              <p className="text-xs text-gray-400">
                {t.buchungslimit ? `${t.buchungslimit} Buchungen/Monat` : "Unbegrenzt"} ·
                Online: {t.onlineBerechtigung.replace(/_/g, " ")}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEdit(t)} className="text-sm text-[#76B900] hover:underline">Bearbeiten</button>
              <button onClick={() => remove(t.id)} className="text-sm text-red-500 hover:underline">Löschen</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TarifForm({ tarif, onSave, onCancel }: {
  tarif: Tarif | null; onSave: (d: any) => void; onCancel: () => void
}) {
  const [data, setData] = useState({
    name: tarif?.name || "",
    monatspreis: tarif?.monatspreis?.toString() || "",
    laufzeit: tarif?.laufzeit || "monatlich_kuendbar",
    buchungslimit: tarif?.buchungslimit?.toString() || "",
    onlineBerechtigung: tarif?.onlineBerechtigung || "kein",
    stornoRegel: tarif?.stornoRegel || "",
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onSave(data)
  }

  return (
    <form onSubmit={submit} className="bg-white border rounded-xl p-5 mb-4 space-y-3">
      <h3 className="font-semibold">{tarif ? "Tarif bearbeiten" : "Neuer Tarif"}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600">Name</label>
          <input value={data.name} onChange={e => setData({...data, name: e.target.value})}
            required className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Preis (€)</label>
          <input type="number" step="0.01" value={data.monatspreis}
            onChange={e => setData({...data, monatspreis: e.target.value})}
            required className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Laufzeit</label>
          <select value={data.laufzeit} onChange={e => setData({...data, laufzeit: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="monatlich_kuendbar">Monatlich kündbar</option>
            <option value="jahresvertrag">Jahresvertrag</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Buchungslimit</label>
          <input type="number" value={data.buchungslimit}
            onChange={e => setData({...data, buchungslimit: e.target.value})}
            placeholder="Leer = unbegrenzt"
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Online-Zugang</label>
          <select value={data.onlineBerechtigung}
            onChange={e => setData({...data, onlineBerechtigung: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="kein">Kein</option>
            <option value="videos_livestreams">Videos + Live-Streams</option>
            <option value="alles">Alles</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Stornoregel</label>
          <input value={data.stornoRegel} onChange={e => setData({...data, stornoRegel: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600">Abbrechen</button>
        <button type="submit" className="bg-[#76B900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4A7500]">
          {tarif ? "Speichern" : "Anlegen"}
        </button>
      </div>
    </form>
  )
}
