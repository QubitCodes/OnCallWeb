import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const runMigrations = async () => {
  console.log('Running migrations manually to bypass CREATE SCHEMA permissions...');
	const pool = new Pool({
		host: process.env.DB_HOST || '127.0.0.1',
		port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
	});

  try {
    const sql4 = fs.readFileSync(path.join(process.cwd(), 'drizzle/0005_many_phil_sheldon.sql'), 'utf-8');
    
    // Split by Drizzle's statement breakpoint so pg can execute multiple commands safely
    const statements = sql4.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      try {
        await pool.query(statement);
      } catch (err: any) {
        if (err.code === '42701') {
          console.log('Column already exists, skipping safely...');
        } else {
          throw err;
        }
      }
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
