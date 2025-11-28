import type { Database } from "@missingstack/db";
import { asc, desc, eq } from "@missingstack/db/drizzle-orm";
import { type Category, categories } from "@missingstack/db/schema/categories";
import type { CategoryRepositoryInterface } from "./categories.types";

export class DrizzleCategoryRepository implements CategoryRepositoryInterface {
	constructor(private readonly db: Database) {}

	async getAll(): Promise<Category[]> {
		const rows = await this.db
			.select()
			.from(categories)
			.orderBy(asc(categories.weight), asc(categories.name));

		return rows;
	}

	async getById(id: string): Promise<Category | null> {
		const [row] = await this.db
			.select()
			.from(categories)
			.where(eq(categories.id, id))
			.limit(1);

		return row ?? null;
	}

	async getBySlug(slug: string): Promise<Category | null> {
		const [row] = await this.db
			.select()
			.from(categories)
			.where(eq(categories.slug, slug))
			.limit(1);

		return row ?? null;
	}

	async getAllWithCounts(): Promise<Category[]> {
		const rows = await this.db
			.select()
			.from(categories)
			.orderBy(desc(categories.toolCount), asc(categories.name));

		return rows;
	}

	async getTopCategories(limit = 10): Promise<Category[]> {
		const rows = await this.db
			.select()
			.from(categories)
			.orderBy(desc(categories.toolCount), asc(categories.name))
			.limit(limit);

		return rows;
	}
}
