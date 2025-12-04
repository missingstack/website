import type { SQL } from "@missingstack/db/drizzle-orm";
import { and, asc, desc, eq, gt, lt, or } from "@missingstack/db/drizzle-orm";
import type { BaseCursorState, SortConfig, SortFieldConfig } from "./types";

/**
 * Abstract sort builder for type-safe sorting with cursor conditions.
 * Extend this class to implement entity-specific sorting logic.
 */
export abstract class SortBuilder<
	TTable,
	TCursor extends BaseCursorState,
	TSortBy extends string,
> {
	protected abstract readonly sortFields: Record<
		TSortBy,
		SortFieldConfig<TTable>
	>;
	protected abstract readonly idField: TTable[keyof TTable];

	/**
	 * Build ORDER BY clause
	 */
	buildOrderBy(config: SortConfig<TSortBy>): SQL<unknown>[] {
		const sortConfig = this.sortFields[config.sortBy];
		if (!sortConfig) {
			return this.buildDefaultOrderBy();
		}

		const orderFn = config.sortOrder === "asc" ? asc : desc;
		return [orderFn(sortConfig.field as never), orderFn(this.idField as never)];
	}

	/**
	 * Build cursor-based WHERE condition for pagination
	 */
	buildCursorCondition(
		cursor: TCursor,
		config: SortConfig<TSortBy>,
	): SQL<unknown> | null {
		if (!cursor.id) return null;

		const sortConfig = this.sortFields[config.sortBy];
		if (!sortConfig) return null;

		const cursorValue = (cursor as Record<string, unknown>)[
			sortConfig.cursorKey
		];

		// If cursor doesn't have the sort field value, fall back to ID comparison
		if (cursorValue === undefined || cursorValue === null) {
			return this.buildIdOnlyCondition(cursor.id, config.sortOrder);
		}

		return this.buildCompositeCondition(
			sortConfig.field,
			cursorValue,
			cursor.id,
			config.sortOrder,
		);
	}

	/**
	 * Build composite condition (sortField, id) for stable pagination
	 */
	private buildCompositeCondition(
		field: TTable[keyof TTable],
		fieldValue: unknown,
		cursorId: string,
		order: "asc" | "desc",
	): SQL<unknown> | null {
		const compareFn = order === "asc" ? gt : lt;

		return (
			or(
				compareFn(field as never, fieldValue as never),
				and(
					eq(field as never, fieldValue as never),
					compareFn(this.idField as never, cursorId),
				),
			) ?? null
		);
	}

	/**
	 * Build ID-only condition as fallback
	 */
	private buildIdOnlyCondition(
		cursorId: string,
		order: "asc" | "desc",
	): SQL<unknown> {
		const compareFn = order === "asc" ? gt : lt;
		return compareFn(this.idField as never, cursorId);
	}

	/**
	 * Default ordering (typically by createdAt DESC)
	 */
	protected abstract buildDefaultOrderBy(): SQL<unknown>[];
}
