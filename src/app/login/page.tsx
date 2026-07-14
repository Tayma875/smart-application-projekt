import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#76B900]">Smart Fit</h1>
          <p className="text-gray-500 mt-2">Fitnessstudio-Verwaltung</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
