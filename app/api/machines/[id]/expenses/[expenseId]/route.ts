import { query } from "@/lib/mysql"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { id: machineId, expenseId } = await params
    const data = await request.json()
    const now = new Date().toISOString()

    await query("UPDATE expenses SET date = ?, description = ?, amount = ? WHERE id = ? AND machine_id = ?", [
      data.date,
      data.description,
      data.amount,
      expenseId,
      machineId,
    ])

    await query("UPDATE machines SET updated_at = ? WHERE id = ?", [now, machineId])

    return NextResponse.json({ id: expenseId, ...data })
  } catch (error) {
    console.error("Error updating expense:", error)
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { id: machineId, expenseId } = await params
    const now = new Date().toISOString()

    await query("DELETE FROM expenses WHERE id = ? AND machine_id = ?", [expenseId, machineId])

    await query("UPDATE machines SET updated_at = ? WHERE id = ?", [now, machineId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting expense:", error)
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 })
  }
}
