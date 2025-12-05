"use client";

import { useQueryState, useQueryStates } from "nuqs";
import type { CategorySortColumn } from "~/lib/search-params";
import { adminSearchParamsParsersClient } from "~/lib/search-params";

export function useCategoryFilters() {
	const [search, setSearch] = useQueryState("search", {
		...adminSearchParamsParsersClient.search,
		shallow: false,
		throttleMs: 300,
	});

	const [filters, setFilters] = useQueryStates(
		{
			sortBy: adminSearchParamsParsersClient.sortBy,
			sortOrder: adminSearchParamsParsersClient.sortOrder,
		},
		{ shallow: false },
	);

	const toggleSort = (column: CategorySortColumn) => {
		if (filters.sortBy === column) {
			setFilters({
				sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
			});
		} else {
			setFilters({
				sortBy: column,
				sortOrder: "asc",
			});
		}
	};

	return {
		search,
		setSearch,
		filters,
		setFilters,
		toggleSort,
	};
}
