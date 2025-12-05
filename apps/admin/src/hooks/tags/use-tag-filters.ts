"use client";

import { useMemo, useState } from "react";
import type { TagSortColumn } from "~/lib/search-params";

export function useTagFilters() {
	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<TagSortColumn>("createdAt");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	const toggleSort = (column: TagSortColumn) => {
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
