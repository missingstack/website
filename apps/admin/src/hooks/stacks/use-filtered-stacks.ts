"use client";

import type { Stack } from "@missingstack/api/types";
import { useMemo } from "react";
import type { StackSortColumn } from "~/lib/search-params";

export function useFilteredStacks(
	stacks: Stack[] | undefined,
	search: string,
	sortBy: StackSortColumn,
	sortOrder: "asc" | "desc",
) {
	return useMemo(() => {
		if (!stacks) return [];

		let filtered = [...stacks];

		// Apply search filter
		if (search) {
			const searchLower = search.toLowerCase();
			filtered = filtered.filter(
				(stack) =>
					stack.name.toLowerCase().includes(searchLower) ||
					stack.slug.toLowerCase().includes(searchLower) ||
					stack.description?.toLowerCase().includes(searchLower),
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
				case "weight":
					comparison = (a.weight ?? 0) - (b.weight ?? 0);
					break;
				case "createdAt":
					comparison =
						new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
					break;
			}
			return sortOrder === "asc" ? comparison : -comparison;
		});

		return filtered;
	}, [stacks, search, sortBy, sortOrder]);
}
