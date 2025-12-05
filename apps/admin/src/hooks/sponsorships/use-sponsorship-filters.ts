"use client";

import { useQueryState, useQueryStates } from "nuqs";
import type { SponsorshipSortColumn } from "~/lib/search-params";
import { adminSponsorshipsSearchParamsParsersClient } from "~/lib/search-params";

export function useSponsorshipFilters() {
	const [search, setSearch] = useQueryState("search", {
		...adminSponsorshipsSearchParamsParsersClient.search,
		shallow: false,
		throttleMs: 300,
	});

	const [filters, setFilters] = useQueryStates(
		{
			sortBy: adminSponsorshipsSearchParamsParsersClient.sortBy,
			sortOrder: adminSponsorshipsSearchParamsParsersClient.sortOrder,
		},
		{ shallow: false },
	);

	const toggleSort = (column: SponsorshipSortColumn) => {
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
