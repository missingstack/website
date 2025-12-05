"use client";

import type { ToolCollection, ToolQueryOptions } from "@missingstack/api/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";
import type { ToolSortColumn } from "~/lib/search-params";

interface UseToolsFilters {
	search?: string | null;
	sortBy?: ToolSortColumn;
	sortOrder?: "asc" | "desc";
}

export function useTools(filters: UseToolsFilters) {
	return useInfiniteQuery({
		queryKey: ["adminTools", filters],
		queryFn: async ({ pageParam }: { pageParam?: string }) => {
			const query: Partial<ToolQueryOptions> = {};

			if (filters.search) query.search = filters.search;
			if (filters.sortBy) query.sortBy = filters.sortBy;
			if (filters.sortOrder) query.sortOrder = filters.sortOrder;
			if (pageParam) query.cursor = pageParam;

			const { data, error } = await api.v1.tools.get({
				query: query as ToolQueryOptions,
			});

			if (error)
				throw new Error(error.value.message ?? "Failed to fetch tools");
			if (!data) throw new Error("No data returned from API");

			return {
				items: data.items,
				nextCursor: data.nextCursor,
				hasMore: data.hasMore,
			} as ToolCollection;
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore || !lastPage.nextCursor) {
				return undefined;
			}

			if (lastPage.items.length === 0) {
				return undefined;
			}

			const previousNextCursors = allPages
				.slice(0, -1)
				.map((page) => page.nextCursor)
				.filter((cursor): cursor is string => cursor !== null);

			if (previousNextCursors.includes(lastPage.nextCursor)) {
				return undefined;
			}

			return lastPage.nextCursor;
		},
	});
}
