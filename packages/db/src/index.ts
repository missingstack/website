import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

dotenv.config({ path: "../../apps/web/.env" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL environment variable is required");
}

// Use Pool for better connection management and password handling
const pool = new Pool({
	connectionString,
});

export const db = drizzle(pool);
export type Database = typeof db;
