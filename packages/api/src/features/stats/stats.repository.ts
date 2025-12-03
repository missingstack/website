import type { Database } from "@missingstack/db";
import { count, eq } from "@missingstack/db/drizzle-orm";
import { categories } from "@missingstack/db/schema/categories";
import { stacks } from "@missingstack/db/schema/stacks";
import { tags } from "@missingstack/db/schema/tags";
import { tools } from "@missingstack/db/schema/tools";

import type { Stats, StatsRepositoryInterface } from "./stats.types";

type QueryableDb = Pick<Database, "select">;

export class DrizzleStatsRepository implements StatsRepositoryInterface {
	constructor(private readonly db: QueryableDb) {}

	async getStats(): Promise<Stats> {
		// Execute all queries in parallel for better performance
		const [toolsCount, categoriesCount, stacksCount, tagsCount, featuredCount] =
			await Promise.all([
				this.db.select({ count: count() }).from(tools),
				this.db.select({ count: count() }).from(categories),
				this.db.select({ count: count() }).from(stacks),
				this.db.select({ count: count() }).from(tags),
				this.db
					.select({ count: count() })
					.from(tools)
					.where(eq(tools.featured, true)),
			]);

		return {
			totalTools: toolsCount[0]?.count ?? 0,
			totalCategories: categoriesCount[0]?.count ?? 0,
			totalStacks: stacksCount[0]?.count ?? 0,
			totalTags: tagsCount[0]?.count ?? 0,
			featuredTools: featuredCount[0]?.count ?? 0,
		};
	}
}
