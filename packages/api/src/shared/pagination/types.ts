import type { SQL } from "@missingstack/db/drizzle-orm";

/**
 * Base cursor state with required ID and optional sort fields
 */
export type BaseCursorState = {
	id: string;
	createdAt?: Date;
};

/**
 * Encoded cursor payload with metadata
 */
export type EncodedCursor<T extends BaseCursorState = BaseCursorState> = {
	id: string;
	sortBy: string;
	timestamp: number; // For expiration
	signature?: string; // HMAC signature for integrity validation
	fields: Partial<Omit<T, "id">>;
};

/**
 * Sort configuration
 */
export type SortConfig<TSortBy extends string = string> = {
	sortBy: TSortBy;
	sortOrder: "asc" | "desc";
};

/**
 * Pagination options - base type that can be extended with additional properties
 */
export type PaginationOptions<TSortBy extends string = string> = Partial<
	SortConfig<TSortBy>
> & {
	limit?: number;
	cursor?: string | null;
	search?: string;
	[key: string]: unknown; // Allow additional properties from extended schemas
};

/**
 * Paginated collection result
 */
export type PaginatedCollection<T> = {
	items: T[];
	nextCursor: string | null;
	hasMore: boolean;
	metadata?: {
		count: number;
		estimatedTotal?: number;
	};
};

/**
 * Query strategy interface
 */
export interface QueryStrategy {
	needsJoin: boolean;
	joinConditions?: SQL<unknown>[];
}

/**
 * Sort field configuration
 */
export type SortFieldConfig<TTable> = {
	field: TTable[keyof TTable];
	cursorKey: string;
	defaultOrder?: "asc" | "desc";
};
