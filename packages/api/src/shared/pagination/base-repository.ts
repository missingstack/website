import type { FilterBuilder } from "./filter-builder";
import type { QueryExecutor } from "./query-executor";
import type {
	BaseCursorState,
	PaginatedCollection,
	PaginationOptions,
	QueryStrategy,
	SortConfig,
} from "./types";

/**
 * Abstract base repository for all paginated repositories.
 * Provides common pagination logic while allowing entity-specific customization.
 */
export abstract class BasePaginatedRepository<
	TEntity,
	TTable,
	TCursor extends BaseCursorState,
	TOptions extends PaginationOptions<TSortBy>,
	TSortBy extends string,
> {
	protected abstract readonly filterBuilder: FilterBuilder<TOptions>;
	protected abstract readonly queryExecutor: QueryExecutor<
		TEntity,
		TTable,
		TCursor,
		TSortBy
	>;

	/**
	 * Get paginated results
	 */
	async getAll(
		options: TOptions = {} as TOptions,
	): Promise<PaginatedCollection<TEntity>> {
		const limit = this.validateLimit(options.limit);
		const sortConfig = this.buildSortConfig(options);
		const cursor = this.decodeCursor(options.cursor, sortConfig.sortBy);
		const filters = this.filterBuilder.buildFilters(options);
		const strategy = this.determineQueryStrategy(options);

		return this.queryExecutor.execute(
			filters,
			sortConfig,
			cursor,
			limit,
			strategy,
		);
	}

	/**
	 * Validate and normalize limit
	 */
	private validateLimit(limit?: number): number {
		const DEFAULT_LIMIT = 20;
		const MAX_LIMIT = 100;

		if (!limit) return DEFAULT_LIMIT;
		if (limit < 1) return DEFAULT_LIMIT;
		if (limit > MAX_LIMIT) return MAX_LIMIT;

		return Math.floor(limit);
	}

	/**
	 * Build sort configuration with defaults
	 */
	protected abstract buildSortConfig(options: TOptions): SortConfig<TSortBy>;

	/**
	 * Decode cursor with fallback
	 */
	protected abstract decodeCursor(
		cursor?: string | null,
		sortBy?: TSortBy,
	): TCursor | null;

	/**
	 * Determine query strategy (join requirements, etc.)
	 */
	protected abstract determineQueryStrategy(options: TOptions): QueryStrategy;
}
