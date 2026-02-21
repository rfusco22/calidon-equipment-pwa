"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import { deleteMachine, fetchMachine } from "@/lib/store"
import type { Machine } from "@/lib/store"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Truck,
  MapPin,
  Clock,
  User,
  Hash,
  Calendar,
  DollarSign,
  Calculator,
  ImageIcon,
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
    minimumFractionDigits: 2,
  }).format(value)
}

const statusMap = {
  no_vendido: { label: "Disponible", class: "bg-muted text-muted-foreground" },
  en_negociacion: { label: "En Negociacion", class: "bg-primary/15 text-primary" },
  vendido: { label: "Vendido", class: "bg-emerald-500/15 text-emerald-600" },
}

export default function MachineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { data: machine, isLoading, error } = useSWR<Machine>(
    id ? `/api/machines/${id}` : null,
    fetchMachine
  )

  if (error) {
    router.push("/inventario")
    return null
  }

  if (isLoading || !machine) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const expensesTotal = machine.expenses.reduce((s, e) => s + e.amount, 0)
  const totalCost = machine.cost + machine.transport + expensesTotal
  const status = statusMap[machine.saleStatus]
  const profit40 = totalCost * 0.4
  const minSalePrice = totalCost + profit40

  async function handleDelete() {
    try {
      await deleteMachine(machine!.id)
      toast.success("Maquinaria eliminada")
      router.push("/inventario")
    } catch {
      toast.error("Error al eliminar maquinaria")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/inventario"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">{machine.item}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.class}`}>
                {status.label}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {machine.itemNumber} &middot; {machine.serial}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/maquina/${machine.id}/editar`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20">
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar maquinaria</AlertDialogTitle>
                <AlertDialogDescription>
                  {'Esta accion no se puede deshacer. Se eliminara permanentemente '}
                  <strong>{machine.item}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo */}
          <div className="animate-fade-in-up overflow-hidden rounded-xl border border-border bg-card">
            {machine.photo ? (
              <img src={machine.photo} alt={machine.item} className="h-64 w-full object-cover sm:h-80" />
            ) : (
              <div className="flex h-64 items-center justify-center bg-muted/30 sm:h-80">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-12 w-12" />
                  <span className="text-sm">Sin foto</span>
                </div>
              </div>
            )}
          </div>

          {/* Info Grid */}
          <div className="animate-fade-in-up grid gap-4 sm:grid-cols-2" style={{ animationDelay: "50ms" }}>
            <InfoCard icon={Calendar} label="Fecha de Compra" value={machine.purchaseDate} />
            <InfoCard icon={User} label="Comprado por" value={machine.purchasedBy || "---"} />
            <InfoCard icon={Hash} label="Numero de Item" value={machine.itemNumber} />
            <InfoCard icon={Hash} label="Serial" value={machine.serial || "---"} />
            <InfoCard icon={Clock} label="Horas" value={machine.hours || "---"} />
            <InfoCard icon={MapPin} label="Ubicacion" value={machine.location || "---"} />
          </div>

          {/* Observations */}
          {machine.observations && (
            <div className="animate-fade-in-up rounded-xl border border-border bg-card p-5" style={{ animationDelay: "100ms" }}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Observaciones</h3>
              <p className="text-sm leading-relaxed text-card-foreground">{machine.observations}</p>
            </div>
          )}

          {/* Expenses */}
          <div className="animate-fade-in-up rounded-xl border border-border bg-card" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-card-foreground">
                  Gastos del Equipo ({machine.expenses.length})
                </h2>
              </div>
            </div>
            {machine.expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Fecha</th>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Descripcion</th>
                      <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {machine.expenses.map((e) => (
                      <tr key={e.id} className="transition-colors hover:bg-accent/30">
                        <td className="px-5 py-3 text-muted-foreground">{e.date}</td>
                        <td className="px-5 py-3 text-card-foreground">{e.description}</td>
                        <td className="px-5 py-3 text-right font-mono font-medium text-card-foreground">{formatCurrency(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border bg-muted/30">
                      <td colSpan={2} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Total Gastos
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-primary">{formatCurrency(expensesTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="p-5 text-center text-sm text-muted-foreground">No hay gastos registrados</p>
            )}
          </div>
        </div>

        {/* Right side: Financial Summary */}
        <div className="space-y-6">
          <div className="animate-fade-in-up rounded-xl border border-border bg-card p-5" style={{ animationDelay: "100ms" }}>
            <div className="mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-card-foreground">Resumen Financiero</h2>
            </div>
            <div className="space-y-3">
              <SummaryRow label="Costo Item" value={machine.cost} />
              <SummaryRow label="Transporte" value={machine.transport} />
              <SummaryRow label="Total Gastos" value={expensesTotal} />
              <div className="border-t border-border pt-3">
                <SummaryRow label="Costo Total" value={totalCost} bold />
              </div>
              <SummaryRow label="Ganancia (40%)" value={profit40} accent />
              <SummaryRow label="Precio Venta Min." value={minSalePrice} bold accent />
              {machine.saleStatus === "vendido" && (
                <>
                  <div className="border-t border-border pt-3">
                    <SummaryRow label="Precio Venta Real" value={machine.salePrice} bold />
                  </div>
                  <SummaryRow
                    label="Ganancia Real"
                    value={machine.salePrice - totalCost}
                    bold
                    profit={machine.salePrice - totalCost >= 0}
                  />
                </>
              )}
            </div>
          </div>

          <div className="animate-fade-in-up rounded-xl border border-border bg-card p-5" style={{ animationDelay: "150ms" }}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Informacion del Sistema</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Creado: {new Date(machine.createdAt).toLocaleDateString("es-ES")}</p>
              <p>Actualizado: {new Date(machine.updatedAt).toLocaleDateString("es-ES")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm">
      <div className="rounded-lg bg-primary/10 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-card-foreground">{value}</p>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  bold = false,
  accent = false,
  profit,
}: {
  label: string
  value: number
  bold?: boolean
  accent?: boolean
  profit?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${bold ? "font-semibold text-card-foreground" : "text-muted-foreground"}`}>{label}</span>
      <span
        className={`font-mono text-sm ${bold ? "font-bold" : "font-medium"} ${
          profit !== undefined ? (profit ? "text-emerald-600" : "text-red-500") : accent ? "text-primary" : "text-card-foreground"
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  )
}
