import { createClient } from "@libsql/client"

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function migrate() {
  console.log("Creating machines table...")
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS machines (
      id TEXT PRIMARY KEY,
      item TEXT NOT NULL,
      purchase_date TEXT NOT NULL,
      purchased_by TEXT NOT NULL DEFAULT '',
      item_number TEXT NOT NULL DEFAULT '',
      serial TEXT NOT NULL DEFAULT '',
      hours TEXT NOT NULL DEFAULT '',
      cost REAL NOT NULL DEFAULT 0,
      transport REAL NOT NULL DEFAULT 0,
      location TEXT NOT NULL DEFAULT '',
      observations TEXT NOT NULL DEFAULT '',
      sale_status TEXT NOT NULL DEFAULT 'no_vendido',
      photo TEXT,
      sale_price REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  console.log("machines table created.")

  console.log("Creating expenses table...")
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      machine_id TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      amount REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
    )
  `)
  console.log("expenses table created.")

  console.log("Creating index on expenses.machine_id...")
  await turso.execute(`
    CREATE INDEX IF NOT EXISTS idx_expenses_machine_id ON expenses(machine_id)
  `)
  console.log("Index created.")

  console.log("Migration complete!")
}

migrate().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
