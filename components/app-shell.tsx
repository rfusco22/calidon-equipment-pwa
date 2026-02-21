"use client"

import { AppSidebar } from "./app-sidebar"
import { MobileNav } from "./mobile-nav"
import { Toaster } from "@/components/ui/sonner"
import { useEffect } from "react"
import { useServiceWorker } from "@/hooks/use-service-worker"
import { AuthProvider, useAuth } from "@/lib/auth"
import { usePathname, useRouter } from "next/navigation"

function AppContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === "/"

  // Redirect unauthenticated users to login (except if already on login)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace("/")
    }
  }, [isLoading, isAuthenticated, isLoginPage, router])

  // Login page: render children directly (no sidebar/nav)
  if (isLoginPage) {
    return (
      <>
        {children}
        <Toaster position="top-right" richColors />
      </>
    )
  }

  // Loading state for protected routes
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Not authenticated on a protected route - will be redirected
  if (!isAuthenticated) {
    return null
  }

  // Authenticated: show full app shell
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <main className="min-h-screen transition-all duration-300 md:pl-[260px]">
        <div className="mx-auto max-w-7xl px-4 py-6 pb-20 md:px-8 md:py-8 md:pb-8">
          {children}
        </div>
      </main>
      <MobileNav />
      <Toaster position="top-right" richColors />
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  useServiceWorker()

  return (
    <AuthProvider>
      <AppContent>{children}</AppContent>
    </AuthProvider>
  )
}
