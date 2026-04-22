import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const runMigrations = async () => {
  console.log('Running migrations manually to bypass CREATE SCHEMA permissions...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const sql4 = fs.readFileSync(path.join(process.cwd(), 'drizzle/0005_many_phil_sheldon.sql'), 'utf-8');
    
    // Split by Drizzle's statement breakpoint so pg can execute multiple commands safely
    const statements = sql4.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await pool.query(statement);
    }
    
    console.log('Applied 0005_many_phil_sheldon.sql');
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigrations();
