import type { Database } from "@missingstack/db";
import { asc, count, desc, eq, sql } from "@missingstack/db/drizzle-orm";
import { type Category, categories } from "@missingstack/db/schema/categories";
import { toolsCategories } from "@missingstack/db/schema/tools-categories";
import type {
	CategoryRepositoryInterface,
	CategoryWithCount,
} from "./categories.types";

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

	async getAllWithCounts(): Promise<CategoryWithCount[]> {
		// Efficient COUNT query using LEFT JOIN with indexed junction table
		const rows = await this.db
			.select({
				id: categories.id,
				slug: categories.slug,
				name: categories.name,
				description: categories.description,
				icon: categories.icon,
				parentId: categories.parentId,
				weight: categories.weight,
				createdAt: categories.createdAt,
				updatedAt: categories.updatedAt,
				toolCount:
					sql<number>`COALESCE(${count(toolsCategories.toolId)}, 0)`.as(
						"toolCount",
					),
			})
			.from(categories)
			.leftJoin(toolsCategories, eq(categories.id, toolsCategories.categoryId))
			.groupBy(categories.id)
			.orderBy(
				desc(sql<number>`COALESCE(${count(toolsCategories.toolId)}, 0)`),
				asc(categories.name),
			);

		return rows.map((row) => ({
			...row,
			toolCount: Number(row.toolCount),
		}));
	}

	async getTopCategories(limit = 10): Promise<CategoryWithCount[]> {
		// Efficient COUNT query using LEFT JOIN with indexed junction table
		const rows = await this.db
			.select({
				id: categories.id,
				slug: categories.slug,
				name: categories.name,
				description: categories.description,
				icon: categories.icon,
				parentId: categories.parentId,
				weight: categories.weight,
				createdAt: categories.createdAt,
				updatedAt: categories.updatedAt,
				toolCount:
					sql<number>`COALESCE(${count(toolsCategories.toolId)}, 0)`.as(
						"toolCount",
					),
			})
			.from(categories)
			.leftJoin(toolsCategories, eq(categories.id, toolsCategories.categoryId))
			.groupBy(categories.id)
			.orderBy(
				desc(sql<number>`COALESCE(${count(toolsCategories.toolId)}, 0)`),
				asc(categories.name),
			)
			.limit(limit);

		return rows.map((row) => ({
			...row,
			toolCount: Number(row.toolCount),
		}));
	}
}
