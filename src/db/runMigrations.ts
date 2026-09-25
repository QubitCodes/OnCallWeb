import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

/** Apply the complete committed chain. Legacy databases require a reviewed baseline. */
async function main() {
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_DATABASE)
    throw new Error('Database configuration is incomplete.');
  const pool = new Pool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE, max: 1 });
  try {
    const { rows } = await pool.query("SELECT to_regclass('drizzle.__drizzle_migrations') AS ledger, EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE') AS populated");
    if (!rows[0].ledger && rows[0].populated)
      throw new Error('Existing schema has no migration ledger; review its baseline before migrating.');
    await migrate(drizzle(pool), { migrationsFolder: 'drizzle' });
    console.log('Committed migrations applied successfully.');
  } finally { await pool.end(); }
}
main().catch(() => { console.error('Migration failed. Review database configuration and migration baseline.'); process.exitCode = 1; });
