import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const demoMachines = [
  {
    id: "demo-001",
    item: "CAT 320 Excavadora",
    purchase_date: "2025-08-15",
    purchased_by: "Juan Martinez",
    item_number: "EQ-001",
    serial: "CAT320-2024-78541",
    hours: "3,200",
    cost: 45000,
    transport: 2500,
    location: "Miami, FL",
    observations: "Buen estado general, necesita cambio de filtros",
    sale_status: "vendido",
    photo: null,
    sale_price: 68000,
    created_at: "2025-08-15T10:00:00Z",
    updated_at: "2025-11-01T10:00:00Z",
    expenses: [
      { id: "exp-001", date: "2025-09-01", description: "Cambio de filtros", amount: 850 },
      { id: "exp-002", date: "2025-09-15", description: "Pintura", amount: 1200 },
      { id: "exp-003", date: "2025-10-01", description: "Reparacion hidraulica", amount: 2300 },
    ],
  },
  {
    id: "demo-002",
    item: "Komatsu PC200 Excavadora",
    purchase_date: "2025-10-20",
    purchased_by: "Carlos Lopez",
    item_number: "EQ-002",
    serial: "KOM-PC200-45123",
    hours: "5,100",
    cost: 32000,
    transport: 1800,
    location: "Houston, TX",
    observations: "Motor recien reparado",
    sale_status: "en_negociacion",
    photo: null,
    sale_price: 0,
    created_at: "2025-10-20T10:00:00Z",
    updated_at: "2025-11-20T10:00:00Z",
    expenses: [
      { id: "exp-004", date: "2025-11-05", description: "Motor rebuild", amount: 5500 },
      { id: "exp-005", date: "2025-11-20", description: "Pintura completa", amount: 1800 },
    ],
  },
  {
    id: "demo-003",
    item: "Volvo A40G Articulado",
    purchase_date: "2025-11-10",
    purchased_by: "Maria Garcia",
    item_number: "EQ-003",
    serial: "VOL-A40G-99812",
    hours: "2,800",
    cost: 55000,
    transport: 3200,
    location: "Dallas, TX",
    observations: "Excelente condicion, listo para venta",
    sale_status: "no_vendido",
    photo: null,
    sale_price: 0,
    created_at: "2025-11-10T10:00:00Z",
    updated_at: "2025-12-01T10:00:00Z",
    expenses: [
      { id: "exp-006", date: "2025-11-25", description: "Inspeccion general", amount: 450 },
      { id: "exp-007", date: "2025-12-01", description: "Llantas nuevas", amount: 3600 },
    ],
  },
  {
    id: "demo-004",
    item: "CAT D6T Bulldozer",
    purchase_date: "2025-12-01",
    purchased_by: "Pedro Ramirez",
    item_number: "EQ-004",
    serial: "CAT-D6T-33287",
    hours: "4,500",
    cost: 62000,
    transport: 4100,
    location: "Orlando, FL",
    observations: "Cadenas al 60%, cuchilla nueva",
    sale_status: "vendido",
    photo: null,
    sale_price: 89000,
    created_at: "2025-12-01T10:00:00Z",
    updated_at: "2026-01-05T10:00:00Z",
    expenses: [
      { id: "exp-008", date: "2025-12-10", description: "Cuchilla nueva", amount: 4200 },
      { id: "exp-009", date: "2025-12-20", description: "Servicio completo", amount: 1500 },
    ],
  },
  {
    id: "demo-005",
    item: "John Deere 310L Retroexcavadora",
    purchase_date: "2026-01-15",
    purchased_by: "Ana Torres",
    item_number: "EQ-005",
    serial: "JD-310L-71245",
    hours: "1,900",
    cost: 28000,
    transport: 1500,
    location: "Atlanta, GA",
    observations: "Pocas horas, muy buen estado",
    sale_status: "no_vendido",
    photo: null,
    sale_price: 0,
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-25T10:00:00Z",
    expenses: [
      { id: "exp-010", date: "2026-01-25", description: "Cambio de aceite", amount: 320 },
    ],
  },
  {
    id: "demo-006",
    item: "Hitachi ZX350 Excavadora",
    purchase_date: "2026-02-01",
    purchased_by: "Roberto Diaz",
    item_number: "EQ-006",
    serial: "HIT-ZX350-55678",
    hours: "6,200",
    cost: 38000,
    transport: 2800,
    location: "Tampa, FL",
    observations: "Requiere atencion en sistema electrico",
    sale_status: "en_negociacion",
    photo: null,
    sale_price: 0,
    created_at: "2026-02-01T10:00:00Z",
    updated_at: "2026-02-15T10:00:00Z",
    expenses: [
      { id: "exp-011", date: "2026-02-10", description: "Diagnostico electrico", amount: 600 },
      { id: "exp-012", date: "2026-02-15", description: "Reparacion electrica", amount: 2100 },
    ],
  },
];

async function seed() {
  // Check if data already exists
  const existing = await client.execute("SELECT COUNT(*) as count FROM machines");
  if (existing.rows[0].count > 0) {
    console.log("Database already has data, skipping seed.");
    return;
  }

  for (const machine of demoMachines) {
    const { expenses, ...m } = machine;

    await client.execute({
      sql: `INSERT INTO machines (id, item, purchase_date, purchased_by, item_number, serial, hours, cost, transport, location, observations, sale_status, photo, sale_price, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        m.id, m.item, m.purchase_date, m.purchased_by, m.item_number,
        m.serial, m.hours, m.cost, m.transport, m.location,
        m.observations, m.sale_status, m.photo, m.sale_price,
        m.created_at, m.updated_at,
      ],
    });
    console.log(`Inserted machine: ${m.item}`);

    for (const exp of expenses) {
      await client.execute({
        sql: `INSERT INTO expenses (id, machine_id, date, description, amount) VALUES (?, ?, ?, ?, ?)`,
        args: [exp.id, m.id, exp.date, exp.description, exp.amount],
      });
      console.log(`  Inserted expense: ${exp.description}`);
    }
  }

  console.log("\nSeed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
