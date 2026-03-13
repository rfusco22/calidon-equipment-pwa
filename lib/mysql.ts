import mysql from 'mysql2/promise'

let pool: mysql.Pool | null = null

export async function getConnection() {
  // Validate environment variables
  if (!process.env.MYSQL_USER || !process.env.MYSQL_DATABASE) {
    throw new Error('MySQL environment variables not configured: MYSQL_USER, MYSQL_DATABASE are required')
  }

  if (!pool) {
    // Try TCP connection first, then fall back to socket
    const config: any = {
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    }

    // If MYSQL_HOST is provided, use TCP connection
    if (process.env.MYSQL_HOST) {
      config.host = process.env.MYSQL_HOST
      config.port = parseInt(process.env.MYSQL_PORT || '3306')
    } else {
      // Otherwise try socket connection (common in cPanel)
      config.socketPath = '/var/run/mysqld/mysqld.sock'
    }

    try {
      pool = mysql.createPool(config)
      // Test connection
      const connection = await pool.getConnection()
      await connection.ping()
      connection.release()
      console.log('[v0] MySQL connected successfully')
    } catch (error) {
      console.error('[v0] MySQL connection error:', error)
      throw error
    }
  }
  return pool
}

export async function query(sql: string, values?: any[]) {
  const pool = await getConnection()
  const [results] = await pool.execute(sql, values || [])
  return results
}
