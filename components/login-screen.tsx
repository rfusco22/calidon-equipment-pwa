"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react"
import Image from "next/image"

export function LoginScreen() {
  const { login } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shake, setShake] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Small delay for visual feedback
    await new Promise((r) => setTimeout(r, 600))

    const result = login(username, password)
    if (result.success) {
      router.replace("/dashboard")
      return
    }
    setError(result.error || "Error de autenticacion")
    setShake(true)
    setTimeout(() => setShake(false), 500)
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Logo & Header */}
        <div className="mb-10 flex flex-col items-center animate-fade-in-up">
          <div className="relative mb-6 h-20 w-64">
            <Image
              src="/images/callidon-logo.png"
              alt="Callidon Equipment"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Panel de Administracion
          </p>
        </div>

        {/* Login Card */}
        <div
          className={`animate-fade-in-up rounded-2xl border border-border bg-card p-8 shadow-xl shadow-foreground/5 ${
            shake ? "animate-shake" : ""
          }`}
          style={{ animationDelay: "100ms" }}
        >
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-card-foreground">
              Iniciar Sesion
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-xs font-medium text-muted-foreground"
              >
                Usuario
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError("")
                }}
                placeholder="Ingresa tu usuario"
                className="flex h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-medium text-muted-foreground"
              >
                Contrasena
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  placeholder="Ingresa tu contrasena"
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-4 pr-11 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="animate-fade-in rounded-lg bg-destructive/10 px-4 py-2.5">
                <p className="text-xs font-medium text-destructive">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !username || !password}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Ingresar</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="animate-fade-in-up mt-8 text-center" style={{ animationDelay: "200ms" }}>
          <p className="text-[11px] text-muted-foreground/60">
            Callidon Equipment &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
