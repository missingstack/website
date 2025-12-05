"use client";

import type {
	CategoryCollection,
	CategoryQueryOptions,
} from "@missingstack/api/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";
import type { CategorySortColumn } from "~/lib/search-params";

interface UseCategoriesFilters {
	search?: string | null;
	sortBy?: CategorySortColumn;
	sortOrder?: "asc" | "desc";
}

export function useCategories(filters: UseCategoriesFilters) {
	return useInfiniteQuery({
		queryKey: ["adminCategories", filters],
		queryFn: async ({ pageParam }: { pageParam?: string }) => {
			const query: Partial<CategoryQueryOptions> = {};

			if (filters.search) query.search = filters.search;
			if (filters.sortBy) query.sortBy = filters.sortBy;
			if (filters.sortOrder) query.sortOrder = filters.sortOrder;
			if (pageParam) query.cursor = pageParam;
			query.limit = 20;

			const { data, error } = await api.v1.categories.get({
				query: query as CategoryQueryOptions,
			});

			if (error)
				throw new Error(error.value.message ?? "Failed to fetch categories");
			if (!data) throw new Error("No data returned from API");

			return {
				items: data.items,
				nextCursor: data.nextCursor,
				hasMore: data.hasMore,
			} as CategoryCollection;
		},
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});
}
