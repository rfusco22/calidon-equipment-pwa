import { turso } from "@/lib/turso"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

export async function GET() {
  try {
    const machinesResult = await turso.execute("SELECT * FROM machines ORDER BY created_at DESC")
    const expensesResult = await turso.execute("SELECT * FROM expenses ORDER BY date ASC")

    const expensesByMachine: Record<string, Array<{ id: string; date: string; description: string; amount: number }>> = {}
    for (const row of expensesResult.rows) {
      const mid = row.machine_id as string
      if (!expensesByMachine[mid]) expensesByMachine[mid] = []
      expensesByMachine[mid].push({
        id: row.id as string,
        date: row.date as string,
        description: row.description as string,
        amount: row.amount as number,
      })
    }

    const machines = machinesResult.rows.map((row) => ({
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

    return NextResponse.json(machines)
  } catch (error) {
    console.error("Error fetching machines:", error)
    return NextResponse.json({ error: "Failed to fetch machines" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const id = randomUUID()
    const now = new Date().toISOString()

    await turso.execute({
      sql: `INSERT INTO machines (id, item, purchase_date, purchased_by, item_number, serial, hours, cost, transport, location, observations, sale_status, photo, sale_price, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
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
      ],
    })

    // Insert expenses if any
    if (data.expenses && data.expenses.length > 0) {
      for (const expense of data.expenses) {
        const expId = expense.id || randomUUID()
        await turso.execute({
          sql: "INSERT INTO expenses (id, machine_id, date, description, amount) VALUES (?, ?, ?, ?, ?)",
          args: [expId, id, expense.date, expense.description, expense.amount],
        })
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
