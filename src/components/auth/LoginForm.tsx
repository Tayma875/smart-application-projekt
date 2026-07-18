"use client"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Ungültige E-Mail oder Passwort")
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#475569] mb-1.5">
          E-Mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-4 py-2.5 bg-[#F0F2F5] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40 focus:border-[#D4A853] transition-all duration-200 placeholder:text-[#CBD5E1] text-[#0F172A]"
          placeholder="max@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#475569] mb-1.5">
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full px-4 py-2.5 bg-[#F0F2F5] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A853]/40 focus:border-[#D4A853] transition-all duration-200 placeholder:text-[#CBD5E1] text-[#0F172A]"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 border border-red-100 p-3 rounded-xl">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#D4A853] to-[#B8943F] text-white py-2.5 px-4 rounded-xl hover:from-[#C49A4A] hover:to-[#A88535] transition-all duration-200 disabled:opacity-50 font-medium tracking-wide"
      >
        {loading ? "Anmelden..." : "Anmelden"}
      </button>
    </form>
  )
}
