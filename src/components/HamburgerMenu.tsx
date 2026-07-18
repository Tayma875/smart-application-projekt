"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"

interface NavItem {
  title: string
  href: string
  icon: string
}

interface HamburgerMenuProps {
  items: NavItem[]
}

export default function HamburgerMenu({ items }: HamburgerMenuProps) {
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[#94A3B8] hover:text-[#D4A853] transition-colors duration-200"
        aria-label="Menü"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-60 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 p-2">
          <div className="px-4 py-3 border-b border-[#F1F5F9]">
            <p className="text-xs font-medium text-[#94A3B8] tracking-wider uppercase">Navigation</p>
          </div>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#475569] hover:bg-[#F0F2F5] hover:text-[#D4A853] transition-all duration-200"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
