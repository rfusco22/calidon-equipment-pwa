// Types
export interface Expense {
  id: string
  date: string
  description: string
  amount: number
}

export interface Machine {
  id: string
  item: string
  purchaseDate: string
  purchasedBy: string
  itemNumber: string
  serial: string
  hours: string
  cost: number
  transport: number
  location: string
  observations: string
  saleStatus: "no_vendido" | "vendido" | "en_negociacion"
  photo: string | null
  expenses: Expense[]
  salePrice: number
  createdAt: string
  updatedAt: string
}

export type MachineFormData = Omit<Machine, "id" | "createdAt" | "updatedAt">

// API fetchers (for SWR)
export const fetchMachines = async (url: string): Promise<Machine[]> => {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to fetch machines: ${res.status} ${body}`)
  }
  return res.json()
}

export const fetchMachine = async (url: string): Promise<Machine> => {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to fetch machine: ${res.status} ${body}`)
  }
  return res.json()
}

// Mutation helpers
export async function addMachine(data: MachineFormData): Promise<Machine> {
  const res = await fetch("/api/machines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create machine")
  return res.json()
}

export async function updateMachine(id: string, data: Partial<MachineFormData>): Promise<Machine> {
  const res = await fetch(`/api/machines/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update machine")
  return res.json()
}

export async function deleteMachine(id: string): Promise<boolean> {
  const res = await fetch(`/api/machines/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete machine")
  return true
}

export async function addExpense(machineId: string, expense: Omit<Expense, "id">): Promise<Expense> {
  const res = await fetch(`/api/machines/${machineId}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  })
  if (!res.ok) throw new Error("Failed to add expense")
  return res.json()
}

export async function removeExpense(machineId: string, expenseId: string): Promise<boolean> {
  const res = await fetch(`/api/machines/${machineId}/expenses/${expenseId}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to remove expense")
  return true
}

export async function updateExpense(machineId: string, expenseId: string, data: Partial<Omit<Expense, "id">>): Promise<boolean> {
  const res = await fetch(`/api/machines/${machineId}/expenses/${expenseId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update expense")
  return true
}

export async function seedDemoData(): Promise<void> {
  await fetch("/api/seed", { method: "POST" })
}

// Dashboard calculations (computed client-side from machines array)
export function getDashboardStats(machines: Machine[]) {
  const totalMachines = machines.length
  const soldMachines = machines.filter((m) => m.saleStatus === "vendido").length
  const inNegotiation = machines.filter((m) => m.saleStatus === "en_negociacion").length
  const available = machines.filter((m) => m.saleStatus === "no_vendido").length

  const totalInvestment = machines.reduce((sum, m) => {
    const expenseTotal = m.expenses.reduce((s, e) => s + e.amount, 0)
    return sum + m.cost + m.transport + expenseTotal
  }, 0)

  const totalRevenue = machines
    .filter((m) => m.saleStatus === "vendido")
    .reduce((sum, m) => sum + m.salePrice, 0)

  const totalCostsSold = machines
    .filter((m) => m.saleStatus === "vendido")
    .reduce((sum, m) => {
      const expenseTotal = m.expenses.reduce((s, e) => s + e.amount, 0)
      return sum + m.cost + m.transport + expenseTotal
    }, 0)

  const totalProfit = totalRevenue - totalCostsSold

  const inventoryValue = machines
    .filter((m) => m.saleStatus !== "vendido")
    .reduce((sum, m) => {
      const expenseTotal = m.expenses.reduce((s, e) => s + e.amount, 0)
      return sum + m.cost + m.transport + expenseTotal
    }, 0)

  return {
    totalMachines,
    soldMachines,
    inNegotiation,
    available,
    totalInvestment,
    totalRevenue,
    totalProfit,
    inventoryValue,
  }
}

export function getMonthlyData(machines: Machine[]) {
  const monthMap: Record<string, { investment: number; revenue: number; profit: number }> = {}

  machines.forEach((m) => {
    const month = m.purchaseDate.slice(0, 7)
    if (!monthMap[month]) monthMap[month] = { investment: 0, revenue: 0, profit: 0 }
    const totalCost = m.cost + m.transport + m.expenses.reduce((s, e) => s + e.amount, 0)
    monthMap[month].investment += totalCost
    if (m.saleStatus === "vendido") {
      monthMap[month].revenue += m.salePrice
      monthMap[month].profit += m.salePrice - totalCost
    }
  })

  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("es-ES", { month: "short", year: "2-digit" }),
      ...data,
    }))
}
