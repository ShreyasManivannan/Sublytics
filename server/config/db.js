import mysql from 'mysql2/promise';

// ---------------------------------------------------------------------------
// Parse DATABASE_URL into mysql2 connection config
// ---------------------------------------------------------------------------
const databaseUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/sublytics';

let poolConfig = {};
try {
  const url = new URL(databaseUrl);
  poolConfig = {
    host: url.hostname,
    port: url.port ? parseInt(url.port) : 3306,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    ssl: url.searchParams.get('ssl') === 'true' ? { rejectUnauthorized: false } : undefined,
  };
} catch {
  poolConfig = { uri: databaseUrl };
}

// ---------------------------------------------------------------------------
// Create pool
// ---------------------------------------------------------------------------
const rawPool = mysql.createPool({
  ...poolConfig,
  connectionLimit: 20,
  idleTimeout: 30000,
  connectTimeout: 5000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// ---------------------------------------------------------------------------
// Wrapper: converts pg-style $1 placeholders to ?, returns { rows, insertId, affectedRows }
// ---------------------------------------------------------------------------
const pool = {
  /**
   * Execute a SQL query.
   * - Accepts pg-style numbered placeholders ($1, $2 …) and converts to ?.
   * - Returns { rows, insertId, affectedRows } regardless of query type.
   */
  async query(sql, params) {
    // Convert $1, $2, … → ?
    const mysqlSql = sql.replace(/\$\d+/g, '?');

    try {
      const [result] = await rawPool.query(mysqlSql, params);

      // SELECT queries return an array of row objects
      if (Array.isArray(result)) {
        return { rows: result, insertId: null, affectedRows: 0 };
      }

      // INSERT / UPDATE / DELETE returns a ResultSetHeader
      return {
        rows: [],
        insertId: result.insertId ?? null,
        affectedRows: result.affectedRows ?? 0,
      };
    } catch (err) {
      console.error('MySQL query error:', mysqlSql);
      console.error('  →', err.message);
      throw err;
    }
  },
};

// ---------------------------------------------------------------------------
// Test connection on startup (soft failure — don't crash the server)
// ---------------------------------------------------------------------------
rawPool
  .getConnection()
  .then((conn) => {
    console.log('✅ MySQL connected');
    conn.release();
  })
  .catch((err) => {
    console.warn('⚠️  MySQL connection failed:', err.message);
    console.warn('   The server will start, but database queries will fail until MySQL is available.');
  });

export default pool;
