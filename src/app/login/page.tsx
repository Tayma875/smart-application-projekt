import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F0F2F5]">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4A853] to-[#B8943F] flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl font-bold text-white">SF</span>
          </div>
          <h1 className="text-3xl font-bold tracking-wider text-[#0F172A]">Smart Fit</h1>
          <p className="text-[#94A3B8] mt-2 text-sm font-light">Fitnessstudio-Verwaltung</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8">
          <div className="bg-[#D4A853]/5 border border-[#D4A853]/20 text-[#B8943F] text-sm p-3 rounded-xl mb-6 text-center font-medium">
            Demo-Modus: Einfach E-Mail + beliebiges Passwort eingeben
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
