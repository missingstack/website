"use client";

import { useQueryState, useQueryStates } from "nuqs";
import type { AffiliateLinkSortColumn } from "~/lib/search-params";
import { adminAffiliateLinksSearchParamsParsersClient } from "~/lib/search-params";

export function useAffiliateLinkFilters() {
	const [search, setSearch] = useQueryState("search", {
		...adminAffiliateLinksSearchParamsParsersClient.search,
		shallow: false,
		throttleMs: 300,
	});

	const [filters, setFilters] = useQueryStates(
		{
			sortBy: adminAffiliateLinksSearchParamsParsersClient.sortBy,
			sortOrder: adminAffiliateLinksSearchParamsParsersClient.sortOrder,
		},
		{ shallow: false },
	);

	const toggleSort = (column: AffiliateLinkSortColumn) => {
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
