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

const STORAGE_KEY = "callidon_machines"

function getFromStorage(): Machine[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveToStorage(machines: Machine[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(machines))
}

export function getAllMachines(): Machine[] {
  return getFromStorage()
}

export function getMachineById(id: string): Machine | undefined {
  return getFromStorage().find((m) => m.id === id)
}

export function addMachine(data: MachineFormData): Machine {
  const machines = getFromStorage()
  const machine: Machine = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  machines.push(machine)
  saveToStorage(machines)
  return machine
}

export function updateMachine(id: string, data: Partial<MachineFormData>): Machine | undefined {
  const machines = getFromStorage()
  const index = machines.findIndex((m) => m.id === id)
  if (index === -1) return undefined
  machines[index] = { ...machines[index], ...data, updatedAt: new Date().toISOString() }
  saveToStorage(machines)
  return machines[index]
}

export function deleteMachine(id: string): boolean {
  const machines = getFromStorage()
  const filtered = machines.filter((m) => m.id !== id)
  if (filtered.length === machines.length) return false
  saveToStorage(filtered)
  return true
}

export function addExpense(machineId: string, expense: Omit<Expense, "id">): Expense | undefined {
  const machines = getFromStorage()
  const machine = machines.find((m) => m.id === machineId)
  if (!machine) return undefined
  const newExpense: Expense = { ...expense, id: crypto.randomUUID() }
  machine.expenses.push(newExpense)
  machine.updatedAt = new Date().toISOString()
  saveToStorage(machines)
  return newExpense
}

export function removeExpense(machineId: string, expenseId: string): boolean {
  const machines = getFromStorage()
  const machine = machines.find((m) => m.id === machineId)
  if (!machine) return false
  machine.expenses = machine.expenses.filter((e) => e.id !== expenseId)
  machine.updatedAt = new Date().toISOString()
  saveToStorage(machines)
  return true
}

export function updateExpense(machineId: string, expenseId: string, data: Partial<Omit<Expense, "id">>): boolean {
  const machines = getFromStorage()
  const machine = machines.find((m) => m.id === machineId)
  if (!machine) return false
  const expense = machine.expenses.find((e) => e.id === expenseId)
  if (!expense) return false
  Object.assign(expense, data)
  machine.updatedAt = new Date().toISOString()
  saveToStorage(machines)
  return true
}

// Dashboard calculations
export function getDashboardStats() {
  const machines = getFromStorage()
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

export function getMonthlyData() {
  const machines = getFromStorage()
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

// Seed demo data
export function seedDemoData() {
  const existing = getFromStorage()
  if (existing.length > 0) return

  const demoMachines: Machine[] = [
    {
      id: crypto.randomUUID(),
      item: "CAT 320 Excavadora",
      purchaseDate: "2025-08-15",
      purchasedBy: "Juan Martinez",
      itemNumber: "EQ-001",
      serial: "CAT320-2024-78541",
      hours: "3,200",
      cost: 45000,
      transport: 2500,
      location: "Miami, FL",
      observations: "Buen estado general, necesita cambio de filtros",
      saleStatus: "vendido",
      photo: null,
      expenses: [
        { id: crypto.randomUUID(), date: "2025-09-01", description: "Cambio de filtros", amount: 850 },
        { id: crypto.randomUUID(), date: "2025-09-15", description: "Pintura", amount: 1200 },
        { id: crypto.randomUUID(), date: "2025-10-01", description: "Reparacion hidraulica", amount: 2300 },
      ],
      salePrice: 68000,
      createdAt: "2025-08-15T10:00:00Z",
      updatedAt: "2025-11-01T10:00:00Z",
    },
    {
      id: crypto.randomUUID(),
      item: "Komatsu PC200 Excavadora",
      purchaseDate: "2025-10-20",
      purchasedBy: "Carlos Lopez",
      itemNumber: "EQ-002",
      serial: "KOM-PC200-45123",
      hours: "5,100",
      cost: 32000,
      transport: 1800,
      location: "Houston, TX",
      observations: "Motor recien reparado",
      saleStatus: "en_negociacion",
      photo: null,
      expenses: [
        { id: crypto.randomUUID(), date: "2025-11-05", description: "Motor rebuild", amount: 5500 },
        { id: crypto.randomUUID(), date: "2025-11-20", description: "Pintura completa", amount: 1800 },
      ],
      salePrice: 0,
      createdAt: "2025-10-20T10:00:00Z",
      updatedAt: "2025-11-20T10:00:00Z",
    },
    {
      id: crypto.randomUUID(),
      item: "Volvo A40G Articulado",
      purchaseDate: "2025-11-10",
      purchasedBy: "Maria Garcia",
      itemNumber: "EQ-003",
      serial: "VOL-A40G-99812",
      hours: "2,800",
      cost: 55000,
      transport: 3200,
      location: "Dallas, TX",
      observations: "Excelente condicion, listo para venta",
      saleStatus: "no_vendido",
      photo: null,
      expenses: [
        { id: crypto.randomUUID(), date: "2025-11-25", description: "Inspeccion general", amount: 450 },
        { id: crypto.randomUUID(), date: "2025-12-01", description: "Llantas nuevas", amount: 3600 },
      ],
      salePrice: 0,
      createdAt: "2025-11-10T10:00:00Z",
      updatedAt: "2025-12-01T10:00:00Z",
    },
    {
      id: crypto.randomUUID(),
      item: "CAT D6T Bulldozer",
      purchaseDate: "2025-12-01",
      purchasedBy: "Pedro Ramirez",
      itemNumber: "EQ-004",
      serial: "CAT-D6T-33287",
      hours: "4,500",
      cost: 62000,
      transport: 4100,
      location: "Orlando, FL",
      observations: "Cadenas al 60%, cuchilla nueva",
      saleStatus: "vendido",
      photo: null,
      expenses: [
        { id: crypto.randomUUID(), date: "2025-12-10", description: "Cuchilla nueva", amount: 4200 },
        { id: crypto.randomUUID(), date: "2025-12-20", description: "Servicio completo", amount: 1500 },
      ],
      salePrice: 89000,
      createdAt: "2025-12-01T10:00:00Z",
      updatedAt: "2026-01-05T10:00:00Z",
    },
    {
      id: crypto.randomUUID(),
      item: "John Deere 310L Retroexcavadora",
      purchaseDate: "2026-01-15",
      purchasedBy: "Ana Torres",
      itemNumber: "EQ-005",
      serial: "JD-310L-71245",
      hours: "1,900",
      cost: 28000,
      transport: 1500,
      location: "Atlanta, GA",
      observations: "Pocas horas, muy buen estado",
      saleStatus: "no_vendido",
      photo: null,
      expenses: [
        { id: crypto.randomUUID(), date: "2026-01-25", description: "Cambio de aceite", amount: 320 },
      ],
      salePrice: 0,
      createdAt: "2026-01-15T10:00:00Z",
      updatedAt: "2026-01-25T10:00:00Z",
    },
    {
      id: crypto.randomUUID(),
      item: "Hitachi ZX350 Excavadora",
      purchaseDate: "2026-02-01",
      purchasedBy: "Roberto Diaz",
      itemNumber: "EQ-006",
      serial: "HIT-ZX350-55678",
      hours: "6,200",
      cost: 38000,
      transport: 2800,
      location: "Tampa, FL",
      observations: "Requiere atencion en sistema electrico",
      saleStatus: "en_negociacion",
      photo: null,
      expenses: [
        { id: crypto.randomUUID(), date: "2026-02-10", description: "Diagnostico electrico", amount: 600 },
        { id: crypto.randomUUID(), date: "2026-02-15", description: "Reparacion electrica", amount: 2100 },
      ],
      salePrice: 0,
      createdAt: "2026-02-01T10:00:00Z",
      updatedAt: "2026-02-15T10:00:00Z",
    },
  ]

  saveToStorage(demoMachines)
}
