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
	gte,
	ilike,
	inArray,
	lt,
	or,
	sql,
} from "@missingstack/db/drizzle-orm";
import { categories } from "@missingstack/db/schema/categories";
import type { License, PricingModel } from "@missingstack/db/schema/enums";
import { toolAffiliateLinks } from "@missingstack/db/schema/tool-affiliate-links";
import { toolSponsorships } from "@missingstack/db/schema/tool-sponsorships";
import { type Tool, tools } from "@missingstack/db/schema/tools";
import { toolsAlternatives } from "@missingstack/db/schema/tools-alternatives";
import { toolsCategories } from "@missingstack/db/schema/tools-categories";
import { toolsStacks } from "@missingstack/db/schema/tools-stacks";
import { toolsTags } from "@missingstack/db/schema/tools-tags";
import type {
	CreateToolInput,
	ToolCollection,
	ToolData,
	ToolQueryOptions,
	ToolRepositoryInterface,
	ToolWithAlternativeCountCollection,
	ToolWithSponsorship,
	UpdateToolInput,
} from "./tools.types";

type QueryableDb = Pick<
	Database,
	"select" | "insert" | "delete" | "transaction"
>;
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

	buildLicenseFilter(license?: License[]): SQL<unknown> | null {
		if (!license || license.length === 0) return null;
		return inArray(tools.license, license);
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

	buildStackFilter(stackIds?: string[]): SQL<unknown> | null {
		if (!stackIds || stackIds.length === 0) return null;
		return exists(
			this.db
				.select()
				.from(toolsStacks)
				.where(
					and(
						eq(toolsStacks.toolId, tools.id),
						inArray(toolsStacks.stackId, stackIds),
					),
				),
		);
	}

	buildAlternativeFilter(alternativeIds?: string[]): SQL<unknown> | null {
		if (!alternativeIds || alternativeIds.length === 0) return null;
		// Find tools that have the specified tools as alternatives
		// This means: tool.alternativeIds includes any of the alternativeIds
		return exists(
			this.db
				.select()
				.from(toolsAlternatives)
				.where(
					and(
						eq(toolsAlternatives.toolId, tools.id),
						inArray(toolsAlternatives.alternativeToolId, alternativeIds),
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
			this.buildLicenseFilter(options.license),
			this.buildCategoryFilter(options.categoryIds),
			this.buildTagFilter(options.tagIds),
			this.buildStackFilter(options.stackIds),
			this.buildAlternativeFilter(options.alternativeIds),
			this.buildSearchFilter(options.search),
		].filter((condition): condition is SQL<unknown> => condition !== null);
	}
}

// SORT BUILDERS
class SortBuilder {
	static buildOrderBy(context: SortContext, db: QueryableDb): SQL<unknown>[] {
		const orderFn = context.sortOrder === "asc" ? asc : desc;
		const now = new Date();

		// Helper to check if tool has active sponsorship
		const hasActiveSponsorship = exists(
			db
				.select()
				.from(toolSponsorships)
				.where(
					and(
						eq(toolSponsorships.toolId, tools.id),
						eq(toolSponsorships.isActive, true),
						sql`${toolSponsorships.startDate} <= ${now}`,
						gt(toolSponsorships.endDate, now),
					),
				),
		);

		// Helper to check if tool has affiliate links
		const hasAffiliateLink = exists(
			db
				.select()
				.from(toolAffiliateLinks)
				.where(eq(toolAffiliateLinks.toolId, tools.id)),
		);

		// Helper to get max priority weight from active sponsorships
		const maxSponsorshipPriority = sql<number>`COALESCE((
			SELECT MAX(${toolSponsorships.priorityWeight})
			FROM ${toolSponsorships}
			WHERE ${toolSponsorships.toolId} = ${tools.id}
			AND ${toolSponsorships.isActive} = true
			AND ${toolSponsorships.startDate} <= ${now}
			AND ${toolSponsorships.endDate} > ${now}
		), 0)`;

		switch (context.sortBy) {
			case "name":
				return [orderFn(tools.name), orderFn(tools.id)];

			case "newest":
				return [
					desc(hasActiveSponsorship),
					desc(hasAffiliateLink),
					orderFn(tools.createdAt),
					orderFn(tools.id),
				];

			case "popular":
				return [
					desc(hasActiveSponsorship),
					desc(maxSponsorshipPriority),
					desc(hasAffiliateLink),
					orderFn(tools.featured),
					orderFn(tools.createdAt),
					orderFn(tools.id),
				];

			case "relevance": {
				if (!context.searchQuery) {
					// Fallback to newest if no search query
					return [
						desc(hasActiveSponsorship),
						desc(hasAffiliateLink),
						desc(tools.createdAt),
						desc(tools.id),
					];
				}
				const tsQuery = sql`plainto_tsquery('english', ${context.searchQuery})`;
				const generatedVector = sql`to_tsvector('english', ${tools.name} || ' ' || ${tools.tagline} || ' ' || ${tools.description})`;
				const rankExpr = sql<number>`ts_rank(${generatedVector}, ${tsQuery})`;
				return [
					desc(hasActiveSponsorship),
					desc(maxSponsorshipPriority),
					desc(hasAffiliateLink),
					desc(rankExpr),
					desc(tools.id),
				];
			}

			default:
				return [
					desc(hasActiveSponsorship),
					desc(hasAffiliateLink),
					desc(tools.createdAt),
					desc(tools.id),
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

		const orderByClause = SortBuilder.buildOrderBy(context, this.db);

		const now = new Date();
		// Helper to check if tool has active sponsorship
		const isSponsoredExpr = sql<boolean>`EXISTS (
			SELECT 1 FROM ${toolSponsorships}
			WHERE ${toolSponsorships.toolId} = ${tools.id}
			AND ${toolSponsorships.isActive} = true
			AND ${toolSponsorships.startDate} <= ${now}
			AND ${toolSponsorships.endDate} > ${now}
		)`.as("isSponsored");

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
			license: tools.license,
			featured: tools.featured,
			searchVector: tools.searchVector,
			createdAt: tools.createdAt,
			updatedAt: tools.updatedAt,
			isSponsored: isSponsoredExpr,
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
			license: typeof tools.license;
			featured: typeof tools.featured;
			searchVector: typeof tools.searchVector;
			createdAt: typeof tools.createdAt;
			updatedAt: typeof tools.updatedAt;
			isSponsored: SQL.Aliased<boolean>;
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
		const items = limitedRows.map(({ rank: _, isSponsored, ...item }) => ({
			...item,
			isSponsored: isSponsored ?? false,
		}));

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
			license: typeof tools.license;
			featured: typeof tools.featured;
			searchVector: typeof tools.searchVector;
			createdAt: typeof tools.createdAt;
			updatedAt: typeof tools.updatedAt;
			isSponsored: SQL.Aliased<boolean>;
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
		const items = (hasMore ? rows.slice(0, limit) : rows).map(
			({ isSponsored, ...item }) => ({
				...item,
				isSponsored: isSponsored ?? false,
			}),
		);

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

	async getByStack(
		stackId: string,
		options: ToolQueryOptions = {},
	): Promise<ToolCollection> {
		return this.getAll({
			...options,
			stackIds: [stackId],
		});
	}

	async getByAlternative(
		alternativeId: string,
		options: ToolQueryOptions = {},
	): Promise<ToolCollection> {
		return this.getAll({
			...options,
			alternativeIds: [alternativeId],
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

		const now = new Date();

		// Load relations and check sponsorship status
		const [categoryIds, tagIds, stackIds, alternativeIds, activeSponsorship] =
			await Promise.all([
				this.db
					.select({ categoryId: toolsCategories.categoryId })
					.from(toolsCategories)
					.where(eq(toolsCategories.toolId, tool.id)),
				this.db
					.select({ tagId: toolsTags.tagId })
					.from(toolsTags)
					.where(eq(toolsTags.toolId, tool.id)),
				this.db
					.select({ stackId: toolsStacks.stackId })
					.from(toolsStacks)
					.where(eq(toolsStacks.toolId, tool.id)),
				this.db
					.select({ alternativeToolId: toolsAlternatives.alternativeToolId })
					.from(toolsAlternatives)
					.where(eq(toolsAlternatives.toolId, tool.id)),
				this.db
					.select({ id: toolSponsorships.id })
					.from(toolSponsorships)
					.where(
						and(
							eq(toolSponsorships.toolId, tool.id),
							eq(toolSponsorships.isActive, true),
							sql`${toolSponsorships.startDate} <= ${now}`,
							gt(toolSponsorships.endDate, now),
						),
					)
					.limit(1),
			]);

		return {
			...tool,
			categoryIds: categoryIds.map((c) => c.categoryId),
			tagIds: tagIds.map((t) => t.tagId),
			stackIds: stackIds.map((s) => s.stackId),
			alternativeIds: alternativeIds.map((a) => a.alternativeToolId),
			isSponsored: activeSponsorship.length > 0,
		};
	}

	async getBySlug(slug: string): Promise<ToolData | null> {
		const [tool] = await this.db
			.select()
			.from(tools)
			.where(eq(tools.slug, slug))
			.limit(1);

		if (!tool) return null;

		const now = new Date();

		// Load relations and check sponsorship status
		const [categoryIds, tagIds, stackIds, alternativeIds, activeSponsorship] =
			await Promise.all([
				this.db
					.select({ categoryId: toolsCategories.categoryId })
					.from(toolsCategories)
					.where(eq(toolsCategories.toolId, tool.id)),
				this.db
					.select({ tagId: toolsTags.tagId })
					.from(toolsTags)
					.where(eq(toolsTags.toolId, tool.id)),
				this.db
					.select({ stackId: toolsStacks.stackId })
					.from(toolsStacks)
					.where(eq(toolsStacks.toolId, tool.id)),
				this.db
					.select({ alternativeToolId: toolsAlternatives.alternativeToolId })
					.from(toolsAlternatives)
					.where(eq(toolsAlternatives.toolId, tool.id)),
				this.db
					.select({ id: toolSponsorships.id })
					.from(toolSponsorships)
					.where(
						and(
							eq(toolSponsorships.toolId, tool.id),
							eq(toolSponsorships.isActive, true),
							sql`${toolSponsorships.startDate} <= ${now}`,
							gt(toolSponsorships.endDate, now),
						),
					)
					.limit(1),
			]);

		return {
			...tool,
			categoryIds: categoryIds.map((c) => c.categoryId),
			tagIds: tagIds.map((t) => t.tagId),
			stackIds: stackIds.map((s) => s.stackId),
			alternativeIds: alternativeIds.map((a) => a.alternativeToolId),
			isSponsored: activeSponsorship.length > 0,
		};
	}

	async getFeatured(limit = 10): Promise<ToolWithSponsorship[]> {
		const now = new Date();
		const isSponsoredExpr = sql<boolean>`EXISTS (
			SELECT 1 FROM ${toolSponsorships}
			WHERE ${toolSponsorships.toolId} = ${tools.id}
			AND ${toolSponsorships.isActive} = true
			AND ${toolSponsorships.startDate} <= ${now}
			AND ${toolSponsorships.endDate} > ${now}
		)`.as("isSponsored");

		// Get tools with active sponsorships first (prioritized)
		const sponsoredRows = await this.db
			.select({
				id: tools.id,
				slug: tools.slug,
				name: tools.name,
				tagline: tools.tagline,
				description: tools.description,
				logo: tools.logo,
				website: tools.website,
				pricing: tools.pricing,
				license: tools.license,
				featured: tools.featured,
				searchVector: tools.searchVector,
				createdAt: tools.createdAt,
				updatedAt: tools.updatedAt,
				isSponsored: isSponsoredExpr,
			})
			.from(tools)
			.innerJoin(
				toolSponsorships,
				and(
					eq(toolSponsorships.toolId, tools.id),
					eq(toolSponsorships.isActive, true),
					sql`${toolSponsorships.startDate} <= ${now}`,
					gt(toolSponsorships.endDate, now),
				),
			)
			.where(eq(tools.featured, true))
			.orderBy(
				desc(toolSponsorships.priorityWeight),
				desc(toolSponsorships.tier),
				desc(tools.createdAt),
				desc(tools.id),
			)
			.limit(limit);

		const sponsoredTools = sponsoredRows.map((r) => ({
			...r,
			isSponsored: r.isSponsored ?? true,
		}));

		// If we have enough sponsored tools, return them
		if (sponsoredTools.length >= limit) {
			return sponsoredTools;
		}

		// Otherwise, get remaining slots from non-sponsored featured tools
		const remainingLimit = limit - sponsoredTools.length;
		const sponsoredToolIds = sponsoredTools.map((t) => t.id);

		const regularRows =
			sponsoredToolIds.length > 0
				? await this.db
						.select({
							id: tools.id,
							slug: tools.slug,
							name: tools.name,
							tagline: tools.tagline,
							description: tools.description,
							logo: tools.logo,
							website: tools.website,
							pricing: tools.pricing,
							license: tools.license,
							featured: tools.featured,
							searchVector: tools.searchVector,
							createdAt: tools.createdAt,
							updatedAt: tools.updatedAt,
							isSponsored: isSponsoredExpr,
						})
						.from(tools)
						.where(
							and(
								eq(tools.featured, true),
								sql`${tools.id} NOT IN (${sql.join(
									sponsoredToolIds.map((id) => sql`${id}`),
									sql`, `,
								)})`,
							),
						)
						.orderBy(desc(tools.createdAt), desc(tools.id))
						.limit(remainingLimit)
				: await this.db
						.select({
							id: tools.id,
							slug: tools.slug,
							name: tools.name,
							tagline: tools.tagline,
							description: tools.description,
							logo: tools.logo,
							website: tools.website,
							pricing: tools.pricing,
							license: tools.license,
							featured: tools.featured,
							searchVector: tools.searchVector,
							createdAt: tools.createdAt,
							updatedAt: tools.updatedAt,
							isSponsored: isSponsoredExpr,
						})
						.from(tools)
						.where(eq(tools.featured, true))
						.orderBy(desc(tools.createdAt), desc(tools.id))
						.limit(remainingLimit);

		const regularTools = regularRows.map((r) => ({
			...r,
			isSponsored: r.isSponsored ?? false,
		}));

		return [...sponsoredTools, ...regularTools];
	}

	async getRecent(limit = 10): Promise<ToolWithSponsorship[]> {
		const now = new Date();
		const isSponsoredExpr = sql<boolean>`EXISTS (
			SELECT 1 FROM ${toolSponsorships}
			WHERE ${toolSponsorships.toolId} = ${tools.id}
			AND ${toolSponsorships.isActive} = true
			AND ${toolSponsorships.startDate} <= ${now}
			AND ${toolSponsorships.endDate} > ${now}
		)`.as("isSponsored");

		const rows = await this.db
			.select({
				id: tools.id,
				slug: tools.slug,
				name: tools.name,
				tagline: tools.tagline,
				description: tools.description,
				logo: tools.logo,
				website: tools.website,
				pricing: tools.pricing,
				license: tools.license,
				featured: tools.featured,
				searchVector: tools.searchVector,
				createdAt: tools.createdAt,
				updatedAt: tools.updatedAt,
				isSponsored: isSponsoredExpr,
			})
			.from(tools)
			.orderBy(desc(tools.createdAt), desc(tools.id))
			.limit(limit);

		return rows.map((r) => ({
			...r,
			isSponsored: r.isSponsored ?? false,
		}));
	}

	async getAllWithAlternativeCounts(
		options: ToolQueryOptions = {},
	): Promise<ToolWithAlternativeCountCollection> {
		const limit = options.limit ?? 20;
		const sortBy = options.sortBy ?? "newest";
		const sortOrder = options.sortOrder ?? "desc";

		const context: SortContext = {
			sortBy,
			sortOrder,
			searchQuery: options.search?.trim() || undefined,
		};

		const cursor = CursorManager.decode(options.cursor, sortBy);
		const filters = this.filterBuilder.buildAllFilters(options);

		// Get tools using the standard query executor
		const collection = await this.queryExecutor.execute(
			filters,
			context,
			cursor,
			limit,
		);

		// Get alternative counts for all tools
		const toolIds = collection.items.map((tool) => tool.id);
		const alternativeCounts = await this.getAlternativeCounts(toolIds);

		// Map tools with their alternative counts
		const items = collection.items.map((tool) => ({
			...tool,
			alternativeCount: alternativeCounts.get(tool.id) ?? 0,
		}));

		return {
			items,
			nextCursor: collection.nextCursor,
			hasMore: collection.hasMore,
		};
	}

	private async getAlternativeCounts(
		toolIds: string[],
	): Promise<Map<string, number>> {
		if (toolIds.length === 0) {
			return new Map();
		}

		const counts = await this.db
			.select({
				toolId: toolsAlternatives.toolId,
				count: sql<number>`count(*)::int`,
			})
			.from(toolsAlternatives)
			.where(inArray(toolsAlternatives.toolId, toolIds))
			.groupBy(toolsAlternatives.toolId);

		const countMap = new Map<string, number>();
		for (const { toolId, count } of counts) {
			countMap.set(toolId, count);
		}

		// Ensure all tool IDs have a count (even if 0)
		for (const toolId of toolIds) {
			if (!countMap.has(toolId)) {
				countMap.set(toolId, 0);
			}
		}

		return countMap;
	}

	async getPopular(limit = 10): Promise<ToolWithSponsorship[]> {
		const now = new Date();
		const isSponsoredExpr = sql<boolean>`EXISTS (
			SELECT 1 FROM ${toolSponsorships}
			WHERE ${toolSponsorships.toolId} = ${tools.id}
			AND ${toolSponsorships.isActive} = true
			AND ${toolSponsorships.startDate} <= ${now}
			AND ${toolSponsorships.endDate} > ${now}
		)`.as("isSponsored");

		// Popular is based on featured + creation date
		// In a real app, this might use view counts or other metrics
		const rows = await this.db
			.select({
				id: tools.id,
				slug: tools.slug,
				name: tools.name,
				tagline: tools.tagline,
				description: tools.description,
				logo: tools.logo,
				website: tools.website,
				pricing: tools.pricing,
				license: tools.license,
				featured: tools.featured,
				searchVector: tools.searchVector,
				createdAt: tools.createdAt,
				updatedAt: tools.updatedAt,
				isSponsored: isSponsoredExpr,
			})
			.from(tools)
			.orderBy(desc(tools.featured), desc(tools.createdAt), desc(tools.id))
			.limit(limit);

		return rows.map((r) => ({
			...r,
			isSponsored: r.isSponsored ?? false,
		}));
	}

	async create(input: CreateToolInput): Promise<ToolData> {
		return this.db.transaction(async (tx) => {
			// Insert the tool
			const [tool] = await tx
				.insert(tools)
				.values({
					slug: input.slug,
					name: input.name,
					tagline: input.tagline || null,
					description: input.description,
					logo: input.logo,
					website: input.website || null,
					pricing: input.pricing,
					license: input.license || null,
					featured: input.featured ?? false,
				})
				.returning();

			if (!tool) {
				throw new Error("Failed to create tool");
			}

			// Insert junction table records
			if (input.categoryIds.length > 0) {
				await tx.insert(toolsCategories).values(
					input.categoryIds.map((categoryId) => ({
						toolId: tool.id,
						categoryId,
					})),
				);
			}

			if (input.stackIds.length > 0) {
				await tx.insert(toolsStacks).values(
					input.stackIds.map((stackId) => ({
						toolId: tool.id,
						stackId,
					})),
				);
			}

			if (input.tagIds.length > 0) {
				await tx.insert(toolsTags).values(
					input.tagIds.map((tagId) => ({
						toolId: tool.id,
						tagId,
					})),
				);
			}

			if (input.alternativeIds.length > 0) {
				await tx.insert(toolsAlternatives).values(
					input.alternativeIds.map((alternativeId) => ({
						toolId: tool.id,
						alternativeToolId: alternativeId,
					})),
				);
			}

			// Update search vector (PostgreSQL trigger should handle this, but we can also do it manually)
			await tx.execute(
				sql`UPDATE tools SET search_vector = 
					to_tsvector('english', coalesce(name, '') || ' ' || coalesce(tagline, '') || ' ' || coalesce(description, ''))
					WHERE id = ${tool.id}`,
			);

			// Return tool with relations
			return {
				...tool,
				categoryIds: input.categoryIds,
				tagIds: input.tagIds,
				stackIds: input.stackIds,
				alternativeIds: input.alternativeIds,
			};
		});
	}

	async update(id: string, input: UpdateToolInput): Promise<ToolData> {
		return this.db.transaction(async (tx) => {
			// Update the tool
			const updateData: Partial<typeof tools.$inferInsert> = {
				...(input.slug && { slug: input.slug }),
				...(input.name && { name: input.name }),
				...(input.tagline && {
					tagline: input.tagline || null,
				}),
				...(input.description && {
					description: input.description,
				}),
				...(input.logo && { logo: input.logo }),
				...(input.website && {
					website: input.website || null,
				}),
				...(input.pricing && { pricing: input.pricing }),
				...(input.license && {
					license: input.license || null,
				}),
				...(input.featured && { featured: input.featured }),
			};

			const [tool] = await tx
				.update(tools)
				.set(updateData)
				.where(eq(tools.id, id))
				.returning();

			if (!tool) {
				throw new Error("Failed to update tool");
			}

			// Update relations if provided - make it idempotent by comparing current vs new
			if (input.categoryIds) {
				// Get current relations
				const currentCategoryIds = await tx
					.select({ categoryId: toolsCategories.categoryId })
					.from(toolsCategories)
					.where(eq(toolsCategories.toolId, tool.id));

				const currentSet = new Set(currentCategoryIds.map((c) => c.categoryId));
				const newSet = new Set(input.categoryIds);

				// Find IDs to remove (in current but not in new)
				const toRemove = Array.from(currentSet).filter((id) => !newSet.has(id));
				// Find IDs to add (in new but not in current)
				const toAdd = Array.from(newSet).filter((id) => !currentSet.has(id));

				// Only delete what needs to be removed
				if (toRemove.length > 0) {
					await tx
						.delete(toolsCategories)
						.where(
							and(
								eq(toolsCategories.toolId, tool.id),
								inArray(toolsCategories.categoryId, toRemove),
							),
						);
				}

				// Only insert what needs to be added
				if (toAdd.length > 0) {
					await tx.insert(toolsCategories).values(
						toAdd.map((categoryId) => ({
							toolId: tool.id,
							categoryId,
						})),
					);
				}
			}

			if (input.stackIds) {
				const currentStackIds = await tx
					.select({ stackId: toolsStacks.stackId })
					.from(toolsStacks)
					.where(eq(toolsStacks.toolId, tool.id));

				const currentSet = new Set(currentStackIds.map((s) => s.stackId));
				const newSet = new Set(input.stackIds);

				const toRemove = Array.from(currentSet).filter((id) => !newSet.has(id));
				const toAdd = Array.from(newSet).filter((id) => !currentSet.has(id));

				if (toRemove.length > 0) {
					await tx
						.delete(toolsStacks)
						.where(
							and(
								eq(toolsStacks.toolId, tool.id),
								inArray(toolsStacks.stackId, toRemove),
							),
						);
				}

				if (toAdd.length > 0) {
					await tx.insert(toolsStacks).values(
						toAdd.map((stackId) => ({
							toolId: tool.id,
							stackId,
						})),
					);
				}
			}

			if (input.tagIds) {
				const currentTagIds = await tx
					.select({ tagId: toolsTags.tagId })
					.from(toolsTags)
					.where(eq(toolsTags.toolId, tool.id));

				const currentSet = new Set(currentTagIds.map((t) => t.tagId));
				const newSet = new Set(input.tagIds);

				const toRemove = Array.from(currentSet).filter((id) => !newSet.has(id));
				const toAdd = Array.from(newSet).filter((id) => !currentSet.has(id));

				if (toRemove.length > 0) {
					await tx
						.delete(toolsTags)
						.where(
							and(
								eq(toolsTags.toolId, tool.id),
								inArray(toolsTags.tagId, toRemove),
							),
						);
				}

				if (toAdd.length > 0) {
					await tx.insert(toolsTags).values(
						toAdd.map((tagId) => ({
							toolId: tool.id,
							tagId,
						})),
					);
				}
			}

			if (input.alternativeIds) {
				const currentAlternativeIds = await tx
					.select({
						alternativeToolId: toolsAlternatives.alternativeToolId,
					})
					.from(toolsAlternatives)
					.where(eq(toolsAlternatives.toolId, tool.id));

				const currentSet = new Set(
					currentAlternativeIds.map((a) => a.alternativeToolId),
				);
				const newSet = new Set(input.alternativeIds);

				const toRemove = Array.from(currentSet).filter((id) => !newSet.has(id));
				const toAdd = Array.from(newSet).filter((id) => !currentSet.has(id));

				if (toRemove.length > 0) {
					await tx
						.delete(toolsAlternatives)
						.where(
							and(
								eq(toolsAlternatives.toolId, tool.id),
								inArray(toolsAlternatives.alternativeToolId, toRemove),
							),
						);
				}

				if (toAdd.length > 0) {
					await tx.insert(toolsAlternatives).values(
						toAdd.map((alternativeId) => ({
							toolId: tool.id,
							alternativeToolId: alternativeId,
						})),
					);
				}
			}

			// Update search vector
			await tx.execute(
				sql`UPDATE tools SET search_vector = 
					to_tsvector('english', coalesce(name, '') || ' ' || coalesce(tagline, '') || ' ' || coalesce(description, ''))
					WHERE id = ${tool.id}`,
			);

			// Return tool with relations
			const [categoryIds, tagIds, stackIds, alternativeIds] = await Promise.all(
				[
					tx
						.select({ categoryId: toolsCategories.categoryId })
						.from(toolsCategories)
						.where(eq(toolsCategories.toolId, tool.id)),
					tx
						.select({ tagId: toolsTags.tagId })
						.from(toolsTags)
						.where(eq(toolsTags.toolId, tool.id)),
					tx
						.select({ stackId: toolsStacks.stackId })
						.from(toolsStacks)
						.where(eq(toolsStacks.toolId, tool.id)),
					tx
						.select({
							alternativeToolId: toolsAlternatives.alternativeToolId,
						})
						.from(toolsAlternatives)
						.where(eq(toolsAlternatives.toolId, tool.id)),
				],
			);

			return {
				...tool,
				categoryIds: categoryIds.map((c) => c.categoryId),
				tagIds: tagIds.map((t) => t.tagId),
				stackIds: stackIds.map((s) => s.stackId),
				alternativeIds: alternativeIds.map((a) => a.alternativeToolId),
			};
		});
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(tools).where(eq(tools.id, id));
	}

	async getByDateRange(
		startDate: Date,
		endDate: Date,
	): Promise<Array<Tool & { categoryNames: string[] }>> {
		// Query tools created within the date range
		const toolRows = await this.db
			.select()
			.from(tools)
			.where(and(gte(tools.createdAt, startDate), lt(tools.createdAt, endDate)))
			.orderBy(desc(tools.createdAt), desc(tools.id));

		if (toolRows.length === 0) {
			return [];
		}

		// Get category names for all tools
		const toolIds = toolRows.map((t) => t.id);
		const categoryMappings = await this.db
			.select({
				toolId: toolsCategories.toolId,
				categoryName: categories.name,
			})
			.from(toolsCategories)
			.innerJoin(categories, eq(toolsCategories.categoryId, categories.id))
			.where(inArray(toolsCategories.toolId, toolIds));

		// Group categories by tool ID
		const categoriesByTool = new Map<string, string[]>();
		for (const mapping of categoryMappings) {
			const existing = categoriesByTool.get(mapping.toolId) || [];
			existing.push(mapping.categoryName);
			categoriesByTool.set(mapping.toolId, existing);
		}

		// Combine tools with their category names
		return toolRows.map((tool) => ({
			...tool,
			categoryNames: categoriesByTool.get(tool.id) || [],
		}));
	}
}
