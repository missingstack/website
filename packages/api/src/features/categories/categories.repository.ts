import type { Database } from "@missingstack/db";
import { asc, desc, eq } from "@missingstack/db/drizzle-orm";
import { categories } from "@missingstack/db/schema/categories";

import type {
	CategoryData,
	CategoryRepositoryInterface,
	CategoryWithCount,
} from "./categories.types";

type QueryableDb = Pick<Database, "select">;

export class DrizzleCategoryRepository implements CategoryRepositoryInterface {
	constructor(private readonly db: QueryableDb) {}

	async getAll(): Promise<CategoryData[]> {
		const rows = await this.db
			.select({
				id: categories.id,
				slug: categories.slug,
				name: categories.name,
				description: categories.description,
				icon: categories.icon,
				parentId: categories.parentId,
				weight: categories.weight,
			})
			.from(categories)
			.orderBy(asc(categories.weight), asc(categories.name));

		return rows;
	}

	async getById(id: string): Promise<CategoryData | null> {
		const [row] = await this.db
			.select({
				id: categories.id,
				slug: categories.slug,
				name: categories.name,
				description: categories.description,
				icon: categories.icon,
				parentId: categories.parentId,
				weight: categories.weight,
			})
			.from(categories)
			.where(eq(categories.id, id))
			.limit(1);

		return row ?? null;
	}

	async getBySlug(slug: string): Promise<CategoryData | null> {
		const [row] = await this.db
			.select({
				id: categories.id,
				slug: categories.slug,
				name: categories.name,
				description: categories.description,
				icon: categories.icon,
				parentId: categories.parentId,
				weight: categories.weight,
			})
			.from(categories)
			.where(eq(categories.slug, slug))
			.limit(1);

		return row ?? null;
	}

	async getAllWithCounts(): Promise<CategoryWithCount[]> {
		const rows = await this.db
			.select({
				id: categories.id,
				slug: categories.slug,
				name: categories.name,
				description: categories.description,
				icon: categories.icon,
				parentId: categories.parentId,
				weight: categories.weight,
				toolCount: categories.toolCount,
			})
			.from(categories)
			.orderBy(desc(categories.toolCount), asc(categories.name));

		return rows;
	}

	async getTopCategories(limit = 10): Promise<CategoryWithCount[]> {
		const rows = await this.db
			.select({
				id: categories.id,
				slug: categories.slug,
				name: categories.name,
				description: categories.description,
				icon: categories.icon,
				parentId: categories.parentId,
				weight: categories.weight,
				toolCount: categories.toolCount,
			})
			.from(categories)
			.orderBy(desc(categories.toolCount), asc(categories.name))
			.limit(limit);

		return rows;
	}
}
