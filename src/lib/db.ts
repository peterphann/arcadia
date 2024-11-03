// lib/db.ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Make sure DATABASE_URL is defined in your .env
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
