"use client"

import useSWR from "swr"
import {
  Truck,
  DollarSign,
  TrendingUp,
  Package,
  Handshake,
  BarChart3,
} from "lucide-react"
import { KPICard } from "@/components/kpi-card"
import { getDashboardStats, getMonthlyData, fetchMachines } from "@/lib/store"
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
} from "recharts"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const STATUS_COLORS = ["oklch(0.75 0.16 55)", "oklch(0.55 0.08 55)", "oklch(0.4 0 0)"]

export default function DashboardPage() {
  const { data: machines = [], isLoading, error } = useSWR<Machine[]>("/api/machines", fetchMachines)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-destructive font-medium">Error cargando datos</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const stats = getDashboardStats(machines)
  const monthlyData = getMonthlyData(machines)
  const recentMachines = [...machines].slice(0, 5)

  const pieData = [
    { name: "Vendidos", value: stats.soldMachines },
    { name: "En Negociacion", value: stats.inNegotiation },
    { name: "Disponibles", value: stats.available },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl text-balance">
          Panel de Control
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vista general de Callidon Equipment
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          title="Total Maquinas"
          value={stats.totalMachines.toString()}
          subtitle={`${stats.available} disponibles`}
          icon={Truck}
          delay={50}
        />
        <KPICard
          title="Inversion Total"
          value={formatCurrency(stats.totalInvestment)}
          subtitle="Costo + gastos"
          icon={Package}
          delay={100}
        />
        <KPICard
          title="Ingresos"
          value={formatCurrency(stats.totalRevenue)}
          subtitle={`${stats.soldMachines} vendidas`}
          icon={DollarSign}
          delay={150}
        />
        <KPICard
          title="Ganancia Neta"
          value={formatCurrency(stats.totalProfit)}
          trend={stats.totalProfit >= 0 ? "up" : "down"}
          trendValue={`${stats.totalInvestment > 0 ? ((stats.totalProfit / stats.totalInvestment) * 100).toFixed(1) : 0}%`}
          icon={TrendingUp}
          delay={200}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bar Chart */}
        <div className="animate-fade-in-up rounded-xl border border-border bg-card p-5 lg:col-span-2" style={{ animationDelay: "250ms" }}>
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-card-foreground">Rendimiento Mensual</h2>
          </div>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 0.1)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "oklch(0.5 0 0)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.5 0 0)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.14 0 0)",
                    border: "1px solid oklch(0.22 0 0)",
                    borderRadius: "8px",
                    color: "oklch(0.95 0 0)",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [formatCurrency(value)]}
                />
                <Bar dataKey="investment" name="Inversion" fill="oklch(0.4 0 0)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" name="Ingresos" fill="oklch(0.75 0.16 55)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No hay datos disponibles
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="animate-fade-in-up rounded-xl border border-border bg-card p-5" style={{ animationDelay: "300ms" }}>
          <div className="mb-4 flex items-center gap-2">
            <Handshake className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-card-foreground">Estado de Ventas</h2>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.14 0 0)",
                      border: "1px solid oklch(0.22 0 0)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0 0)",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-2">
                {pieData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: STATUS_COLORS[i] }}
                      />
                      <span className="text-muted-foreground">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-card-foreground">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No hay datos
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="animate-fade-in-up rounded-xl border border-border bg-card" style={{ animationDelay: "350ms" }}>
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-sm font-semibold text-card-foreground">Maquinarias Recientes</h2>
          <a href="/inventario" className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
            Ver todas
          </a>
        </div>
        <div className="divide-y divide-border">
          {recentMachines.map((machine) => {
            const totalCost = machine.cost + machine.transport + machine.expenses.reduce((s, e) => s + e.amount, 0)
            return (
              <a
                key={machine.id}
                href={`/maquina/${machine.id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-accent/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-card-foreground">{machine.item}</p>
                  <p className="text-xs text-muted-foreground">
                    {machine.itemNumber} &middot; {machine.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-card-foreground">{formatCurrency(totalCost)}</p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      machine.saleStatus === "vendido"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : machine.saleStatus === "en_negociacion"
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {machine.saleStatus === "vendido"
                      ? "Vendido"
                      : machine.saleStatus === "en_negociacion"
                      ? "Negociacion"
                      : "Disponible"}
                  </span>
                </div>
              </a>
            )
          })}
          {recentMachines.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No hay maquinarias registradas
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
