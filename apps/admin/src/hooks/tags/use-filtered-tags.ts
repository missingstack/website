"use client";

import type { Tag } from "@missingstack/api/types";
import { useMemo } from "react";
import type { TagSortColumn } from "~/lib/search-params";

export function useFilteredTags(
	tags: Tag[] | undefined,
	search: string,
	sortBy: TagSortColumn,
	sortOrder: "asc" | "desc",
) {
	return useMemo(() => {
		if (!tags) return [];

		let filtered = [...tags];

		// Apply search filter
		if (search) {
			const searchLower = search.toLowerCase();
			filtered = filtered.filter(
				(tag) =>
					tag.name.toLowerCase().includes(searchLower) ||
					tag.slug.toLowerCase().includes(searchLower),
			);
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case "name":
					comparison = a.name.localeCompare(b.name);
					break;
				case "slug":
					comparison = a.slug.localeCompare(b.slug);
					break;
				case "createdAt":
					comparison =
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
					break;
			}
			return sortOrder === "asc" ? comparison : -comparison;
		});

		return filtered;
	}, [tags, search, sortBy, sortOrder]);
}
