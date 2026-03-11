import mysql from 'mysql2/promise'

let pool: mysql.Pool

export async function getConnection() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }
  return pool
}

export async function query(sql: string, values?: any[]) {
  const pool = await getConnection()
  const [results] = await pool.execute(sql, values || [])
  return results
}
