import type { BaseQueryOptions } from "@missingstack/api/types";
import type { Database } from "@missingstack/db";
import {
	type SQL,
	and,
	asc,
	desc,
	eq,
	exists,
	gt,
	ilike,
	inArray,
	lt,
	or,
	sql,
} from "@missingstack/db/drizzle-orm";
import type { Platform, PricingModel } from "@missingstack/db/schema/enums";
import {
	type Tool,
	tools,
	toolsCategories,
	toolsPlatforms,
	toolsTags,
} from "@missingstack/db/schema/tools";
import type {
	ToolCollection,
	ToolData,
	ToolQueryOptions,
	ToolRepositoryInterface,
} from "./tools.types";

type QueryableDb = Pick<Database, "select" | "transaction">;
type CursorState = {
	id: string;
	createdAt?: Date;
	name?: string;
	rank?: number;
};

type EncodedCursor = {
	id: string;
	createdAt?: string;
	name?: string;
	rank?: number;
	sortBy?: string;
};

type SortContext = {
	sortBy: "name" | "newest" | "popular" | "relevance";
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
			rank: state.rank,
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

			if (typeof parsed.rank === "number") {
				state.rank = parsed.rank;
			}

			return state;
		} catch {
			return null;
		}
	}
}
// FILTER BUILDERS
class FilterBuilder {
	constructor(private readonly db: QueryableDb) {}

	buildFeaturedFilter(featured?: boolean): SQL<unknown> | null {
		if (typeof featured !== "boolean") return null;
		return eq(tools.featured, featured);
	}

	buildPricingFilter(pricing?: PricingModel[]): SQL<unknown> | null {
		if (!pricing || pricing.length === 0) return null;
		return inArray(tools.pricing, pricing);
	}

	buildCategoryFilter(categoryIds?: string[]): SQL<unknown> | null {
		if (!categoryIds || categoryIds.length === 0) return null;
		return exists(
			this.db
				.select()
				.from(toolsCategories)
				.where(
					and(
						eq(toolsCategories.toolId, tools.id),
						inArray(toolsCategories.categoryId, categoryIds),
					),
				),
		);
	}

	buildTagFilter(tagIds?: string[]): SQL<unknown> | null {
		if (!tagIds || tagIds.length === 0) return null;
		return exists(
			this.db
				.select()
				.from(toolsTags)
				.where(
					and(eq(toolsTags.toolId, tools.id), inArray(toolsTags.tagId, tagIds)),
				),
		);
	}

	buildPlatformFilter(platforms?: Platform[]): SQL<unknown> | null {
		if (!platforms || platforms.length === 0) return null;
		return exists(
			this.db
				.select()
				.from(toolsPlatforms)
				.where(
					and(
						eq(toolsPlatforms.toolId, tools.id),
						inArray(toolsPlatforms.platform, platforms),
					),
				),
		);
	}

	buildSearchFilter(search?: string): SQL<unknown> | null {
		if (!search) return null;
		const searchQuery = search.trim();
		if (!searchQuery) return null;

		// For longer queries, generate tsvector on-the-fly from text fields
		// This ensures search works even if search_vector column is NULL
		// Also include ILIKE pattern matching as fallback for better coverage
		const tsQuery = sql`plainto_tsquery('english', ${searchQuery})`;
		const generatedVector = sql`to_tsvector('english', ${tools.name} || ' ' || ${tools.tagline} || ' ' || ${tools.description})`;
		const pattern = `%${searchQuery}%`;

		return (
			or(
				sql`${generatedVector} @@ ${tsQuery}`,
				ilike(tools.name, pattern),
				ilike(tools.tagline, pattern),
				ilike(tools.description, pattern),
			) ?? null
		);
	}

	buildAllFilters(options: ToolQueryOptions): SQL<unknown>[] {
		return [
			this.buildFeaturedFilter(options.featured),
			this.buildPricingFilter(options.pricing),
			this.buildCategoryFilter(options.categoryIds),
			this.buildTagFilter(options.tagIds),
			this.buildPlatformFilter(options.platforms),
			this.buildSearchFilter(options.search),
		].filter((condition): condition is SQL<unknown> => condition !== null);
	}
}

// SORT BUILDERS
class SortBuilder {
	static buildOrderBy(context: SortContext): SQL<unknown>[] {
		const orderFn = context.sortOrder === "asc" ? asc : desc;

		switch (context.sortBy) {
			case "name":
				return [orderFn(tools.name), orderFn(tools.id)];

			case "newest":
				return [orderFn(tools.createdAt), orderFn(tools.id)];

			case "popular":
				return [
					orderFn(tools.featured),
					orderFn(tools.createdAt),
					orderFn(tools.id),
				];

			case "relevance": {
				if (!context.searchQuery) {
					// Fallback to newest if no search query
					return [desc(tools.createdAt), desc(tools.id)];
				}
				const tsQuery = sql`plainto_tsquery('english', ${context.searchQuery})`;
				const generatedVector = sql`to_tsvector('english', ${tools.name} || ' ' || ${tools.tagline} || ' ' || ${tools.description})`;
				const rankExpr = sql<number>`ts_rank(${generatedVector}, ${tsQuery})`;
				return [desc(rankExpr), desc(tools.id)];
			}

			default:
				return [desc(tools.createdAt), desc(tools.id)];
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
					return compareFn(tools.id, cursorState.id);
				}
				return (
					or(
						compareFn(tools.name, cursorState.name),
						and(
							eq(tools.name, cursorState.name),
							compareFn(tools.id, cursorState.id),
						),
					) ?? null
				);
			}

			case "newest": {
				if (!cursorState.createdAt) {
					return compareFn(tools.id, cursorState.id);
				}
				return (
					or(
						compareFn(tools.createdAt, cursorState.createdAt),
						and(
							eq(tools.createdAt, cursorState.createdAt),
							compareFn(tools.id, cursorState.id),
						),
					) ?? null
				);
			}

			case "popular": {
				if (!cursorState.createdAt) {
					return compareFn(tools.id, cursorState.id);
				}
				return (
					or(
						compareFn(tools.createdAt, cursorState.createdAt),
						and(
							eq(tools.createdAt, cursorState.createdAt),
							compareFn(tools.id, cursorState.id),
						),
					) ?? null
				);
			}

			case "relevance": {
				if (!context.searchQuery) {
					// Fallback to createdAt if no search query
					if (!cursorState.createdAt) {
						return compareFn(tools.id, cursorState.id);
					}
					return (
						or(
							compareFn(tools.createdAt, cursorState.createdAt),
							and(
								eq(tools.createdAt, cursorState.createdAt),
								compareFn(tools.id, cursorState.id),
							),
						) ?? null
					);
				}

				if (typeof cursorState.rank !== "number") {
					return compareFn(tools.id, cursorState.id);
				}

				const tsQuery = sql`plainto_tsquery('english', ${context.searchQuery})`;
				const generatedVector = sql`to_tsvector('english', ${tools.name} || ' ' || ${tools.tagline} || ' ' || ${tools.description})`;
				const rankExpr = sql<number>`ts_rank(${generatedVector}, ${tsQuery})`;

				return (
					or(
						lt(rankExpr, cursorState.rank), // Always use lt for rank (higher rank = earlier)
						and(eq(rankExpr, cursorState.rank), gt(tools.id, cursorState.id)),
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
	): Promise<ToolCollection> {
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

		// Base select fields
		const selectFields = {
			id: tools.id,
			slug: tools.slug,
			name: tools.name,
			tagline: tools.tagline,
			description: tools.description,
			logo: tools.logo,
			website: tools.website,
			pricing: tools.pricing,
			featured: tools.featured,
			createdAt: tools.createdAt,
			updatedAt: tools.updatedAt,
		};

		// Handle relevance search with rank
		if (context.sortBy === "relevance" && context.searchQuery) {
			return this.executeRelevanceQuery(
				selectFields,
				whereClause,
				orderByClause,
				context,
				limit,
			);
		}

		// Standard query
		return this.executeStandardQuery(
			selectFields,
			whereClause,
			orderByClause,
			context,
			limit,
		);
	}

	private async executeRelevanceQuery(
		selectFields: {
			id: typeof tools.id;
			slug: typeof tools.slug;
			name: typeof tools.name;
			tagline: typeof tools.tagline;
			description: typeof tools.description;
			logo: typeof tools.logo;
			website: typeof tools.website;
			pricing: typeof tools.pricing;
			featured: typeof tools.featured;
			createdAt: typeof tools.createdAt;
			updatedAt: typeof tools.updatedAt;
		},
		whereClause: SQL<unknown>,
		orderByClause: SQL<unknown>[],
		context: SortContext,
		limit: number,
	): Promise<ToolCollection> {
		const tsQuery = sql`plainto_tsquery('english', ${context.searchQuery})`;
		const generatedVector = sql`to_tsvector('english', ${tools.name} || ' ' || ${tools.tagline} || ' ' || ${tools.description})`;
		const rankExpr = sql<number>`ts_rank(${generatedVector}, ${tsQuery})`;

		const rows = await this.db
			.select({
				...selectFields,
				rank: rankExpr.as("rank"),
			})
			.from(tools)
			.where(whereClause)
			.orderBy(...orderByClause)
			.limit(limit + 1);

		const hasMore = rows.length > limit;
		const limitedRows = hasMore ? rows.slice(0, limit) : rows;
		const items: Tool[] = limitedRows.map(
			({ rank: _, ...item }) => item as Tool,
		);

		const lastItem =
			hasMore && items.length > 0 ? items[items.length - 1] : null;
		const lastRow =
			hasMore && limitedRows.length > 0
				? limitedRows[limitedRows.length - 1]
				: null;

		const nextCursor =
			lastItem && lastRow
				? CursorManager.encode(
						{
							id: lastItem.id,
							createdAt: lastItem.createdAt,
							name: lastItem.name,
							rank: lastRow.rank,
						},
						context.sortBy,
					)
				: null;

		return { items, nextCursor, hasMore };
	}

	private async executeStandardQuery(
		selectFields: {
			id: typeof tools.id;
			slug: typeof tools.slug;
			name: typeof tools.name;
			tagline: typeof tools.tagline;
			description: typeof tools.description;
			logo: typeof tools.logo;
			website: typeof tools.website;
			pricing: typeof tools.pricing;
			featured: typeof tools.featured;
			createdAt: typeof tools.createdAt;
			updatedAt: typeof tools.updatedAt;
		},
		whereClause: SQL<unknown>,
		orderByClause: SQL<unknown>[],
		context: SortContext,
		limit: number,
	): Promise<ToolCollection> {
		const rows = await this.db
			.select(selectFields)
			.from(tools)
			.where(whereClause)
			.orderBy(...orderByClause)
			.limit(limit + 1);

		const hasMore = rows.length > limit;
		const items: Tool[] = (hasMore ? rows.slice(0, limit) : rows) as Tool[];

		const lastItem =
			hasMore && items.length > 0 ? items[items.length - 1] : null;

		const nextCursor = lastItem
			? CursorManager.encode(
					{
						id: lastItem.id,
						createdAt: lastItem.createdAt,
						name: lastItem.name,
					},
					context.sortBy,
				)
			: null;

		return { items, nextCursor, hasMore };
	}
}

// REPOSITORY

export class DrizzleToolRepository implements ToolRepositoryInterface {
	private readonly filterBuilder: FilterBuilder;
	private readonly queryExecutor: QueryExecutor;

	constructor(private readonly db: QueryableDb) {
		this.filterBuilder = new FilterBuilder(db);
		this.queryExecutor = new QueryExecutor(db);
	}

	async getAll(options: ToolQueryOptions = {}): Promise<ToolCollection> {
		const limit = options.limit ?? 8;
		const sortBy = options.sortBy ?? "newest";
		const sortOrder = options.sortOrder ?? "desc";

		const context: SortContext = {
			sortBy,
			sortOrder,
			searchQuery: options.search?.trim() || undefined,
		};

		const cursor = CursorManager.decode(options.cursor, sortBy);
		const filters = this.filterBuilder.buildAllFilters(options);

		return this.queryExecutor.execute(filters, context, cursor, limit);
	}

	async getByCategory(
		categoryId: string,
		options: ToolQueryOptions = {},
	): Promise<ToolCollection> {
		return this.getAll({
			...options,
			categoryIds: [categoryId],
		});
	}

	async getByTag(
		tagId: string,
		options: ToolQueryOptions = {},
	): Promise<ToolCollection> {
		return this.getAll({
			...options,
			tagIds: [tagId],
		});
	}

	async search(
		query: string,
		options: BaseQueryOptions = {},
	): Promise<ToolCollection> {
		return this.getAll({
			...options,
			search: query,
			sortBy: options.sortBy ?? "relevance",
		});
	}

	async getById(id: string): Promise<ToolData | null> {
		const [tool] = await this.db
			.select()
			.from(tools)
			.where(eq(tools.id, id))
			.limit(1);

		if (!tool) return null;

		// Load relations
		const [categoryIds, tagIds, platforms] = await Promise.all([
			this.db
				.select({ categoryId: toolsCategories.categoryId })
				.from(toolsCategories)
				.where(eq(toolsCategories.toolId, id)),
			this.db
				.select({ tagId: toolsTags.tagId })
				.from(toolsTags)
				.where(eq(toolsTags.toolId, id)),
			this.db
				.select({ platform: toolsPlatforms.platform })
				.from(toolsPlatforms)
				.where(eq(toolsPlatforms.toolId, id)),
		]);

		return {
			...tool,
			categoryIds: categoryIds.map((c) => c.categoryId),
			tagIds: tagIds.map((t) => t.tagId),
			platforms: platforms.map((p) => p.platform),
		};
	}

	async getBySlug(slug: string): Promise<ToolData | null> {
		const [tool] = await this.db
			.select()
			.from(tools)
			.where(eq(tools.slug, slug))
			.limit(1);

		if (!tool) return null;

		// Load relations
		const [categoryIds, tagIds, platforms] = await Promise.all([
			this.db
				.select({ categoryId: toolsCategories.categoryId })
				.from(toolsCategories)
				.where(eq(toolsCategories.toolId, tool.id)),
			this.db
				.select({ tagId: toolsTags.tagId })
				.from(toolsTags)
				.where(eq(toolsTags.toolId, tool.id)),
			this.db
				.select({ platform: toolsPlatforms.platform })
				.from(toolsPlatforms)
				.where(eq(toolsPlatforms.toolId, tool.id)),
		]);

		return {
			...tool,
			categoryIds: categoryIds.map((c) => c.categoryId),
			tagIds: tagIds.map((t) => t.tagId),
			platforms: platforms.map((p) => p.platform),
		};
	}

	async getFeatured(limit = 10): Promise<Tool[]> {
		const rows = await this.db
			.select()
			.from(tools)
			.where(eq(tools.featured, true))
			.orderBy(desc(tools.createdAt), desc(tools.id))
			.limit(limit);

		return rows;
	}

	async getRecent(limit = 10): Promise<Tool[]> {
		const rows = await this.db
			.select()
			.from(tools)
			.orderBy(desc(tools.createdAt), desc(tools.id))
			.limit(limit);

		return rows;
	}

	async getPopular(limit = 10): Promise<Tool[]> {
		// Popular is based on featured + creation date
		// In a real app, this might use view counts or other metrics
		const rows = await this.db
			.select()
			.from(tools)
			.orderBy(desc(tools.featured), desc(tools.createdAt), desc(tools.id))
			.limit(limit);

		return rows;
	}

	async withTransaction<T>(
		handler: (repo: ToolRepositoryInterface) => Promise<T>,
	): Promise<T> {
		return this.db.transaction(async (tx) => {
			const transactionalRepo = new DrizzleToolRepository(tx as QueryableDb);
			return handler(transactionalRepo);
		});
	}
}
