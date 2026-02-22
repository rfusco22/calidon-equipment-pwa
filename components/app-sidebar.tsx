"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard,
  Truck,
  PlusCircle,
  BarChart3,
  ChevronLeft,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useAuth } from "@/lib/auth"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventario", label: "Inventario", icon: Truck },
  { href: "/nueva-maquina", label: "Nueva Maquina", icon: PlusCircle },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { logout, user } = useAuth()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-4">
        {collapsed ? (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden">
            <Image
              src="/images/callidon-logo.png"
              alt="Callidon Equipment"
              fill
              className="object-contain"
              priority
            />
          </div>
        ) : (
          <div className="relative h-10 w-44 animate-fade-in">
            <Image
              src="/images/callidon-logo.png"
              alt="Callidon Equipment"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50"
                )}
              />
              {!collapsed && (
                <span className="animate-fade-in truncate">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User & Actions */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        {/* User info */}
        {!collapsed && (
          <div className="animate-fade-in mb-2 rounded-lg bg-sidebar-accent px-3 py-2">
            <p className="text-xs font-semibold text-sidebar-foreground capitalize">{user}</p>
            <p className="text-[10px] text-sidebar-foreground/50">Administrador</p>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/50 transition-colors hover:bg-destructive/15 hover:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="animate-fade-in">Cerrar Sesion</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span className="animate-fade-in">Colapsar</span>}
        </button>
      </div>
    </aside>
  )
}

export function useSidebarWidth() {
  return { expanded: "pl-[260px]", collapsed: "pl-[72px]" }
}
