import type { Database } from "@missingstack/db";
import {
	type SQL,
	and,
	asc,
	desc,
	eq,
	gt,
	ilike,
	lt,
	or,
	sql,
} from "@missingstack/db/drizzle-orm";
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
type CursorState = {
	id: string;
	createdAt?: Date;
	clickCount?: number;
	revenueTracked?: number;
	commissionRate?: string;
};

type EncodedCursor = {
	id: string;
	createdAt?: string;
	clickCount?: number;
	revenueTracked?: number;
	commissionRate?: string;
	sortBy?: string;
};

type SortContext = {
	sortBy: "createdAt" | "clickCount" | "revenueTracked" | "commissionRate";
	sortOrder: "asc" | "desc";
	searchQuery?: string;
};

// CURSOR UTILITIES
class CursorManager {
	static encode(state: CursorState, sortBy: SortContext["sortBy"]): string {
		const payload: EncodedCursor = {
			id: state.id,
			createdAt: state.createdAt?.toISOString(),
			clickCount: state.clickCount,
			revenueTracked: state.revenueTracked,
			commissionRate: state.commissionRate,
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

			if (typeof parsed.clickCount === "number") {
				state.clickCount = parsed.clickCount;
			}

			if (typeof parsed.revenueTracked === "number") {
				state.revenueTracked = parsed.revenueTracked;
			}

			if (typeof parsed.commissionRate === "string") {
				state.commissionRate = parsed.commissionRate;
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

		// Search in tool name via join
		return ilike(tools.name, pattern);
	}

	buildAllFilters(options: AffiliateLinkQueryOptions): SQL<unknown>[] {
		const conditions: SQL<unknown>[] = [];

		// Search filter (requires join with tools)
		const searchFilter = this.buildSearchFilter(options.search);
		if (searchFilter) {
			conditions.push(searchFilter);
		}

		// Tool ID filter
		if (options.toolId) {
			conditions.push(eq(toolAffiliateLinks.toolId, options.toolId));
		}

		// Primary filter
		if (options.isPrimary !== undefined) {
			conditions.push(eq(toolAffiliateLinks.isPrimary, options.isPrimary));
		}

		return conditions;
	}
}

// SORT BUILDERS
class SortBuilder {
	static buildOrderBy(context: SortContext): SQL<unknown>[] {
		const orderFn = context.sortOrder === "asc" ? asc : desc;

		switch (context.sortBy) {
			case "clickCount":
				return [
					orderFn(toolAffiliateLinks.clickCount),
					orderFn(toolAffiliateLinks.id),
				];

			case "revenueTracked":
				return [
					orderFn(toolAffiliateLinks.revenueTracked),
					orderFn(toolAffiliateLinks.id),
				];

			case "commissionRate":
				return [
					orderFn(toolAffiliateLinks.commissionRate),
					orderFn(toolAffiliateLinks.id),
				];
			default:
				return [
					orderFn(toolAffiliateLinks.createdAt),
					orderFn(toolAffiliateLinks.id),
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
			case "clickCount": {
				if (typeof cursorState.clickCount !== "number") {
					return compareFn(toolAffiliateLinks.id, cursorState.id);
				}
				return (
					or(
						compareFn(toolAffiliateLinks.clickCount, cursorState.clickCount),
						and(
							eq(toolAffiliateLinks.clickCount, cursorState.clickCount),
							compareFn(toolAffiliateLinks.id, cursorState.id),
						),
					) ?? null
				);
			}

			case "revenueTracked": {
				if (typeof cursorState.revenueTracked !== "number") {
					return compareFn(toolAffiliateLinks.id, cursorState.id);
				}
				return (
					or(
						compareFn(
							toolAffiliateLinks.revenueTracked,
							cursorState.revenueTracked,
						),
						and(
							eq(toolAffiliateLinks.revenueTracked, cursorState.revenueTracked),
							compareFn(toolAffiliateLinks.id, cursorState.id),
						),
					) ?? null
				);
			}

			case "commissionRate": {
				if (!cursorState.commissionRate) {
					return compareFn(toolAffiliateLinks.id, cursorState.id);
				}
				return (
					or(
						compareFn(
							toolAffiliateLinks.commissionRate,
							cursorState.commissionRate,
						),
						and(
							eq(toolAffiliateLinks.commissionRate, cursorState.commissionRate),
							compareFn(toolAffiliateLinks.id, cursorState.id),
						),
					) ?? null
				);
			}

			case "createdAt": {
				if (!cursorState.createdAt) {
					return compareFn(toolAffiliateLinks.id, cursorState.id);
				}
				return (
					or(
						compareFn(toolAffiliateLinks.createdAt, cursorState.createdAt),
						and(
							eq(toolAffiliateLinks.createdAt, cursorState.createdAt),
							compareFn(toolAffiliateLinks.id, cursorState.id),
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
		needsJoin: boolean,
	): Promise<AffiliateLinkCollection> {
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

		// If we need to join (for search), use inner join, otherwise just select from affiliate links
		if (needsJoin) {
			const rows = await this.db
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
				.where(whereClause)
				.orderBy(...orderByClause)
				.limit(limit + 1);
			const hasMore = rows.length > limit;
			const items: ToolAffiliateLink[] = (
				hasMore ? rows.slice(0, limit) : rows
			) as ToolAffiliateLink[];

			const lastItem =
				hasMore && items.length > 0 ? items[items.length - 1] : null;

			const nextCursor = lastItem
				? CursorManager.encode(
						{
							id: lastItem.id,
							createdAt: lastItem.createdAt,
							clickCount: lastItem.clickCount ?? undefined,
							revenueTracked: lastItem.revenueTracked ?? undefined,
							commissionRate: lastItem.commissionRate ?? undefined,
						},
						context.sortBy,
					)
				: null;

			return { items, nextCursor, hasMore };
		}

		const rows = await this.db
			.select()
			.from(toolAffiliateLinks)
			.where(whereClause)
			.orderBy(...orderByClause)
			.limit(limit + 1);

		const hasMore = rows.length > limit;
		const items: ToolAffiliateLink[] = (
			hasMore ? rows.slice(0, limit) : rows
		) as ToolAffiliateLink[];

		const lastItem =
			hasMore && items.length > 0 ? items[items.length - 1] : null;

		const nextCursor = lastItem
			? CursorManager.encode(
					{
						id: lastItem.id,
						createdAt: lastItem.createdAt,
						clickCount: lastItem.clickCount ?? undefined,
						revenueTracked: lastItem.revenueTracked ?? undefined,
						commissionRate: lastItem.commissionRate ?? undefined,
					},
					context.sortBy,
				)
			: null;

		return { items, nextCursor, hasMore };
	}
}

export class DrizzleAffiliateLinkRepository
	implements AffiliateLinkRepositoryInterface
{
	private readonly filterBuilder: FilterBuilder;
	private readonly queryExecutor: QueryExecutor;

	constructor(private readonly db: QueryableDb) {
		this.filterBuilder = new FilterBuilder();
		this.queryExecutor = new QueryExecutor(db);
	}

	async getAll(
		options: AffiliateLinkQueryOptions = {},
	): Promise<AffiliateLinkCollection> {
		const limit = options.limit ?? 20;
		const sortBy = options.sortBy ?? "createdAt";
		const sortOrder = options.sortOrder ?? "desc";

		const context: SortContext = {
			sortBy,
			sortOrder,
			searchQuery: options.search?.trim() || undefined,
		};

		const cursor = CursorManager.decode(options.cursor, sortBy);
		const filters = this.filterBuilder.buildAllFilters(options);
		const needsJoin = !!options.search; // Need join if searching by tool name

		return this.queryExecutor.execute(
			filters,
			context,
			cursor,
			limit,
			needsJoin,
		);
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
		const updateData: Partial<typeof toolAffiliateLinks.$inferInsert> = {
			...(input.toolId && { toolId: input.toolId }),
			...(input.affiliateUrl && { affiliateUrl: input.affiliateUrl }),
			...(input.commissionRate !== undefined && {
				commissionRate: input.commissionRate.toString(),
			}),
			...(input.trackingCode !== undefined && {
				trackingCode: input.trackingCode ?? null,
			}),
			...(input.isPrimary !== undefined && { isPrimary: input.isPrimary }),
		};

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
