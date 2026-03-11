import { query } from "@/lib/mysql"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const machines = await query("SELECT * FROM machines WHERE id = ?", [id])

    if ((machines as any[]).length === 0) {
      return NextResponse.json({ error: "Machine not found" }, { status: 404 })
    }

    const machine = (machines as any[])[0]
    const expenses = await query("SELECT * FROM expenses WHERE machine_id = ? ORDER BY date ASC", [id])

    return NextResponse.json({
      id: machine.id,
      item: machine.item,
      purchaseDate: machine.purchase_date,
      purchasedBy: machine.purchased_by,
      itemNumber: machine.item_number,
      serial: machine.serial,
      hours: machine.hours,
      cost: machine.cost,
      transport: machine.transport,
      location: machine.location,
      observations: machine.observations,
      saleStatus: machine.sale_status,
      photo: machine.photo,
      salePrice: machine.sale_price,
      createdAt: machine.created_at,
      updatedAt: machine.updated_at,
      expenses: (expenses as any[]).map((e) => ({
        id: e.id,
        date: e.date,
        description: e.description,
        amount: e.amount,
      })),
    })
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

    await query(
      `UPDATE machines SET item = ?, purchase_date = ?, purchased_by = ?, item_number = ?, serial = ?, hours = ?, cost = ?, transport = ?, location = ?, observations = ?, sale_status = ?, sale_price = ?, updated_at = ? WHERE id = ?`,
      [
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
        data.salePrice || 0,
        now,
        id,
      ]
    )

    return NextResponse.json({ id, ...data, updatedAt: now })
  } catch (error) {
    console.error("Error updating machine:", error)
    return NextResponse.json({ error: "Failed to update machine" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Delete expenses first
    await query("DELETE FROM expenses WHERE machine_id = ?", [id])

    // Delete machine
    await query("DELETE FROM machines WHERE id = ?", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting machine:", error)
    return NextResponse.json({ error: "Failed to delete machine" }, { status: 500 })
  }
}
