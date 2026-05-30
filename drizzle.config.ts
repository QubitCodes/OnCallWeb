import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		host: process.env.DB_HOST || '127.0.0.1',
		port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
		user: process.env.DB_USER || '',
		password: process.env.DB_PASSWORD || '',
		database: process.env.DB_DATABASE || '',
		ssl: false,
	},
});

