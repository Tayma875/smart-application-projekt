"use client"

import { useState } from "react"
import { MitgliedAnlegen } from "./MitgliedAnlegen"
import { MitgliedBearbeiten } from "./MitgliedBearbeiten"

interface Mitglied {
  id: string
  vorname: string
  nachname: string
  email: string
  telefon: string | null
  status: string
  zahlungsstatus: string
  tarif: { id: string; name: string; monatspreis: number }
  geburtsdatum: string | null
  noShowZaehler: number
  gesperrtBis?: string | null
}

interface Tarif {
  id: string
  name: string
  monatspreis: number
}

export function MitgliederListe({ mitglieder, tarife }: { mitglieder: Mitglied[]; tarife: Tarif[] }) {
  const [showAnlegen, setShowAnlegen] = useState(false)
  const [bearbeite, setBearbeite] = useState<Mitglied | null>(null)
  const [list, setList] = useState(mitglieder)

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      aktiv: "bg-green-100 text-green-800",
      pausiert: "bg-yellow-100 text-yellow-800",
      gekuendigt: "bg-red-100 text-red-800",
      zahlung_ausstehend: "bg-orange-100 text-orange-800",
    }
    return colors[status] || "bg-gray-100"
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{list.length} Mitglieder</p>
        <button
          onClick={() => setShowAnlegen(true)}
          className="bg-[#76B900] text-white px-4 py-2 rounded-lg hover:bg-[#4A7500] transition-colors text-sm"
        >
          + Mitglied anlegen
        </button>
      </div>

      {showAnlegen && (
        <MitgliedAnlegen
          tarife={tarife}
          onClose={() => setShowAnlegen(false)}
          onCreated={(m) => setList([...list, m])}
        />
      )}

      {bearbeite && (
        <MitgliedBearbeiten
          mitglied={bearbeite}
          tarife={tarife}
          onClose={() => setBearbeite(null)}
          onUpdated={(m) => setList(list.map((x) => (x.id === m.id ? m : x)))}
        />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">E-Mail</th>
              <th className="pb-3 font-medium">Tarif</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Zahlung</th>
              <th className="pb-3 font-medium">No-Shows</th>
              <th className="pb-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} className="border-b hover:bg-gray-50">
                <td className="py-3">{m.vorname} {m.nachname}</td>
                <td className="py-3 text-gray-500">{m.email}</td>
                <td className="py-3">{m.tarif.name}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(m.status)}`}>
                    {m.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.zahlungsstatus === "ok" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {m.zahlungsstatus}
                  </span>
                </td>
                <td className="py-3">{m.noShowZaehler}x</td>
                <td className="py-3">
                  <button onClick={() => setBearbeite(m)} className="text-[#76B900] hover:underline text-xs">
                    Bearbeiten
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
