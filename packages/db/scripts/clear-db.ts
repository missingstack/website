/**
 * Database Clear Script
 *
 * Clears all data from the database tables.
 * Run with: bun run scripts/clear-db.ts
 */

import dotenv from "dotenv";
import { sql } from "drizzle-orm";
import { db } from "../src";

dotenv.config({ path: "../../apps/web/.env" });

// Validate environment
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	console.error("❌ DATABASE_URL environment variable is required");
	process.exit(1);
}

async function clearDatabase() {
	console.log("🗑️  Clearing database...\n");

	try {
		// Truncate all tables in correct order (respecting foreign keys)
		// Using CASCADE to handle foreign key constraints
		await db.execute(sql`TRUNCATE TABLE 
      tools_tags,
      tools_categories,
      tools,
      tags,
      categories
      CASCADE`);

		console.log("✅ All tables cleared successfully!");
	} catch (error) {
		console.error("❌ Failed to clear database:", error);
		process.exit(1);
	}
}

clearDatabase();
