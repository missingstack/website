import type { SQL } from "@missingstack/db/drizzle-orm";

/**
 * Abstract filter builder for composable filter construction.
 * Extend this class to implement entity-specific filtering logic.
 */
export abstract class FilterBuilder<TOptions extends Record<string, unknown>> {
	/**
	 * Build all filters based on options
	 */
	buildFilters(options: TOptions): SQL<unknown>[] {
		const filters: SQL<unknown>[] = [];

		// Add search filter if applicable
		const searchFilter = this.buildSearchFilter(options);
		if (searchFilter) {
			filters.push(searchFilter);
		}

		// Add entity-specific filters
		filters.push(...this.buildEntityFilters(options));

		return filters;
	}

	/**
	 * Override to implement search logic
	 */
	protected abstract buildSearchFilter(options: TOptions): SQL<unknown> | null;

	/**
	 * Override to implement entity-specific filters
	 */
	protected abstract buildEntityFilters(options: TOptions): SQL<unknown>[];

	/**
	 * Helper to build search pattern for ILIKE queries
	 */
	protected buildILikePattern(search?: string): string | null {
		if (!search) return null;
		const trimmed = search.trim();
		return trimmed ? `%${trimmed}%` : null;
	}

	/**
	 * Helper to safely check if a boolean option is defined
	 * Use this instead of truthy checks to handle false values correctly
	 */
	protected isDefined<T>(value: T | undefined): value is T {
		return value !== undefined;
	}
}
