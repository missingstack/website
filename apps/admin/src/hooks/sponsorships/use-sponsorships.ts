"use client";

import type {
	SponsorshipCollection,
	SponsorshipQueryOptions,
} from "@missingstack/api/features/sponsorships";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "~/lib/eden";
import type { SponsorshipSortColumn } from "~/lib/search-params";

interface UseSponsorshipsFilters {
	search?: string | null;
	sortBy?: SponsorshipSortColumn;
	sortOrder?: "asc" | "desc";
}

export function useSponsorships(filters: UseSponsorshipsFilters) {
	return useInfiniteQuery({
		queryKey: [
			"adminSponsorships",
			filters.search,
			filters.sortBy,
			filters.sortOrder,
		],
		queryFn: async ({ pageParam }: { pageParam?: string }) => {
			const query: Partial<SponsorshipQueryOptions> = {};

			if (filters.search) query.search = filters.search;
			if (filters.sortBy) query.sortBy = filters.sortBy;
			if (filters.sortOrder) query.sortOrder = filters.sortOrder;
			if (pageParam) query.cursor = pageParam;
			query.limit = 20;

			const { data, error } = await api.v1.sponsorships.get({
				query: query as SponsorshipQueryOptions,
			});

			if (error)
				throw new Error(error.value.message ?? "Failed to fetch sponsorships");
			if (!data) throw new Error("No data returned from API");

			return {
				items: data.items,
				nextCursor: data.nextCursor,
				hasMore: data.hasMore,
			} as SponsorshipCollection;
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
