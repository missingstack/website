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

type SponsorshipCursor = BaseCursorState & {
	startDate?: Date;
	endDate?: Date;
	priorityWeight?: number;
};

type SponsorshipSortBy =
	| "startDate"
	| "endDate"
	| "priorityWeight"
	| "createdAt";

class SponsorshipFilterBuilder extends FilterBuilder<SponsorshipQueryOptions> {
	protected buildSearchFilter(
		options: SponsorshipQueryOptions,
	): SQL<unknown> | null {
		const pattern = this.buildILikePattern(options.search);
		return pattern ? ilike(tools.name, pattern) : null;
	}

	protected buildEntityFilters(
		options: SponsorshipQueryOptions,
	): SQL<unknown>[] {
		const filters: SQL<unknown>[] = [];

		if (options.toolId) {
			filters.push(eq(toolSponsorships.toolId, options.toolId));
		}

		if (options.tier) {
			filters.push(eq(toolSponsorships.tier, options.tier));
		}

		if (options.paymentStatus) {
			filters.push(eq(toolSponsorships.paymentStatus, options.paymentStatus));
		}

		// Use isDefined helper to handle false values correctly
		if (this.isDefined(options.isActive)) {
			filters.push(eq(toolSponsorships.isActive, options.isActive));
		}

		return filters;
	}
}

class SponsorshipSortBuilder extends SortBuilder<
	typeof toolSponsorships,
	SponsorshipCursor,
	SponsorshipSortBy
> {
	protected readonly sortFields: Record<
		SponsorshipSortBy,
		SortFieldConfig<typeof toolSponsorships>
	> = {
		startDate: {
			field: toolSponsorships.startDate,
			cursorKey: "startDate",
		},
		endDate: {
			field: toolSponsorships.endDate,
			cursorKey: "endDate",
		},
		priorityWeight: {
			field: toolSponsorships.priorityWeight,
			cursorKey: "priorityWeight",
		},
		createdAt: {
			field: toolSponsorships.createdAt,
			cursorKey: "createdAt",
		},
	} as const;

	protected readonly idField = toolSponsorships.id;
	protected buildDefaultOrderBy(): SQL<unknown>[] {
		return [desc(toolSponsorships.createdAt), desc(toolSponsorships.id)];
	}
}

class SponsorshipQueryExecutor extends QueryExecutor<
	ToolSponsorship,
	typeof toolSponsorships,
	SponsorshipCursor,
	SponsorshipSortBy
> {
	constructor(
		db: QueryableDb,
		private readonly sortBuilder: SponsorshipSortBuilder,
	) {
		super(
			db,
			toolSponsorships,
			new CursorManager<SponsorshipCursor>({
				secretKey: process.env.CURSOR_SIGNING_SECRET,
			}),
		);
	}

	protected async executeQuery(
		where: SQL<unknown>,
		orderBy: SQL<unknown>[],
		limit: number,
		strategy: QueryStrategy,
	): Promise<ToolSponsorship[]> {
		if (strategy.needsJoin) {
			return this.db
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
				.where(where)
				.orderBy(...orderBy)
				.limit(limit);
		}

		return this.db
			.select()
			.from(toolSponsorships)
			.where(where)
			.orderBy(...orderBy)
			.limit(limit);
	}

	protected buildCursorCondition(
		cursor: SponsorshipCursor,
		sortConfig: SortConfig<SponsorshipSortBy>,
	): SQL<unknown> | null {
		return this.sortBuilder.buildCursorCondition(cursor, sortConfig);
	}

	protected buildOrderBy(
		sortConfig: SortConfig<SponsorshipSortBy>,
	): SQL<unknown>[] {
		return this.sortBuilder.buildOrderBy(sortConfig);
	}

	protected createCursor(entity: ToolSponsorship, sortBy: string): string {
		return this.cursorManager.encode(
			{
				id: entity.id,
				createdAt: entity.createdAt,
				startDate: entity.startDate,
				endDate: entity.endDate,
				priorityWeight: entity.priorityWeight ?? undefined,
			},
			sortBy,
		);
	}
}

/**
 * Drizzle-based sponsorship repository with improved cursor pagination.
 * Uses shared pagination library for consistency and maintainability.
 */
export class DrizzleSponsorshipRepository
	extends BasePaginatedRepository<
		ToolSponsorship,
		typeof toolSponsorships,
		SponsorshipCursor,
		SponsorshipQueryOptions,
		SponsorshipSortBy
	>
	implements SponsorshipRepositoryInterface
{
	protected readonly filterBuilder: SponsorshipFilterBuilder;
	protected readonly queryExecutor: SponsorshipQueryExecutor;
	private readonly sortBuilder: SponsorshipSortBuilder;

	constructor(private readonly db: QueryableDb) {
		super();
		this.filterBuilder = new SponsorshipFilterBuilder();
		this.sortBuilder = new SponsorshipSortBuilder();
		this.queryExecutor = new SponsorshipQueryExecutor(db, this.sortBuilder);
	}

	async getAll(
		options: SponsorshipQueryOptions = {},
	): Promise<SponsorshipCollection> {
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
		options: SponsorshipQueryOptions,
	): SortConfig<SponsorshipSortBy> {
		return {
			sortBy: options.sortBy ?? "createdAt",
			sortOrder: options.sortOrder ?? "desc",
		};
	}

	protected decodeCursor(
		cursor?: string | null,
		sortBy?: SponsorshipSortBy,
	): SponsorshipCursor | null {
		return this.queryExecutor.decodeCursor(cursor, sortBy);
	}

	protected determineQueryStrategy(
		options: SponsorshipQueryOptions,
	): QueryStrategy {
		return {
			needsJoin: !!options.search?.trim(),
		};
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
		const updateData: Partial<typeof toolSponsorships.$inferInsert> = {};

		if (input.toolId) updateData.toolId = input.toolId;
		if (input.tier) updateData.tier = input.tier;
		if (input.startDate) updateData.startDate = new Date(input.startDate);
		if (input.endDate) updateData.endDate = new Date(input.endDate);
		if (input.isActive) updateData.isActive = input.isActive;
		if (input.priorityWeight) updateData.priorityWeight = input.priorityWeight;
		if (input.paymentStatus) updateData.paymentStatus = input.paymentStatus;

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
