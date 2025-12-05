"use client";

import { useQueryState, useQueryStates } from "nuqs";
import type { ToolSortColumn } from "~/lib/search-params";
import { adminToolsSearchParamsParsersClient } from "~/lib/search-params";

export function useToolFilters() {
	const [search, setSearch] = useQueryState("search", {
		...adminToolsSearchParamsParsersClient.search,
		shallow: false,
		throttleMs: 300,
	});

	const [filters, setFilters] = useQueryStates({
		search: adminToolsSearchParamsParsersClient.search,
		sortBy: adminToolsSearchParamsParsersClient.sortBy,
		sortOrder: adminToolsSearchParamsParsersClient.sortOrder,
	});

	const toggleSort = (column: ToolSortColumn) => {
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
