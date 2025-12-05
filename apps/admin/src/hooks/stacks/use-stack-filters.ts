"use client";

import { useMemo, useState } from "react";
import type { StackSortColumn } from "~/lib/search-params";

export function useStackFilters() {
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<StackSortColumn>("createdAt");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	const toggleSort = (column: StackSortColumn) => {
		if (sortBy === column) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(column);
			setSortOrder("asc");
		}
	};

	const filters = useMemo(
		() => ({
			sortBy,
			sortOrder,
		}),
		[sortBy, sortOrder],
	);

	return {
		search,
		setSearch,
		filters,
		toggleSort,
	};
}
