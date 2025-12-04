import type { Database } from "@missingstack/db";
import type { SQL } from "@missingstack/db/drizzle-orm";
import { and, sql } from "@missingstack/db/drizzle-orm";
import { CursorManager } from "./cursor-manager";
import type {
	BaseCursorState,
	PaginatedCollection,
	QueryStrategy,
	SortConfig,
} from "./types";

const PAGINATION_LOOKAHEAD = 1; // Fetch one extra to detect hasMore

type QueryableDb = Pick<
	Database,
	"select" | "transaction" | "insert" | "update" | "delete"
>;

/**
 * Abstract query executor for generic query execution.
 * Extend this class to implement entity-specific query logic.
 */
export abstract class QueryExecutor<
	TEntity,
	TTable,
	TCursor extends BaseCursorState,
	TSortBy extends string,
> {
	protected readonly cursorManager: CursorManager<TCursor>;

	constructor(
		protected readonly db: QueryableDb,
		protected readonly table: TTable,
		cursorManager?: CursorManager<TCursor>,
	) {
		this.cursorManager =
			cursorManager ??
			new CursorManager<TCursor>({
				secretKey: process.env.CURSOR_SIGNING_SECRET,
			});
	}

	/**
	 * Execute paginated query
	 */
	async execute(
		filters: SQL<unknown>[],
		sortConfig: SortConfig<TSortBy>,
		cursor: TCursor | null,
		limit: number,
		strategy: QueryStrategy,
	): Promise<PaginatedCollection<TEntity>> {
		const conditions = this.buildWhereConditions(filters, cursor, sortConfig);
		const orderBy = this.buildOrderBy(sortConfig);

		const rows = await this.executeQuery(
			conditions,
			orderBy,
			limit + PAGINATION_LOOKAHEAD,
			strategy,
		);

		return this.formatResponse(rows, limit, sortConfig.sortBy);
	}

	/**
	 * Decode cursor - exposed for repository use
	 */
	decodeCursor(cursor?: string | null, sortBy?: TSortBy): TCursor | null {
		return this.cursorManager.decode(cursor, sortBy);
	}

	/**
	 * Build complete WHERE clause
	 */
	private buildWhereConditions(
		filters: SQL<unknown>[],
		cursor: TCursor | null,
		sortConfig: SortConfig<TSortBy>,
	): SQL<unknown> {
		const conditions = [...filters];

		if (cursor) {
			const cursorCondition = this.buildCursorCondition(cursor, sortConfig);
			if (cursorCondition) {
				conditions.push(cursorCondition);
			}
		}

		return conditions.length > 0
			? (and(...conditions) ?? sql`true`)
			: sql`true`;
	}

	/**
	 * Format query results into paginated response
	 */
	private formatResponse(
		rows: TEntity[],
		limit: number,
		sortBy: string,
	): PaginatedCollection<TEntity> {
		const hasMore = rows.length > limit;
		const items = hasMore ? rows.slice(0, limit) : rows;

		const lastItem = items.length > 0 ? items[items.length - 1] : null;
		const nextCursor = lastItem ? this.createCursor(lastItem, sortBy) : null;

		return {
			items,
			nextCursor,
			hasMore,
			metadata: { count: items.length },
		};
	}

	/**
	 * Override to implement query execution strategy
	 */
	protected abstract executeQuery(
		where: SQL<unknown>,
		orderBy: SQL<unknown>[],
		limit: number,
		strategy: QueryStrategy,
	): Promise<TEntity[]>;

	/**
	 * Override to implement cursor condition building
	 */
	protected abstract buildCursorCondition(
		cursor: TCursor,
		sortConfig: SortConfig<TSortBy>,
	): SQL<unknown> | null;

	/**
	 * Override to implement order by building
	 */
	protected abstract buildOrderBy(
		sortConfig: SortConfig<TSortBy>,
	): SQL<unknown>[];

	/**
	 * Override to implement cursor creation from entity
	 */
	protected abstract createCursor(entity: TEntity, sortBy: string): string;
}
