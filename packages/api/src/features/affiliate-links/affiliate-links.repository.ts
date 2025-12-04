import {
	type BaseCursorState,
	BasePaginatedRepository,
	CursorManager,
	FilterBuilder,
	QueryExecutor,
	type QueryStrategy,
	SortBuilder,
	type SortConfig,
	type SortFieldConfig,
} from "@missingstack/api/shared/pagination";
import type { Database } from "@missingstack/db";
import type { SQL } from "@missingstack/db/drizzle-orm";
import { desc, eq, ilike } from "@missingstack/db/drizzle-orm";
import {
	type ToolAffiliateLink,
	toolAffiliateLinks,
} from "@missingstack/db/schema/tool-affiliate-links";
import { tools } from "@missingstack/db/schema/tools";
import type {
	AffiliateLinkCollection,
	AffiliateLinkQueryOptions,
	CreateAffiliateLinkInput,
	UpdateAffiliateLinkInput,
} from "./affiliate-links.schema";
import type { AffiliateLinkRepositoryInterface } from "./affiliate-links.types";

type QueryableDb = Pick<
	Database,
	"select" | "transaction" | "insert" | "update" | "delete"
>;

type AffiliateLinkCursor = BaseCursorState & {
	clickCount?: number;
	revenueTracked?: number;
	commissionRate?: string;
};

type AffiliateLinkSortBy =
	| "createdAt"
	| "clickCount"
	| "revenueTracked"
	| "commissionRate";

class AffiliateLinkFilterBuilder extends FilterBuilder<AffiliateLinkQueryOptions> {
	protected buildSearchFilter(
		options: AffiliateLinkQueryOptions,
	): SQL<unknown> | null {
		const pattern = this.buildILikePattern(options.search);
		return pattern ? ilike(tools.name, pattern) : null;
	}

	protected buildEntityFilters(
		options: AffiliateLinkQueryOptions,
	): SQL<unknown>[] {
		const filters: SQL<unknown>[] = [];

		if (options.toolId) {
			filters.push(eq(toolAffiliateLinks.toolId, options.toolId));
		}

		if (this.isDefined(options.isPrimary)) {
			filters.push(eq(toolAffiliateLinks.isPrimary, options.isPrimary));
		}

		return filters;
	}
}

class AffiliateLinkSortBuilder extends SortBuilder<
	typeof toolAffiliateLinks,
	AffiliateLinkCursor,
	AffiliateLinkSortBy
> {
	protected readonly sortFields: Record<
		AffiliateLinkSortBy,
		SortFieldConfig<typeof toolAffiliateLinks>
	> = {
		clickCount: {
			field: toolAffiliateLinks.clickCount,
			cursorKey: "clickCount",
		},
		revenueTracked: {
			field: toolAffiliateLinks.revenueTracked,
			cursorKey: "revenueTracked",
		},
		commissionRate: {
			field: toolAffiliateLinks.commissionRate,
			cursorKey: "commissionRate",
		},
		createdAt: {
			field: toolAffiliateLinks.createdAt,
			cursorKey: "createdAt",
		},
	} as const;

	protected readonly idField = toolAffiliateLinks.id;

	protected buildDefaultOrderBy(): SQL<unknown>[] {
		return [desc(toolAffiliateLinks.createdAt), desc(toolAffiliateLinks.id)];
	}
}

class AffiliateLinkQueryExecutor extends QueryExecutor<
	ToolAffiliateLink,
	typeof toolAffiliateLinks,
	AffiliateLinkCursor,
	AffiliateLinkSortBy
> {
	constructor(
		db: QueryableDb,
		private readonly sortBuilder: AffiliateLinkSortBuilder,
	) {
		super(
			db,
			toolAffiliateLinks,
			new CursorManager<AffiliateLinkCursor>({
				secretKey: process.env.CURSOR_SIGNING_SECRET,
			}),
		);
	}

	protected async executeQuery(
		where: SQL<unknown>,
		orderBy: SQL<unknown>[],
		limit: number,
		strategy: QueryStrategy,
	): Promise<ToolAffiliateLink[]> {
		if (strategy.needsJoin) {
			return this.db
				.select({
					id: toolAffiliateLinks.id,
					toolId: toolAffiliateLinks.toolId,
					affiliateUrl: toolAffiliateLinks.affiliateUrl,
					commissionRate: toolAffiliateLinks.commissionRate,
					trackingCode: toolAffiliateLinks.trackingCode,
					isPrimary: toolAffiliateLinks.isPrimary,
					clickCount: toolAffiliateLinks.clickCount,
					revenueTracked: toolAffiliateLinks.revenueTracked,
					createdAt: toolAffiliateLinks.createdAt,
					updatedAt: toolAffiliateLinks.updatedAt,
				})
				.from(toolAffiliateLinks)
				.innerJoin(tools, eq(toolAffiliateLinks.toolId, tools.id))
				.where(where)
				.orderBy(...orderBy)
				.limit(limit);
		}

		return this.db
			.select()
			.from(toolAffiliateLinks)
			.where(where)
			.orderBy(...orderBy)
			.limit(limit);
	}

	protected buildCursorCondition(
		cursor: AffiliateLinkCursor,
		sortConfig: SortConfig<AffiliateLinkSortBy>,
	): SQL<unknown> | null {
		return this.sortBuilder.buildCursorCondition(cursor, sortConfig);
	}

	protected buildOrderBy(
		sortConfig: SortConfig<AffiliateLinkSortBy>,
	): SQL<unknown>[] {
		return this.sortBuilder.buildOrderBy(sortConfig);
	}

	protected createCursor(entity: ToolAffiliateLink, sortBy: string): string {
		return this.cursorManager.encode(
			{
				id: entity.id,
				createdAt: entity.createdAt,
				clickCount: entity.clickCount ?? undefined,
				revenueTracked: entity.revenueTracked ?? undefined,
				commissionRate: entity.commissionRate ?? undefined,
			},
			sortBy,
		);
	}
}

export class DrizzleAffiliateLinkRepository
	extends BasePaginatedRepository<
		ToolAffiliateLink,
		typeof toolAffiliateLinks,
		AffiliateLinkCursor,
		AffiliateLinkQueryOptions,
		AffiliateLinkSortBy
	>
	implements AffiliateLinkRepositoryInterface
{
	protected readonly filterBuilder: AffiliateLinkFilterBuilder;
	protected readonly queryExecutor: AffiliateLinkQueryExecutor;
	private readonly sortBuilder: AffiliateLinkSortBuilder;

	constructor(private readonly db: QueryableDb) {
		super();
		this.filterBuilder = new AffiliateLinkFilterBuilder();
		this.sortBuilder = new AffiliateLinkSortBuilder();
		this.queryExecutor = new AffiliateLinkQueryExecutor(db, this.sortBuilder);
	}

	async getAll(
		options: AffiliateLinkQueryOptions = {},
	): Promise<AffiliateLinkCollection> {
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
		options: AffiliateLinkQueryOptions,
	): SortConfig<AffiliateLinkSortBy> {
		return {
			sortBy: options.sortBy ?? "createdAt",
			sortOrder: options.sortOrder ?? "desc",
		};
	}

	protected decodeCursor(
		cursor?: string | null,
		sortBy?: AffiliateLinkSortBy,
	): AffiliateLinkCursor | null {
		return this.queryExecutor.decodeCursor(cursor, sortBy);
	}

	protected determineQueryStrategy(
		options: AffiliateLinkQueryOptions,
	): QueryStrategy {
		return {
			needsJoin: !!options.search?.trim(),
		};
	}

	async getById(id: string): Promise<ToolAffiliateLink | null> {
		const [row] = await this.db
			.select()
			.from(toolAffiliateLinks)
			.where(eq(toolAffiliateLinks.id, id))
			.limit(1);

		return row ?? null;
	}

	async create(input: CreateAffiliateLinkInput): Promise<ToolAffiliateLink> {
		const [affiliateLink] = await this.db
			.insert(toolAffiliateLinks)
			.values({
				toolId: input.toolId,
				affiliateUrl: input.affiliateUrl,
				commissionRate: input.commissionRate?.toString() ?? "0",
				trackingCode: input.trackingCode ?? null,
				isPrimary: input.isPrimary ?? false,
			})
			.returning();

		if (!affiliateLink) {
			throw new Error("Failed to create affiliate link");
		}

		return affiliateLink;
	}

	async update(
		id: string,
		input: UpdateAffiliateLinkInput,
	): Promise<ToolAffiliateLink> {
		const updateData: Partial<typeof toolAffiliateLinks.$inferInsert> = {};

		if (input.toolId) updateData.toolId = input.toolId;
		if (input.affiliateUrl) updateData.affiliateUrl = input.affiliateUrl;
		if (input.commissionRate !== undefined) {
			updateData.commissionRate = input.commissionRate.toString();
		}
		if (input.trackingCode !== undefined) {
			updateData.trackingCode = input.trackingCode ?? null;
		}
		if (input.isPrimary !== undefined) updateData.isPrimary = input.isPrimary;

		const [affiliateLink] = await this.db
			.update(toolAffiliateLinks)
			.set(updateData)
			.where(eq(toolAffiliateLinks.id, id))
			.returning();

		if (!affiliateLink) {
			throw new Error("Failed to update affiliate link");
		}

		return affiliateLink;
	}

	async delete(id: string): Promise<void> {
		await this.db
			.delete(toolAffiliateLinks)
			.where(eq(toolAffiliateLinks.id, id));
	}
}
