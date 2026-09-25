import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

/** Initialize one explicitly selected empty database; never reset or overwrite an administrator. */
async function main() {
  if (process.env.INITIALIZE_DATABASE !== process.env.DB_DATABASE || !process.env.INITIALIZE_DATABASE)
    throw new Error('Explicit target database confirmation required.');
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 24)
    throw new Error('Initial administrator configuration required.');
  const pool = new Pool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE, max: 1 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('oncall-initialize'))");
    const { rows } = await client.query('SELECT email FROM admins LIMIT 1');
    if (rows.length) {
      if (rows[0].email !== email) throw new Error('An administrator already exists.');
      console.log('Initial administrator already exists; unchanged.');
    } else {
      await client.query('INSERT INTO admins(email,password,full_name,role) VALUES ($1,$2,$3,$4)',
        [email, await bcrypt.hash(password, 12), process.env.INITIAL_ADMIN_NAME || 'Administrator', 'admin']);
      console.log('Initial administrator created.');
    }
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); await pool.end(); }
}
main().catch(() => { console.error('Initialization failed; existing records preserved.'); process.exitCode = 1; });
