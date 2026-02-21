import { turso } from "@/lib/turso"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { id: machineId, expenseId } = await params
    const data = await request.json()

    await turso.execute({
      sql: "UPDATE expenses SET date = ?, description = ?, amount = ? WHERE id = ? AND machine_id = ?",
      args: [data.date, data.description, data.amount, expenseId, machineId],
    })

    await turso.execute({
      sql: "UPDATE machines SET updated_at = ? WHERE id = ?",
      args: [new Date().toISOString(), machineId],
    })

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

    await turso.execute({
      sql: "DELETE FROM expenses WHERE id = ? AND machine_id = ?",
      args: [expenseId, machineId],
    })

    await turso.execute({
      sql: "UPDATE machines SET updated_at = ? WHERE id = ?",
      args: [new Date().toISOString(), machineId],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting expense:", error)
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 })
  }
}
