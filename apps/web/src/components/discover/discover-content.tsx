"use client";

import type {
	Category,
	PricingModel,
	Tag,
	ToolData,
	ToolQueryOptions,
} from "@missingstack/api/types";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Grid3X3, List, Loader2 } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useRef } from "react";
import {
	ActiveFilters,
	FilterSidebar,
	MobileFilterSheet,
	SearchInput,
	SortSelect,
} from "~/components/discover";
import { ToolCard, ToolCardSkeleton } from "~/components/home/tool-card";
import { Container } from "~/components/ui/container";
import { api } from "~/lib/eden";
import {
	type PLATFORM_OPTIONS,
	type PRICING_OPTIONS,
	searchParamsParsers,
} from "~/lib/search-params";

interface DiscoverContentProps {
	categories: Category[];
	tags: Tag[];
	categoryNames: Record<string, string>;
	tagNames: Record<string, string>;
	pricingOptions: typeof PRICING_OPTIONS;
	platformOptions: typeof PLATFORM_OPTIONS;
}

interface FetchResult {
	items: ToolData[];
	nextCursor: string | null;
	total: number;
	hasMore: boolean;
}

export function DiscoverContent({
	categories,
	tags,
	categoryNames,
	tagNames,
	pricingOptions,
	platformOptions,
}: DiscoverContentProps) {
	const loadMoreRef = useRef<HTMLDivElement>(null);

	const [filters] = useQueryStates({
		search: searchParamsParsers.search,
		sortBy: searchParamsParsers.sortBy,
		categoryIds: searchParamsParsers.categoryIds,
		pricing: searchParamsParsers.pricing,
		platforms: searchParamsParsers.platforms,
		tagIds: searchParamsParsers.tagIds,
	});

	const fetchTools = async ({ pageParam }: { pageParam?: string }) => {
		// Build query options for the tools endpoint
		const query: Partial<ToolQueryOptions> = {};

		if (filters.search)
			// Apply filters
			query.search = filters.search;
		if (filters.sortBy) query.sortBy = filters.sortBy;
		if (filters.categoryIds.length > 0) query.categoryIds = filters.categoryIds;
		if (filters.pricing.length > 0)
			query.pricing = filters.pricing as PricingModel[];
		if (filters.tagIds.length > 0) query.tagIds = filters.tagIds;
		if (pageParam) query.cursor = pageParam;

		const { data, error } = await api.v1.tools.get({
			query: query as ToolQueryOptions,
		});

		if (error) throw new Error(error.value.message ?? "Failed to fetch tools");
		if (!data) throw new Error("No data returned from API");

		// Map ToolCollection to FetchResult format
		// Note: API doesn't return total count
		return {
			items: data.items,
			nextCursor: data.nextCursor,
			hasMore: data.hasMore,
			total: 0, // Total not available from API
		} as FetchResult;
	};

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useInfiniteQuery({
		queryKey: ["tools", filters],
		queryFn: fetchTools,
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});

	// Infinite scroll observer
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries[0].isIntersecting &&
					hasNextPage &&
					!isFetchingNextPage &&
					!isLoading
				) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1, rootMargin: "100px" },
		);

		const currentRef = loadMoreRef.current;
		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
		};
	}, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

	const allTools = data?.pages.flatMap((page) => page.items) ?? [];

	// Count active filters for mobile badge
	const filterCount =
		filters.categoryIds.length +
		filters.pricing.length +
		filters.platforms.length +
		filters.tagIds.length;

	return (
		<Container>
			<div className="mb-6 flex justify-end sm:mb-8">
				<SearchInput className="w-full lg:w-96" />
			</div>

			<div className="flex flex-col gap-6 sm:gap-8 lg:flex-row">
				<aside className="hidden w-72 shrink-0 lg:block">
					<div className="sticky top-24">
						<FilterSidebar
							categories={categories}
							tags={tags}
							pricingOptions={pricingOptions}
							platformOptions={platformOptions}
						/>
					</div>
				</aside>

				<div className="min-w-0 flex-1">
					<div className="mb-4 flex flex-col items-start justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center sm:gap-4">
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-muted-foreground text-xs sm:text-sm">
								{isLoading
									? "Loading..."
									: `Showing ${allTools.length} tool${allTools.length !== 1 ? "s" : ""}`}
							</span>
							<ActiveFilters
								categoryNames={categoryNames}
								tagNames={tagNames}
							/>
						</div>

						<div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
							<MobileFilterSheet
								categories={categories}
								tags={tags}
								pricingOptions={pricingOptions}
								platformOptions={platformOptions}
								filterCount={filterCount}
							/>

							<div className="flex items-center gap-3">
								<SortSelect />

								<div className="hidden items-center overflow-hidden rounded-lg border border-border sm:flex">
									<button
										type="button"
										className="bg-primary p-2 text-white"
										aria-label="Grid view"
									>
										<Grid3X3 className="h-4 w-4" />
									</button>
									<button
										type="button"
										className="p-2 text-muted-foreground hover:bg-secondary/50"
										aria-label="List view"
									>
										<List className="h-4 w-4" />
									</button>
								</div>
							</div>
						</div>
					</div>

					{isLoading && (
						<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
							{Array.from({ length: 6 }).map((_, i) => (
								<ToolCardSkeleton key={`skeleton-${i.toString()}`} />
							))}
						</div>
					)}

					{isError && (
						<div className="rounded-xl bg-destructive/10 py-12 text-center sm:rounded-2xl sm:py-16">
							<p className="mb-2 text-destructive text-sm sm:text-base">
								Failed to load tools
							</p>
							<p className="text-muted-foreground text-xs sm:text-sm">
								Please try refreshing the page
							</p>
						</div>
					)}

					{!isLoading && !isError && allTools.length === 0 && (
						<div className="rounded-xl bg-secondary/20 py-12 text-center sm:rounded-2xl sm:py-16">
							<p className="mb-2 text-muted-foreground text-sm sm:text-base">
								No tools found
							</p>
							<p className="text-muted-foreground text-xs sm:text-sm">
								Try adjusting your filters or search query
							</p>
						</div>
					)}

					{!isLoading && !isError && allTools.length > 0 && (
						<div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
							{allTools.map((tool) => (
								<ToolCard key={tool.id} tool={tool} />
							))}
						</div>
					)}

					<div ref={loadMoreRef} className="mt-6 flex justify-center sm:mt-8">
						{isFetchingNextPage && (
							<div className="flex items-center gap-2 text-muted-foreground">
								<Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
								<span className="text-xs sm:text-sm">
									Loading more tools...
								</span>
							</div>
						)}
						{!hasNextPage &&
							allTools.length > 0 &&
							!isLoading &&
							!isFetchingNextPage && (
								<p className="text-muted-foreground text-xs sm:text-sm">
									You've reached the end
								</p>
							)}
					</div>
				</div>
			</div>
		</Container>
	);
}
