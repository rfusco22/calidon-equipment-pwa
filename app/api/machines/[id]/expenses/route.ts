import { turso } from "@/lib/turso"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: machineId } = await params
    const data = await request.json()
    const id = randomUUID()

    await turso.execute({
      sql: "INSERT INTO expenses (id, machine_id, date, description, amount) VALUES (?, ?, ?, ?, ?)",
      args: [id, machineId, data.date, data.description, data.amount],
    })

    await turso.execute({
      sql: "UPDATE machines SET updated_at = ? WHERE id = ?",
      args: [new Date().toISOString(), machineId],
    })

    return NextResponse.json({ id, ...data })
  } catch (error) {
    console.error("Error adding expense:", error)
    return NextResponse.json({ error: "Failed to add expense" }, { status: 500 })
  }
}
