"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Truck, PlusCircle, BarChart3, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/inventario", label: "Inventario", icon: Truck },
  { href: "/nueva-maquina", label: "Nueva", icon: PlusCircle },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
]

export function MobileNav() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span>{item.label}</span>
              {isActive && (
                <div className="h-0.5 w-4 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          <span>Salir</span>
        </button>
      </div>
    </nav>
  )
}
