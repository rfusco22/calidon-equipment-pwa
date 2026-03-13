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

export async function GET() {
  try {
    const machines = await query("SELECT * FROM machines ORDER BY created_at DESC")
    const expenses = await query("SELECT * FROM expenses ORDER BY date ASC")

    const expensesByMachine: Record<string, Array<{ id: string; date: string; description: string; amount: number }>> = {}
    for (const row of expenses as any[]) {
      const mid = row.machine_id as string
      if (!expensesByMachine[mid]) expensesByMachine[mid] = []
      expensesByMachine[mid].push({
        id: row.id as string,
        date: row.date as string,
        description: row.description as string,
        amount: row.amount as number,
      })
    }

    const machinesWithExpenses = (machines as any[]).map((row) => ({
      id: row.id as string,
      item: row.item as string,
      purchaseDate: row.purchase_date as string,
      purchasedBy: row.purchased_by as string,
      itemNumber: row.item_number as string,
      serial: row.serial as string,
      hours: row.hours as string,
      cost: row.cost as number,
      transport: row.transport as number,
      location: row.location as string,
      observations: row.observations as string,
      saleStatus: row.sale_status as "no_vendido" | "vendido" | "en_negociacion",
      photo: row.photo as string | null,
      salePrice: row.sale_price as number,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      expenses: expensesByMachine[row.id as string] || [],
    }))

    return NextResponse.json(machinesWithExpenses)
  } catch (error) {
    console.error("Error fetching machines:", error)
    return NextResponse.json({ error: "Failed to fetch machines" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const id = generateUUID()
    const now = new Date().toISOString()

    await query(
      `INSERT INTO machines (id, item, purchase_date, purchased_by, item_number, serial, hours, cost, transport, location, observations, sale_status, photo, sale_price, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.item,
        data.purchaseDate,
        data.purchasedBy || "",
        data.itemNumber,
        data.serial || "",
        data.hours || "",
        data.cost || 0,
        data.transport || 0,
        data.location || "",
        data.observations || "",
        data.saleStatus || "no_vendido",
        data.photo || null,
        data.salePrice || 0,
        now,
        now,
      ]
    )

    // Insert expenses if any
    if (data.expenses && data.expenses.length > 0) {
      for (const expense of data.expenses) {
        const expId = expense.id || generateUUID()
        await query("INSERT INTO expenses (id, machine_id, date, description, amount) VALUES (?, ?, ?, ?, ?)", [
          expId,
          id,
          expense.date,
          expense.description,
          expense.amount,
        ])
      }
    }

    return NextResponse.json({
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    })
  } catch (error) {
    console.error("Error creating machine:", error)
    return NextResponse.json({ error: "Failed to create machine" }, { status: 500 })
  }
}
