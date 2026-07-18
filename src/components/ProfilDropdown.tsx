"use client"

import { useState, useRef, useEffect } from "react"
import { signOut } from "next-auth/react"

interface ProfilDropdownProps {
  email: string
  rolle: string
  vorname: string | null
  nachname: string | null
}

export default function ProfilDropdown({ email, rolle, vorname, nachname }: ProfilDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const anzeigeName = vorname && nachname ? vorname : "Lisa"

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#D4A853] font-medium transition-colors duration-200"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4A853] to-[#B8943F] flex items-center justify-center">
          <span className="text-xs font-bold text-white">{anzeigeName[0]}</span>
        </div>
        <span>{anzeigeName}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 p-5">
          <div className="flex items-center gap-4 mb-5 pb-4 border-b border-[#F1F5F9]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A853] to-[#B8943F] flex items-center justify-center">
              <span className="text-lg font-bold text-white">{vorname ? vorname[0] : "L"}{nachname ? nachname[0] : ""}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">{vorname && nachname ? `${vorname} ${nachname}` : "Lisa"}</p>
              <p className="text-xs text-[#94A3B8]">{email}</p>
            </div>
          </div>

          <div className="space-y-1 text-sm text-[#64748B] mb-5">
            <div className="flex justify-between py-1.5">
              <span className="text-[#94A3B8]">Rolle</span>
              <span className="text-[#0F172A] font-medium">{rolle}</span>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="w-full text-center py-2.5 text-sm font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors duration-200"
          >
            Abmelden
          </button>
        </div>
      )}
    </div>
  )
}
