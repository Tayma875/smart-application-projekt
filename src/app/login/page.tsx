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
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
