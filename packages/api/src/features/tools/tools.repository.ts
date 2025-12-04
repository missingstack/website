import {
	type BaseCursorState,
	BasePaginatedRepository,
	CursorManager,
	FilterBuilder,
	type PaginatedCollection,
	QueryExecutor,
	type QueryStrategy,
	SortBuilder,
	type SortConfig,
	type SortFieldConfig,
} from "@missingstack/api/shared/pagination";
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
	"select" | "transaction" | "insert" | "update" | "delete"
>;

type ToolCursor = BaseCursorState & {
	name?: string;
	rank?: number;
};

type ToolSortBy = "name" | "newest" | "popular" | "relevance";

class ToolFilterBuilder extends FilterBuilder<ToolQueryOptions> {
	constructor(private readonly db: QueryableDb) {
		super();
	}

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

	protected buildSearchFilter(options: ToolQueryOptions): SQL<unknown> | null {
		const search = options.search;
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

	protected buildEntityFilters(options: ToolQueryOptions): SQL<unknown>[] {
		return [
			this.buildFeaturedFilter(options.featured),
			this.buildPricingFilter(options.pricing),
			this.buildLicenseFilter(options.license),
			this.buildCategoryFilter(options.categoryIds),
			this.buildTagFilter(options.tagIds),
			this.buildStackFilter(options.stackIds),
			this.buildAlternativeFilter(options.alternativeIds),
		].filter((condition): condition is SQL<unknown> => condition !== null);
	}
}

class ToolSortBuilder extends SortBuilder<
	typeof tools,
	ToolCursor,
	ToolSortBy
> {
	constructor(private readonly db: QueryableDb) {
		super();
	}

	protected readonly sortFields: Record<
		ToolSortBy,
		SortFieldConfig<typeof tools>
	> = {
		name: {
			field: tools.name,
			cursorKey: "name",
		},
		newest: {
			field: tools.createdAt,
			cursorKey: "createdAt",
		},
		popular: {
			field: tools.createdAt,
			cursorKey: "createdAt",
		},
		relevance: {
			field: tools.createdAt,
			cursorKey: "createdAt",
		},
	} as const;

	protected readonly idField = tools.id;

	protected buildDefaultOrderBy(): SQL<unknown>[] {
		const now = new Date();
		const hasActiveSponsorship = exists(
			this.db
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
		const hasAffiliateLink = exists(
			this.db
				.select()
				.from(toolAffiliateLinks)
				.where(eq(toolAffiliateLinks.toolId, tools.id)),
		);
		return [
			desc(hasActiveSponsorship),
			desc(hasAffiliateLink),
			desc(tools.createdAt),
			desc(tools.id),
		];
	}

	buildOrderBy(
		config: SortConfig<ToolSortBy>,
		searchQuery?: string,
	): SQL<unknown>[] {
		const orderFn = config.sortOrder === "asc" ? asc : desc;
		const now = new Date();

		// Helper to check if tool has active sponsorship
		const hasActiveSponsorship = exists(
			this.db
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
			this.db
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

		switch (config.sortBy) {
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
				if (!searchQuery) {
					return [
						desc(hasActiveSponsorship),
						desc(hasAffiliateLink),
						desc(tools.createdAt),
						desc(tools.id),
					];
				}
				const tsQuery = sql`plainto_tsquery('english', ${searchQuery})`;
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
				return this.buildDefaultOrderBy();
		}
	}

	buildCursorCondition(
		cursor: ToolCursor,
		config: SortConfig<ToolSortBy>,
		searchQuery?: string,
	): SQL<unknown> | null {
		if (!cursor.id) return null;

		const isAsc = config.sortOrder === "asc";
		const compareFn = isAsc ? gt : lt;

		switch (config.sortBy) {
			case "name": {
				if (!cursor.name) {
					return compareFn(tools.id, cursor.id);
				}
				return (
					or(
						compareFn(tools.name, cursor.name),
						and(eq(tools.name, cursor.name), compareFn(tools.id, cursor.id)),
					) ?? null
				);
			}

			case "newest": {
				if (!cursor.createdAt) {
					return compareFn(tools.id, cursor.id);
				}
				return (
					or(
						compareFn(tools.createdAt, cursor.createdAt),
						and(
							eq(tools.createdAt, cursor.createdAt),
							compareFn(tools.id, cursor.id),
						),
					) ?? null
				);
			}

			case "popular": {
				if (!cursor.createdAt) {
					return compareFn(tools.id, cursor.id);
				}
				return (
					or(
						compareFn(tools.createdAt, cursor.createdAt),
						and(
							eq(tools.createdAt, cursor.createdAt),
							compareFn(tools.id, cursor.id),
						),
					) ?? null
				);
			}

			case "relevance": {
				if (!searchQuery) {
					// Fallback to createdAt if no search query
					if (!cursor.createdAt) {
						return compareFn(tools.id, cursor.id);
					}
					return (
						or(
							compareFn(tools.createdAt, cursor.createdAt),
							and(
								eq(tools.createdAt, cursor.createdAt),
								compareFn(tools.id, cursor.id),
							),
						) ?? null
					);
				}

				if (typeof cursor.rank !== "number") {
					return compareFn(tools.id, cursor.id);
				}

				const tsQuery = sql`plainto_tsquery('english', ${searchQuery})`;
				const generatedVector = sql`to_tsvector('english', ${tools.name} || ' ' || ${tools.tagline} || ' ' || ${tools.description})`;
				const rankExpr = sql<number>`ts_rank(${generatedVector}, ${tsQuery})`;

				return (
					or(
						lt(rankExpr, cursor.rank), // Always use lt for rank (higher rank = earlier)
						and(eq(rankExpr, cursor.rank), gt(tools.id, cursor.id)),
					) ?? null
				);
			}

			default:
				return null;
		}
	}
}

class ToolQueryExecutor extends QueryExecutor<
	ToolWithSponsorship,
	typeof tools,
	ToolCursor,
	ToolSortBy
> {
	constructor(
		db: QueryableDb,
		private readonly sortBuilder: ToolSortBuilder,
	) {
		super(
			db,
			tools,
			new CursorManager<ToolCursor>({
				secretKey: process.env.CURSOR_SIGNING_SECRET,
			}),
		);
	}

	private getIsSponsoredExpr(): SQL.Aliased<boolean> {
		const now = new Date();
		return sql<boolean>`EXISTS (
			SELECT 1 FROM ${toolSponsorships}
			WHERE ${toolSponsorships.toolId} = ${tools.id}
			AND ${toolSponsorships.isActive} = true
			AND ${toolSponsorships.startDate} <= ${now}
			AND ${toolSponsorships.endDate} > ${now}
		)`.as("isSponsored");
	}

	private getSelectFields() {
		return {
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
			isSponsored: this.getIsSponsoredExpr(),
		};
	}

	protected async executeQuery(
		where: SQL<unknown>,
		orderBy: SQL<unknown>[],
		limit: number,
	): Promise<ToolWithSponsorship[]> {
		const selectFields = this.getSelectFields();
		const rows = await this.db
			.select(selectFields)
			.from(tools)
			.where(where)
			.orderBy(...orderBy)
			.limit(limit);

		return rows.map(({ isSponsored, ...item }) => ({
			...item,
			isSponsored: isSponsored ?? false,
		}));
	}

	protected buildCursorCondition(
		cursor: ToolCursor,
		sortConfig: SortConfig<ToolSortBy>,
	): SQL<unknown> | null {
		// Get search query from sortConfig if available (passed via metadata)
		const searchQuery = (
			sortConfig as SortConfig<ToolSortBy> & {
				searchQuery?: string;
			}
		).searchQuery;
		return this.sortBuilder.buildCursorCondition(
			cursor,
			sortConfig,
			searchQuery,
		);
	}

	protected buildOrderBy(sortConfig: SortConfig<ToolSortBy>): SQL<unknown>[] {
		// Get search query from sortConfig if available (passed via metadata)
		const searchQuery = (
			sortConfig as SortConfig<ToolSortBy> & {
				searchQuery?: string;
			}
		).searchQuery;
		return this.sortBuilder.buildOrderBy(sortConfig, searchQuery);
	}

	protected createCursor(entity: ToolWithSponsorship, sortBy: string): string {
		// For relevance searches, we need rank, but it's not in the entity
		// This will be handled in the execute method override
		return this.cursorManager.encode(
			{
				id: entity.id,
				createdAt: entity.createdAt,
				name: entity.name,
			},
			sortBy,
		);
	}

	// Override execute to handle relevance search with rank
	async execute(
		filters: SQL<unknown>[],
		sortConfig: SortConfig<ToolSortBy>,
		cursor: ToolCursor | null,
		limit: number,
		strategy: QueryStrategy,
	): Promise<PaginatedCollection<ToolWithSponsorship>> {
		const searchQuery = (
			sortConfig as SortConfig<ToolSortBy> & {
				searchQuery?: string;
			}
		).searchQuery;

		// Handle relevance search with rank
		if (sortConfig.sortBy === "relevance" && searchQuery) {
			return this.executeRelevanceQuery(
				filters,
				sortConfig,
				cursor,
				limit,
				searchQuery,
			);
		}

		// Standard query
		return super.execute(filters, sortConfig, cursor, limit, strategy);
	}

	private async executeRelevanceQuery(
		filters: SQL<unknown>[],
		sortConfig: SortConfig<ToolSortBy>,
		cursor: ToolCursor | null,
		limit: number,
		searchQuery: string,
	): Promise<PaginatedCollection<ToolWithSponsorship>> {
		const conditions = [...filters];

		if (cursor) {
			const cursorCondition = this.sortBuilder.buildCursorCondition(
				cursor,
				sortConfig,
				searchQuery,
			);
			if (cursorCondition) {
				conditions.push(cursorCondition);
			}
		}

		const whereClause =
			conditions.length > 0 ? (and(...conditions) ?? sql`true`) : sql`true`;

		const orderByClause = this.sortBuilder.buildOrderBy(
			sortConfig,
			searchQuery,
		);

		const tsQuery = sql`plainto_tsquery('english', ${searchQuery})`;
		const generatedVector = sql`to_tsvector('english', ${tools.name} || ' ' || ${tools.tagline} || ' ' || ${tools.description})`;
		const rankExpr = sql<number>`ts_rank(${generatedVector}, ${tsQuery})`;

		const selectFields = this.getSelectFields();
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

		const lastItem = items.length > 0 ? items[items.length - 1] : null;
		const lastRow =
			limitedRows.length > 0 ? limitedRows[limitedRows.length - 1] : null;

		const nextCursor =
			lastItem && lastRow && typeof lastRow.rank === "number"
				? this.cursorManager.encode(
						{
							id: lastItem.id,
							createdAt: lastItem.createdAt,
							name: lastItem.name,
							rank: lastRow.rank,
						},
						sortConfig.sortBy,
					)
				: null;

		return {
			items,
			nextCursor,
			hasMore,
			metadata: { count: items.length },
		};
	}
}

export class DrizzleToolRepository
	extends BasePaginatedRepository<
		ToolWithSponsorship,
		typeof tools,
		ToolCursor,
		ToolQueryOptions,
		ToolSortBy
	>
	implements ToolRepositoryInterface
{
	protected readonly filterBuilder: ToolFilterBuilder;
	protected readonly queryExecutor: ToolQueryExecutor;
	private readonly sortBuilder: ToolSortBuilder;

	constructor(private readonly db: QueryableDb) {
		super();
		this.filterBuilder = new ToolFilterBuilder(db);
		this.sortBuilder = new ToolSortBuilder(db);
		this.queryExecutor = new ToolQueryExecutor(db, this.sortBuilder);
	}

	async getAll(options: ToolQueryOptions = {}): Promise<ToolCollection> {
		// Handle cursor validation failure with fallback
		const cursorValidation = this.queryExecutor.decodeCursor(
			options.cursor,
			options.sortBy,
		);

		if (options.cursor && !cursorValidation) {
			const result = await super.getAll({ ...options, cursor: null });
			return {
				items: result.items,
				nextCursor: result.nextCursor,
				hasMore: result.hasMore,
			};
		}

		const result = await super.getAll(options);
		return {
			items: result.items,
			nextCursor: result.nextCursor,
			hasMore: result.hasMore,
		};
	}

	protected buildSortConfig(
		options: ToolQueryOptions,
	): SortConfig<ToolSortBy> & { searchQuery?: string } {
		return {
			sortBy: options.sortBy ?? "newest",
			sortOrder: options.sortOrder ?? "desc",
			searchQuery: options.search?.trim() || undefined,
		};
	}

	protected decodeCursor(
		cursor?: string | null,
		sortBy?: ToolSortBy,
	): ToolCursor | null {
		return this.queryExecutor.decodeCursor(cursor, sortBy);
	}

	protected determineQueryStrategy(_options: ToolQueryOptions): QueryStrategy {
		return {
			needsJoin: false, // Tools don't need joins for search
		};
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
		const [
			categoryIds,
			tagIds,
			stackIds,
			alternativeIds,
			activeSponsorship,
			primaryAffiliateLink,
		] = await Promise.all([
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
			this.db
				.select({ affiliateUrl: toolAffiliateLinks.affiliateUrl })
				.from(toolAffiliateLinks)
				.where(
					and(
						eq(toolAffiliateLinks.toolId, tool.id),
						eq(toolAffiliateLinks.isPrimary, true),
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
			affiliateUrl:
				primaryAffiliateLink.length > 0
					? (primaryAffiliateLink[0]?.affiliateUrl ?? null)
					: null,
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
		// Use the standard getAll method
		const collection = await this.getAll(options);

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
				...(input.featured !== undefined && { featured: input.featured }),
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
