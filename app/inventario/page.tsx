"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { deleteMachine, fetchMachines } from "@/lib/store"
import type { Machine } from "@/lib/store"
import {
  Truck,
  Search,
  PlusCircle,
  Trash2,
  Pencil,
  Eye,
  Filter,
} from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value)
}

const statusMap = {
  no_vendido: { label: "Disponible", class: "bg-muted text-muted-foreground" },
  en_negociacion: { label: "Negociacion", class: "bg-primary/15 text-primary" },
  vendido: { label: "Vendido", class: "bg-emerald-500/15 text-emerald-600" },
}

export default function InventarioPage() {
  const { data: machines = [], mutate, isLoading } = useSWR<Machine[]>("/api/machines", fetchMachines)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = machines.filter((m) => {
    const matchSearch =
      m.item.toLowerCase().includes(search.toLowerCase()) ||
      m.itemNumber.toLowerCase().includes(search.toLowerCase()) ||
      m.serial.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || m.saleStatus === statusFilter
    return matchSearch && matchStatus
  })

  async function handleDelete(id: string) {
    try {
      await deleteMachine(id)
      await mutate()
      toast.success("Maquinaria eliminada correctamente")
    } catch {
      toast.error("Error al eliminar maquinaria")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl text-balance">
            Inventario
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {machines.length} maquinarias registradas
          </p>
        </div>
        <Link
          href="/nueva-maquina"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
        >
          <PlusCircle className="h-4 w-4" />
          Nueva Maquina
        </Link>
      </div>

      {/* Filters */}
      <div className="animate-fade-in-up flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "50ms" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, numero, serial o ubicacion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 appearance-none rounded-lg border border-input bg-card pl-10 pr-8 text-sm text-card-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="all">Todos los estados</option>
            <option value="no_vendido">Disponible</option>
            <option value="en_negociacion">En Negociacion</option>
            <option value="vendido">Vendido</option>
          </select>
        </div>
      </div>

      {/* Machine Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((machine, i) => {
          const totalExpenses = machine.expenses.reduce((s, e) => s + e.amount, 0)
          const totalCost = machine.cost + machine.transport + totalExpenses
          const status = statusMap[machine.saleStatus]
          const profit = machine.saleStatus === "vendido" ? machine.salePrice - totalCost : null

          return (
            <div
              key={machine.id}
              className="animate-fade-in-up group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              style={{ animationDelay: `${(i % 6) * 50 + 100}ms` }}
            >
              {/* Photo area */}
              <div className="relative flex h-40 items-center justify-center bg-muted/50">
                {machine.photo ? (
                  <img
                    src={machine.photo}
                    alt={machine.item}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Truck className="h-12 w-12 text-muted-foreground/30" />
                )}
                <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.class}`}>
                  {status.label}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-card-foreground truncate">{machine.item}</p>
                  <p className="text-xs text-muted-foreground">
                    {machine.itemNumber} &middot; {machine.serial}
                  </p>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Costo Total</p>
                    <p className="text-sm font-bold text-card-foreground">{formatCurrency(totalCost)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {machine.saleStatus === "vendido" ? "Ganancia" : "Precio Min."}
                    </p>
                    <p className={`text-sm font-bold ${profit !== null ? (profit >= 0 ? "text-emerald-600" : "text-red-500") : "text-card-foreground"}`}>
                      {profit !== null
                        ? formatCurrency(profit)
                        : formatCurrency(totalCost * 1.4)}
                    </p>
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{machine.location}</span>
                  <span>&middot;</span>
                  <span>{machine.hours}h</span>
                  <span>&middot;</span>
                  <span>{machine.expenses.length} gastos</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/maquina/${machine.id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver
                  </Link>
                  <Link
                    href={`/maquina/${machine.id}/editar`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex items-center justify-center rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar maquinaria</AlertDialogTitle>
                        <AlertDialogDescription>
                          {'Esta accion no se puede deshacer. Se eliminara permanentemente '}
                          <strong>{machine.item}</strong>
                          {' y todos sus gastos asociados.'}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(machine.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Hover accent */}
              <div className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-primary/40 transition-transform duration-500 group-hover:scale-x-100" />
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="animate-fade-in flex flex-col items-center gap-3 py-20 text-center">
          <div className="rounded-full bg-muted p-4">
            <Truck className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {search || statusFilter !== "all"
              ? "No se encontraron maquinarias con esos filtros"
              : "No hay maquinarias registradas"}
          </p>
          {!search && statusFilter === "all" && (
            <Link
              href="/nueva-maquina"
              className="text-sm font-medium text-primary hover:underline"
            >
              Agregar primera maquinaria
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
