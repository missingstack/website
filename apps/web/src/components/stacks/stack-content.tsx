"use client";

import type {
	CategoryWithCount,
	PricingModel,
	StackWithCount,
	Tag,
	ToolData,
	ToolQueryOptions,
} from "@missingstack/api/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useQueryState, useQueryStates } from "nuqs";
import { Container } from "~/components/ui/container";
import { api } from "~/lib/eden";
import { searchParamsParsers } from "~/lib/search-params";
import { StackActiveFilters } from "./stack-active-filters";
import { StackEmptyState } from "./stack-empty-state";
import { StackLoadMore } from "./stack-load-more";
import { StackSearchInput } from "./stack-search-input";
import { StackSidebar } from "./stack-sidebar";
import { StackToolControls } from "./stack-tool-controls";
import { StackToolGrid } from "./stack-tool-grid";

interface StackContentProps {
	stack: StackWithCount;
	relatedStacks: StackWithCount[];
	stackCategories: CategoryWithCount[];
	tags: Tag[];
}

interface FetchResult {
	items: ToolData[];
	nextCursor: string | null;
	total: number;
	hasMore: boolean;
}

export function StackContent({
	stack,
	relatedStacks,
	stackCategories,
	tags,
}: StackContentProps) {
	const [search, setSearch] = useQueryState("search", {
		...searchParamsParsers.search,
		shallow: false,
		throttleMs: 300,
	});

	const [filters, setFilters] = useQueryStates(
		{
			sortBy: searchParamsParsers.sortBy,
			pricing: searchParamsParsers.pricing,
			tagIds: searchParamsParsers.tagIds,
		},
		{ shallow: false },
	);

	const hasFilters =
		filters.pricing.length > 0 || filters.tagIds.length > 0 || !!search;

	const removeFilter = (key: "pricing" | "tagIds", value: string) => {
		const current = filters[key];
		const newValues = current.filter((v) => v !== value);
		setFilters({ [key]: newValues.length > 0 ? newValues : null });
	};

	const clearAllFilters = () => {
		setSearch(null);
		setFilters({
			pricing: null,
			tagIds: null,
		});
	};

	const fetchTools = async ({ pageParam }: { pageParam?: string }) => {
		const query: Partial<ToolQueryOptions> = {};

		if (search) query.search = search;
		if (filters.sortBy) query.sortBy = filters.sortBy;
		if (filters.pricing.length > 0)
			query.pricing = filters.pricing as PricingModel[];
		if (filters.tagIds.length > 0) query.tagIds = filters.tagIds;
		if (pageParam) query.cursor = pageParam;

		const { data, error } = await api.v1.tools
			.stack({
				stackId: stack.id,
			})
			.get({
				query: query as ToolQueryOptions,
			});

		if (error) throw new Error(error.value.message ?? "Failed to fetch tools");
		if (!data) throw new Error("No data returned from API");

		return {
			items: data.items,
			nextCursor: data.nextCursor,
			hasMore: data.hasMore,
			total: 0,
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
		queryKey: ["stackTools", stack.id, search, filters],
		queryFn: fetchTools,
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});

	const allTools = data?.pages.flatMap((page) => page.items) ?? [];
	const hasMorePages = hasNextPage ?? false;

	return (
		<>
			<StackSearchInput
				value={search}
				onChange={setSearch}
				placeholder={`Search in ${stack.name}...`}
			/>

			<Container>
				<div className="flex flex-col gap-6 sm:gap-8 lg:flex-row">
					<StackSidebar
						categories={stackCategories}
						relatedStacks={relatedStacks}
						tags={tags}
					/>

					<div className="min-w-0 flex-1">
						<div className="mb-4 flex flex-col items-start justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center sm:gap-4">
							<div className="flex flex-wrap items-center gap-2 sm:gap-3">
								<span className="text-muted-foreground text-xs sm:text-sm">
									{isLoading
										? "Loading..."
										: hasMorePages
											? `Showing ${allTools.length} tools`
											: `Showing ${allTools.length} tool${allTools.length !== 1 ? "s" : ""}`}
								</span>

								<StackActiveFilters
									search={search}
									pricing={filters.pricing as PricingModel[]}
									tagIds={filters.tagIds}
									tags={tags}
									onRemoveSearch={() => setSearch(null)}
									onRemovePricing={(p: PricingModel) =>
										removeFilter("pricing", p)
									}
									onRemoveTag={(tagId) => removeFilter("tagIds", tagId)}
								/>
							</div>

							<StackToolControls
								search={search}
								pricing={filters.pricing as PricingModel[]}
								tagIds={filters.tagIds}
								tags={tags}
								sortBy={filters.sortBy}
								onRemoveSearch={() => setSearch(null)}
								onRemovePricing={(p: PricingModel) =>
									removeFilter("pricing", p)
								}
								onRemoveTag={(tagId) => removeFilter("tagIds", tagId)}
								onSortChange={(value) =>
									setFilters({
										sortBy: value as "newest" | "name" | "popular",
									})
								}
							/>
						</div>

						{isLoading && <StackToolGrid tools={[]} isLoading />}

						{isError && (
							<div className="py-12 text-center text-destructive">
								Failed to load tools. Please try again.
							</div>
						)}

						{!isLoading && !isError && allTools.length === 0 && (
							<StackEmptyState
								hasFilters={hasFilters}
								onClearFilters={clearAllFilters}
							/>
						)}

						{!isLoading && !isError && allTools.length > 0 && (
							<>
								<StackToolGrid tools={allTools} />
								<StackLoadMore
									hasNextPage={hasMorePages}
									isFetchingNextPage={isFetchingNextPage}
									totalTools={allTools.length}
									onLoadMore={fetchNextPage}
								/>
							</>
						)}
					</div>
				</div>
			</Container>
		</>
	);
}
