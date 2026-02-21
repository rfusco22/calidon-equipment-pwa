"use client"

import useSWR from "swr"
import { fetchMachines, getDashboardStats, getMonthlyData } from "@/lib/store"
import type { Machine } from "@/lib/store"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  DollarSign,
  Truck,
  Download,
  BarChart3,
  PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value)
}

const COLORS = ["oklch(0.75 0.16 55)", "oklch(0.55 0.08 55)", "oklch(0.4 0 0)", "oklch(0.65 0.12 55)"]

export default function ReportesPage() {
  const { data: machines = [], isLoading } = useSWR<Machine[]>("/api/machines", fetchMachines)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const stats = getDashboardStats(machines)
  const monthlyData = getMonthlyData(machines)

  // Top profitable machines
  const soldMachines = machines
    .filter((m) => m.saleStatus === "vendido")
    .map((m) => {
      const totalCost = m.cost + m.transport + m.expenses.reduce((s, e) => s + e.amount, 0)
      return { ...m, totalCost, profit: m.salePrice - totalCost, margin: ((m.salePrice - totalCost) / totalCost) * 100 }
    })
    .sort((a, b) => b.profit - a.profit)

  // Expense breakdown
  const expensesByCategory: Record<string, number> = {}
  machines.forEach((m) => {
    m.expenses.forEach((e) => {
      const cat = e.description.split(" ")[0] || "Otro"
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + e.amount
    })
  })
  const expensePieData = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }))

  // Location breakdown
  const byLocation: Record<string, number> = {}
  machines.forEach((m) => {
    const loc = m.location || "Sin ubicacion"
    byLocation[loc] = (byLocation[loc] || 0) + 1
  })
  const locationData = Object.entries(byLocation).map(([name, value]) => ({ name, value }))

  // Export CSV
  function exportCSV() {
    const headers = ["Item", "Item#", "Serial", "Fecha Compra", "Costo", "Transporte", "Total Gastos", "Costo Total", "Precio Venta", "Ganancia", "Estado", "Ubicacion"]
    const rows = machines.map((m) => {
      const expTotal = m.expenses.reduce((s, e) => s + e.amount, 0)
      const total = m.cost + m.transport + expTotal
      const profit = m.saleStatus === "vendido" ? m.salePrice - total : 0
      return [m.item, m.itemNumber, m.serial, m.purchaseDate, m.cost, m.transport, expTotal, total, m.salePrice, profit, m.saleStatus, m.location]
    })
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `callidon-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl text-balance">
            Reportes Financieros
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Analisis detallado del rendimiento
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="animate-fade-in-up grid grid-cols-2 gap-4 lg:grid-cols-4" style={{ animationDelay: "50ms" }}>
        <SummaryCard
          label="Inversion Total"
          value={formatCurrency(stats.totalInvestment)}
          icon={DollarSign}
        />
        <SummaryCard
          label="Ingresos Totales"
          value={formatCurrency(stats.totalRevenue)}
          icon={TrendingUp}
        />
        <SummaryCard
          label="Ganancia Neta"
          value={formatCurrency(stats.totalProfit)}
          icon={stats.totalProfit >= 0 ? ArrowUpRight : ArrowDownRight}
          positive={stats.totalProfit >= 0}
        />
        <SummaryCard
          label="Valor Inventario"
          value={formatCurrency(stats.inventoryValue)}
          icon={Truck}
        />
      </div>

      {/* Revenue & Profit Trend */}
      <div className="animate-fade-in-up rounded-xl border border-border bg-card p-5" style={{ animationDelay: "100ms" }}>
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-card-foreground">Tendencia de Ingresos y Ganancias</h2>
        </div>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.4 0 0)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.4 0 0)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.75 0.16 55)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.75 0.16 55)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "oklch(0.5 0 0)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.5 0 0)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "oklch(0.14 0 0)", border: "1px solid oklch(0.22 0 0)", borderRadius: "8px", color: "oklch(0.95 0 0)", fontSize: "12px" }}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Area type="monotone" dataKey="investment" name="Inversion" stroke="oklch(0.4 0 0)" fill="url(#colorInvestment)" strokeWidth={2} />
              <Area type="monotone" dataKey="revenue" name="Ingresos" stroke="oklch(0.75 0.16 55)" fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">No hay datos mensuales</div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expense Breakdown */}
        <div className="animate-fade-in-up rounded-xl border border-border bg-card p-5" style={{ animationDelay: "150ms" }}>
          <div className="mb-4 flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-card-foreground">Distribucion de Gastos</h2>
          </div>
          {expensePieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value" strokeWidth={0}>
                    {expensePieData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "oklch(0.14 0 0)", border: "1px solid oklch(0.22 0 0)", borderRadius: "8px", color: "oklch(0.95 0 0)", fontSize: "12px" }}
                    formatter={(value: number) => [formatCurrency(value)]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-2">
                {expensePieData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                    <span className="font-mono font-medium text-card-foreground">{formatCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">No hay gastos registrados</div>
          )}
        </div>

        {/* Location chart */}
        <div className="animate-fade-in-up rounded-xl border border-border bg-card p-5" style={{ animationDelay: "200ms" }}>
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-card-foreground">Maquinas por Ubicacion</h2>
          </div>
          {locationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={locationData} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 0.1)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "oklch(0.5 0 0)" }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: "oklch(0.5 0 0)" }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip
                  contentStyle={{ background: "oklch(0.14 0 0)", border: "1px solid oklch(0.22 0 0)", borderRadius: "8px", color: "oklch(0.95 0 0)", fontSize: "12px" }}
                />
                <Bar dataKey="value" name="Maquinas" fill="oklch(0.75 0.16 55)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">No hay datos</div>
          )}
        </div>
      </div>

      {/* Top Profitable Machines */}
      {soldMachines.length > 0 && (
        <div className="animate-fade-in-up rounded-xl border border-border bg-card" style={{ animationDelay: "250ms" }}>
          <div className="border-b border-border p-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-card-foreground">Maquinas Mas Rentables</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Maquina</th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Costo Total</th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Venta</th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Ganancia</th>
                  <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {soldMachines.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-accent/30">
                    <td className="px-5 py-3">
                      <p className="font-medium text-card-foreground">{m.item}</p>
                      <p className="text-xs text-muted-foreground">{m.itemNumber}</p>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-muted-foreground">{formatCurrency(m.totalCost)}</td>
                    <td className="px-5 py-3 text-right font-mono text-card-foreground">{formatCurrency(m.salePrice)}</td>
                    <td className={`px-5 py-3 text-right font-mono font-bold ${m.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {formatCurrency(m.profit)}
                    </td>
                    <td className={`px-5 py-3 text-right font-mono font-medium ${m.margin >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {m.margin.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  positive,
}: {
  label: string
  value: string
  icon: React.ElementType
  positive?: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className={`rounded-lg p-1.5 ${positive !== undefined ? (positive ? "bg-emerald-500/10" : "bg-red-500/10") : "bg-primary/10"}`}>
          <Icon className={`h-3.5 w-3.5 ${positive !== undefined ? (positive ? "text-emerald-600" : "text-red-500") : "text-primary"}`} />
        </div>
      </div>
      <p className="mt-2 text-lg font-bold tracking-tight text-card-foreground">{value}</p>
    </div>
  )
}
