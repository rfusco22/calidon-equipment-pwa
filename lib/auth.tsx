"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  user: string | null
  login: (username: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const VALID_USER = "callidon"
const VALID_PASS = "1"
const AUTH_KEY = "callidon_auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_KEY)
    if (stored === VALID_USER) {
      setIsAuthenticated(true)
      setUser(stored)
    }
    setIsLoading(false)
  }, [])

  const login = useCallback((username: string, password: string) => {
    if (username.toLowerCase().trim() === VALID_USER && password === VALID_PASS) {
      sessionStorage.setItem(AUTH_KEY, VALID_USER)
      setIsAuthenticated(true)
      setUser(VALID_USER)
      return { success: true }
    }
    return { success: false, error: "Usuario o contrasena incorrecta" }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY)
    setIsAuthenticated(false)
    setUser(null)
    window.location.href = "/"
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
