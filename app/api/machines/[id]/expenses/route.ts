import { turso } from "@/lib/turso"
import { NextResponse } from "next/server"

// UUID v4 generator
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: machineId } = await params
    const data = await request.json()
    const id = generateUUID()

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
