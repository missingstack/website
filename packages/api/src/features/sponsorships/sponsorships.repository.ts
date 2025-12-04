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
	type ToolSponsorship,
	toolSponsorships,
} from "@missingstack/db/schema/tool-sponsorships";
import { tools } from "@missingstack/db/schema/tools";
import type {
	CreateSponsorshipInput,
	SponsorshipCollection,
	SponsorshipQueryOptions,
	UpdateSponsorshipInput,
} from "./sponsorships.schema";
import type { SponsorshipRepositoryInterface } from "./sponsorships.types";

type QueryableDb = Pick<
	Database,
	"select" | "transaction" | "insert" | "update" | "delete"
>;
type CursorState = {
	id: string;
	createdAt?: Date;
	startDate?: Date;
	endDate?: Date;
	priorityWeight?: number;
};

type EncodedCursor = {
	id: string;
	createdAt?: string;
	startDate?: string;
	endDate?: string;
	priorityWeight?: number;
	sortBy?: string;
};

type SortContext = {
	sortBy: "startDate" | "endDate" | "priorityWeight" | "createdAt";
	sortOrder: "asc" | "desc";
	searchQuery?: string;
};

// CURSOR UTILITIES
class CursorManager {
	static encode(state: CursorState, sortBy: SortContext["sortBy"]): string {
		const payload: EncodedCursor = {
			id: state.id,
			createdAt: state.createdAt?.toISOString(),
			startDate: state.startDate?.toISOString(),
			endDate: state.endDate?.toISOString(),
			priorityWeight: state.priorityWeight,
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

			if (parsed.startDate) {
				const startDate = new Date(parsed.startDate);
				if (!Number.isNaN(startDate.getTime())) {
					state.startDate = startDate;
				}
			}

			if (parsed.endDate) {
				const endDate = new Date(parsed.endDate);
				if (!Number.isNaN(endDate.getTime())) {
					state.endDate = endDate;
				}
			}

			if (typeof parsed.priorityWeight === "number") {
				state.priorityWeight = parsed.priorityWeight;
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

	buildAllFilters(options: SponsorshipQueryOptions): SQL<unknown>[] {
		const conditions: SQL<unknown>[] = [];

		// Search filter (requires join with tools)
		const searchFilter = this.buildSearchFilter(options.search);
		if (searchFilter) {
			conditions.push(searchFilter);
		}

		// Tool ID filter
		if (options.toolId) {
			conditions.push(eq(toolSponsorships.toolId, options.toolId));
		}

		// Tier filter
		if (options.tier) {
			conditions.push(eq(toolSponsorships.tier, options.tier));
		}

		// Payment status filter
		if (options.paymentStatus) {
			conditions.push(
				eq(toolSponsorships.paymentStatus, options.paymentStatus),
			);
		}

		// Active status filter
		if (options.isActive !== undefined) {
			conditions.push(eq(toolSponsorships.isActive, options.isActive));
		}

		return conditions;
	}
}

// SORT BUILDERS
class SortBuilder {
	static buildOrderBy(context: SortContext): SQL<unknown>[] {
		const orderFn = context.sortOrder === "asc" ? asc : desc;

		switch (context.sortBy) {
			case "startDate":
				return [
					orderFn(toolSponsorships.startDate),
					orderFn(toolSponsorships.id),
				];

			case "endDate":
				return [
					orderFn(toolSponsorships.endDate),
					orderFn(toolSponsorships.id),
				];

			case "priorityWeight":
				return [
					orderFn(toolSponsorships.priorityWeight),
					orderFn(toolSponsorships.id),
				];

			case "createdAt":
				return [
					orderFn(toolSponsorships.createdAt),
					orderFn(toolSponsorships.id),
				];

			default:
				return [desc(toolSponsorships.createdAt), desc(toolSponsorships.id)];
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
			case "startDate": {
				if (!cursorState.startDate) {
					return compareFn(toolSponsorships.id, cursorState.id);
				}
				return (
					or(
						compareFn(toolSponsorships.startDate, cursorState.startDate),
						and(
							eq(toolSponsorships.startDate, cursorState.startDate),
							compareFn(toolSponsorships.id, cursorState.id),
						),
					) ?? null
				);
			}

			case "endDate": {
				if (!cursorState.endDate) {
					return compareFn(toolSponsorships.id, cursorState.id);
				}
				return (
					or(
						compareFn(toolSponsorships.endDate, cursorState.endDate),
						and(
							eq(toolSponsorships.endDate, cursorState.endDate),
							compareFn(toolSponsorships.id, cursorState.id),
						),
					) ?? null
				);
			}

			case "priorityWeight": {
				if (typeof cursorState.priorityWeight !== "number") {
					return compareFn(toolSponsorships.id, cursorState.id);
				}
				return (
					or(
						compareFn(
							toolSponsorships.priorityWeight,
							cursorState.priorityWeight,
						),
						and(
							eq(toolSponsorships.priorityWeight, cursorState.priorityWeight),
							compareFn(toolSponsorships.id, cursorState.id),
						),
					) ?? null
				);
			}

			case "createdAt": {
				if (!cursorState.createdAt) {
					return compareFn(toolSponsorships.id, cursorState.id);
				}
				return (
					or(
						compareFn(toolSponsorships.createdAt, cursorState.createdAt),
						and(
							eq(toolSponsorships.createdAt, cursorState.createdAt),
							compareFn(toolSponsorships.id, cursorState.id),
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
	): Promise<SponsorshipCollection> {
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

		// If we need to join (for search), use inner join, otherwise just select from sponsorships
		if (needsJoin) {
			const rows = await this.db
				.select({
					id: toolSponsorships.id,
					toolId: toolSponsorships.toolId,
					tier: toolSponsorships.tier,
					startDate: toolSponsorships.startDate,
					endDate: toolSponsorships.endDate,
					isActive: toolSponsorships.isActive,
					priorityWeight: toolSponsorships.priorityWeight,
					paymentStatus: toolSponsorships.paymentStatus,
					createdAt: toolSponsorships.createdAt,
					updatedAt: toolSponsorships.updatedAt,
				})
				.from(toolSponsorships)
				.innerJoin(tools, eq(toolSponsorships.toolId, tools.id))
				.where(whereClause)
				.orderBy(...orderByClause)
				.limit(limit + 1);
			const hasMore = rows.length > limit;
			const items: ToolSponsorship[] = (
				hasMore ? rows.slice(0, limit) : rows
			) as ToolSponsorship[];

			const lastItem =
				hasMore && items.length > 0 ? items[items.length - 1] : null;

			const nextCursor = lastItem
				? CursorManager.encode(
						{
							id: lastItem.id,
							createdAt: lastItem.createdAt,
							startDate: lastItem.startDate,
							endDate: lastItem.endDate,
							priorityWeight: lastItem.priorityWeight ?? undefined,
						},
						context.sortBy,
					)
				: null;

			return { items, nextCursor, hasMore };
		}

		const rows = await this.db
			.select()
			.from(toolSponsorships)
			.where(whereClause)
			.orderBy(...orderByClause)
			.limit(limit + 1);

		const hasMore = rows.length > limit;
		const items: ToolSponsorship[] = (
			hasMore ? rows.slice(0, limit) : rows
		) as ToolSponsorship[];

		const lastItem =
			hasMore && items.length > 0 ? items[items.length - 1] : null;

		const nextCursor = lastItem
			? CursorManager.encode(
					{
						id: lastItem.id,
						createdAt: lastItem.createdAt,
						startDate: lastItem.startDate,
						endDate: lastItem.endDate,
						priorityWeight: lastItem.priorityWeight ?? undefined,
					},
					context.sortBy,
				)
			: null;

		return { items, nextCursor, hasMore };
	}
}

export class DrizzleSponsorshipRepository
	implements SponsorshipRepositoryInterface
{
	private readonly filterBuilder: FilterBuilder;
	private readonly queryExecutor: QueryExecutor;

	constructor(private readonly db: QueryableDb) {
		this.filterBuilder = new FilterBuilder();
		this.queryExecutor = new QueryExecutor(db);
	}

	async getAll(
		options: SponsorshipQueryOptions = {},
	): Promise<SponsorshipCollection> {
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

	async getById(id: string): Promise<ToolSponsorship | null> {
		const [row] = await this.db
			.select()
			.from(toolSponsorships)
			.where(eq(toolSponsorships.id, id))
			.limit(1);

		return row ?? null;
	}

	async create(input: CreateSponsorshipInput): Promise<ToolSponsorship> {
		const [sponsorship] = await this.db
			.insert(toolSponsorships)
			.values({
				toolId: input.toolId,
				tier: input.tier,
				startDate: new Date(input.startDate),
				endDate: new Date(input.endDate),
				isActive: input.isActive ?? true,
				priorityWeight: input.priorityWeight ?? 0,
				paymentStatus: input.paymentStatus ?? "pending",
			})
			.returning();

		if (!sponsorship) {
			throw new Error("Failed to create sponsorship");
		}

		return sponsorship;
	}

	async update(
		id: string,
		input: UpdateSponsorshipInput,
	): Promise<ToolSponsorship> {
		const updateData: Partial<typeof toolSponsorships.$inferInsert> = {
			...(input.toolId && { toolId: input.toolId }),
			...(input.tier && { tier: input.tier }),
			...(input.startDate && { startDate: new Date(input.startDate) }),
			...(input.endDate && { endDate: new Date(input.endDate) }),
			...(input.isActive !== undefined && { isActive: input.isActive }),
			...(input.priorityWeight !== undefined && {
				priorityWeight: input.priorityWeight,
			}),
			...(input.paymentStatus && { paymentStatus: input.paymentStatus }),
		};

		const [sponsorship] = await this.db
			.update(toolSponsorships)
			.set(updateData)
			.where(eq(toolSponsorships.id, id))
			.returning();

		if (!sponsorship) {
			throw new Error("Failed to update sponsorship");
		}

		return sponsorship;
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(toolSponsorships).where(eq(toolSponsorships.id, id));
	}
}
