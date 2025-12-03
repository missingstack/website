import type { Database } from "@missingstack/db";
import {
	type SQL,
	and,
	asc,
	count,
	desc,
	eq,
	gt,
	ilike,
	lt,
	or,
	sql,
} from "@missingstack/db/drizzle-orm";
import { type Category, categories } from "@missingstack/db/schema/categories";
import { toolsCategories } from "@missingstack/db/schema/tools-categories";
import type {
	CategoryCollection,
	CategoryQueryOptions,
	CreateCategoryInput,
} from "./categories.schema";
import type {
	CategoryRepositoryInterface,
	CategoryWithCount,
} from "./categories.types";

type QueryableDb = Pick<Database, "select" | "transaction" | "insert">;
type CursorState = {
	id: string;
	createdAt?: Date;
	name?: string;
	slug?: string;
	weight?: number;
};

type EncodedCursor = {
	id: string;
	createdAt?: string;
	name?: string;
	slug?: string;
	weight?: number;
	sortBy?: string;
};

type SortContext = {
	sortBy: "name" | "slug" | "weight" | "createdAt";
	sortOrder: "asc" | "desc";
	searchQuery?: string;
};

// CURSOR UTILITIES
class CursorManager {
	static encode(state: CursorState, sortBy: SortContext["sortBy"]): string {
		const payload: EncodedCursor = {
			id: state.id,
			createdAt: state.createdAt?.toISOString(),
			name: state.name,
			slug: state.slug,
			weight: state.weight,
			sortBy,
		};
		return Buffer.from(JSON.stringify(payload)).toString("base64");
	}

	static decode(
		cursor?: string | null,
		sortBy?: SortContext["sortBy"],
	): CursorState | null {
		if (!cursor) return null;

		try {
			const json = Buffer.from(cursor, "base64").toString("utf8");
			const parsed = JSON.parse(json) as EncodedCursor;

			if (!parsed.id) return null;

			// Invalidate cursor if sort changed
			if (sortBy && parsed.sortBy && parsed.sortBy !== sortBy) {
				return null;
			}

			const state: CursorState = { id: parsed.id };

			if (parsed.createdAt) {
				const createdAt = new Date(parsed.createdAt);
				if (!Number.isNaN(createdAt.getTime())) {
					state.createdAt = createdAt;
				}
			}

			if (parsed.name) {
				state.name = parsed.name;
			}

			if (parsed.slug) {
				state.slug = parsed.slug;
			}

			if (typeof parsed.weight === "number") {
				state.weight = parsed.weight;
			}

			return state;
		} catch {
			return null;
		}
	}
}

// FILTER BUILDERS
class FilterBuilder {
	buildSearchFilter(search?: string): SQL<unknown> | null {
		if (!search) return null;
		const searchQuery = search.trim();
		if (!searchQuery) return null;

		const pattern = `%${searchQuery}%`;

		return (
			or(
				ilike(categories.name, pattern),
				ilike(categories.slug, pattern),
				ilike(categories.description, pattern),
			) ?? null
		);
	}

	buildAllFilters(options: CategoryQueryOptions): SQL<unknown>[] {
		return [this.buildSearchFilter(options.search)].filter(
			(condition): condition is SQL<unknown> => condition !== null,
		);
	}
}

// SORT BUILDERS
class SortBuilder {
	static buildOrderBy(context: SortContext): SQL<unknown>[] {
		const orderFn = context.sortOrder === "asc" ? asc : desc;

		switch (context.sortBy) {
			case "name":
				return [orderFn(categories.name), orderFn(categories.id)];

			case "slug":
				return [orderFn(categories.slug), orderFn(categories.id)];

			case "weight":
				return [orderFn(categories.weight), orderFn(categories.id)];

			case "createdAt":
				return [orderFn(categories.createdAt), orderFn(categories.id)];

			default:
				return [
					asc(categories.weight),
					asc(categories.name),
					asc(categories.id),
				];
		}
	}

	static buildCursorCondition(
		cursorState: CursorState,
		context: SortContext,
	): SQL<unknown> | null {
		if (!cursorState.id) return null;

		const isAsc = context.sortOrder === "asc";
		const compareFn = isAsc ? gt : lt;

		switch (context.sortBy) {
			case "name": {
				if (!cursorState.name) {
					return compareFn(categories.id, cursorState.id);
				}
				return (
					or(
						compareFn(categories.name, cursorState.name),
						and(
							eq(categories.name, cursorState.name),
							compareFn(categories.id, cursorState.id),
						),
					) ?? null
				);
			}

			case "slug": {
				if (!cursorState.slug) {
					return compareFn(categories.id, cursorState.id);
				}
				return (
					or(
						compareFn(categories.slug, cursorState.slug),
						and(
							eq(categories.slug, cursorState.slug),
							compareFn(categories.id, cursorState.id),
						),
					) ?? null
				);
			}

			case "weight": {
				if (typeof cursorState.weight !== "number") {
					return compareFn(categories.id, cursorState.id);
				}
				return (
					or(
						compareFn(categories.weight, cursorState.weight),
						and(
							eq(categories.weight, cursorState.weight),
							compareFn(categories.id, cursorState.id),
						),
					) ?? null
				);
			}

			case "createdAt": {
				if (!cursorState.createdAt) {
					return compareFn(categories.id, cursorState.id);
				}
				return (
					or(
						compareFn(categories.createdAt, cursorState.createdAt),
						and(
							eq(categories.createdAt, cursorState.createdAt),
							compareFn(categories.id, cursorState.id),
						),
					) ?? null
				);
			}

			default:
				return null;
		}
	}
}

// QUERY EXECUTOR
class QueryExecutor {
	constructor(private readonly db: QueryableDb) {}

	async execute(
		filters: SQL<unknown>[],
		context: SortContext,
		cursor: CursorState | null,
		limit: number,
	): Promise<CategoryCollection> {
		const conditions = [...filters];

		// Add cursor condition
		if (cursor) {
			const cursorCondition = SortBuilder.buildCursorCondition(cursor, context);
			if (cursorCondition) {
				conditions.push(cursorCondition);
			}
		}

		const whereClause =
			conditions.length > 0 ? (and(...conditions) ?? sql`true`) : sql`true`;

		const orderByClause = SortBuilder.buildOrderBy(context);

		const rows = await this.db
			.select()
			.from(categories)
			.where(whereClause)
			.orderBy(...orderByClause)
			.limit(limit + 1);

		const hasMore = rows.length > limit;
		const items: Category[] = (
			hasMore ? rows.slice(0, limit) : rows
		) as Category[];

		const lastItem =
			hasMore && items.length > 0 ? items[items.length - 1] : null;

		const nextCursor = lastItem
			? CursorManager.encode(
					{
						id: lastItem.id,
						createdAt: lastItem.createdAt,
						name: lastItem.name,
						slug: lastItem.slug,
						weight: lastItem.weight ?? undefined,
					},
					context.sortBy,
				)
			: null;

		return { items, nextCursor, hasMore };
	}
}

export class DrizzleCategoryRepository implements CategoryRepositoryInterface {
	private readonly filterBuilder: FilterBuilder;
	private readonly queryExecutor: QueryExecutor;

	constructor(private readonly db: QueryableDb) {
		this.filterBuilder = new FilterBuilder();
		this.queryExecutor = new QueryExecutor(db);
	}

	async getAll(
		options: CategoryQueryOptions = {},
	): Promise<CategoryCollection> {
		const limit = options.limit ?? 20;
		const sortBy = options.sortBy ?? "weight";
		const sortOrder = options.sortOrder ?? "asc";

		const context: SortContext = {
			sortBy,
			sortOrder,
			searchQuery: options.search?.trim() || undefined,
		};

		const cursor = CursorManager.decode(options.cursor, sortBy);
		const filters = this.filterBuilder.buildAllFilters(options);

		return this.queryExecutor.execute(filters, context, cursor, limit);
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

	async create(input: CreateCategoryInput): Promise<Category> {
		const [category] = await this.db
			.insert(categories)
			.values({
				slug: input.slug,
				name: input.name,
				description: input.description || null,
				icon: input.icon,
				parentId: input.parentId || null,
				weight: input.weight ?? 0,
			})
			.returning();

		if (!category) {
			throw new Error("Failed to create category");
		}

		return category;
	}
}
