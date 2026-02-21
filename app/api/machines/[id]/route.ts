import { turso } from "@/lib/turso"
import { NextResponse } from "next/server"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const machineResult = await turso.execute({
      sql: "SELECT * FROM machines WHERE id = ?",
      args: [id],
    })

    if (machineResult.rows.length === 0) {
      return NextResponse.json({ error: "Machine not found" }, { status: 404 })
    }

    const row = machineResult.rows[0]
    const expensesResult = await turso.execute({
      sql: "SELECT * FROM expenses WHERE machine_id = ? ORDER BY date ASC",
      args: [id],
    })

    const machine = {
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
      expenses: expensesResult.rows.map((e) => ({
        id: e.id as string,
        date: e.date as string,
        description: e.description as string,
        amount: e.amount as number,
      })),
    }

    return NextResponse.json(machine)
  } catch (error) {
    console.error("Error fetching machine:", error)
    return NextResponse.json({ error: "Failed to fetch machine" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    const now = new Date().toISOString()

    await turso.execute({
      sql: `UPDATE machines SET
            item = ?, purchase_date = ?, purchased_by = ?, item_number = ?, serial = ?,
            hours = ?, cost = ?, transport = ?, location = ?, observations = ?,
            sale_status = ?, photo = ?, sale_price = ?, updated_at = ?
            WHERE id = ?`,
      args: [
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
        id,
      ],
    })

    return NextResponse.json({ id, ...data, updatedAt: now })
  } catch (error) {
    console.error("Error updating machine:", error)
    return NextResponse.json({ error: "Failed to update machine" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await turso.execute({ sql: "DELETE FROM expenses WHERE machine_id = ?", args: [id] })
    await turso.execute({ sql: "DELETE FROM machines WHERE id = ?", args: [id] })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting machine:", error)
    return NextResponse.json({ error: "Failed to delete machine" }, { status: 500 })
  }
}
