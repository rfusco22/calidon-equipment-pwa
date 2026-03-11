import { query } from "@/lib/mysql"
import { NextResponse } from "next/server"

// UUID v4 generator
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function POST() {
  try {
    const existing = await query("SELECT COUNT(*) as count FROM machines")
    const count = (existing as any[])[0].count as number
    if (count > 0) {
      return NextResponse.json({ message: "Database already has data", seeded: false })
    }

    const demoMachines = [
      {
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
        salePrice: 68000,
        expenses: [
          { date: "2025-09-01", description: "Cambio de filtros", amount: 850 },
          { date: "2025-09-15", description: "Pintura", amount: 1200 },
          { date: "2025-10-01", description: "Reparacion hidraulica", amount: 2300 },
        ],
      },
      {
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
        salePrice: 0,
        expenses: [
          { date: "2025-11-05", description: "Motor rebuild", amount: 5500 },
          { date: "2025-11-20", description: "Pintura completa", amount: 1800 },
        ],
      },
      {
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
        salePrice: 0,
        expenses: [
          { date: "2025-11-25", description: "Inspeccion general", amount: 450 },
          { date: "2025-12-01", description: "Llantas nuevas", amount: 3600 },
        ],
      },
      {
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
        salePrice: 89000,
        expenses: [
          { date: "2025-12-10", description: "Cuchilla nueva", amount: 4200 },
          { date: "2025-12-20", description: "Servicio completo", amount: 1500 },
        ],
      },
      {
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
        salePrice: 0,
        expenses: [
          { date: "2026-01-25", description: "Cambio de aceite", amount: 320 },
        ],
      },
      {
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
        salePrice: 0,
        expenses: [
          { date: "2026-02-10", description: "Diagnostico electrico", amount: 600 },
          { date: "2026-02-15", description: "Reparacion electrica", amount: 2100 },
        ],
      },
    ]

    for (const m of demoMachines) {
      const id = generateUUID()
      const now = new Date().toISOString()

      await query(
        `INSERT INTO machines (id, item, purchase_date, purchased_by, item_number, serial, hours, cost, transport, location, observations, sale_status, photo, sale_price, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, m.item, m.purchaseDate, m.purchasedBy, m.itemNumber, m.serial, m.hours, m.cost, m.transport, m.location, m.observations, m.saleStatus, null, m.salePrice, now, now]
      )

      for (const exp of m.expenses) {
        await query("INSERT INTO expenses (id, machine_id, date, description, amount) VALUES (?, ?, ?, ?, ?)", [
          generateUUID(),
          id,
          exp.date,
          exp.description,
          exp.amount,
        ])
      }
    }

    return NextResponse.json({ message: "Demo data seeded successfully", seeded: true })
  } catch (error) {
    console.error("Error seeding data:", error)
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 })
  }
}
