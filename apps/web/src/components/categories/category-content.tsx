"use client";

import type {
	Category,
	PricingModel,
	Tag,
	ToolData,
	ToolQueryOptions,
} from "@missingstack/api/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
	ArrowUpDown,
	Grid3X3,
	List,
	Loader2,
	Search,
	SlidersHorizontal,
	X,
} from "lucide-react";
import Link from "next/link";
import { useQueryState, useQueryStates } from "nuqs";
import { useEffect, useRef } from "react";
import { ToolCard, ToolCardSkeleton } from "~/components/home/tool-card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";
import { Input } from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Toggle } from "~/components/ui/toggle";

import { api } from "~/lib/eden";
import { getIcon } from "~/lib/icons";
import {
	PRICING_OPTIONS,
	SORT_OPTIONS,
	searchParamsParsers,
} from "~/lib/search-params";

interface CategoryContentProps {
	category: Category;
	relatedCategories: Category[];
	tags: Tag[];
}

interface FetchResult {
	items: ToolData[];
	nextCursor: string | null;
	total: number;
	hasMore: boolean;
}

export function CategoryContent({
	category,
	relatedCategories,
	tags,
}: CategoryContentProps) {
	const loadMoreRef = useRef<HTMLDivElement>(null);

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
		filters.pricing.length > 0 || filters.tagIds.length > 0 || search;

	const toggleArrayValue = (key: "pricing" | "tagIds", value: string) => {
		const current = filters[key];
		const newValues = current.includes(value)
			? current.filter((v) => v !== value)
			: [...current, value];
		setFilters({ [key]: newValues.length > 0 ? newValues : null });
	};

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
		// Build query options for the category endpoint
		// categoryId is in the URL path, so we only pass query parameters
		const query: Partial<ToolQueryOptions> = {};

		// Apply filters
		if (search) query.search = search;
		if (filters.sortBy) query.sortBy = filters.sortBy;
		if (filters.pricing.length > 0)
			query.pricing = filters.pricing as PricingModel[];
		if (filters.tagIds.length > 0) query.tagIds = filters.tagIds;
		if (pageParam) query.cursor = pageParam;

		const { data, error } = await api.v1.tools
			.category({
				categoryId: category.id,
			})
			.get({
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
		queryKey: ["categoryTools", category.id, search, filters],
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
	const hasMorePages = hasNextPage ?? false;

	return (
		<Container>
			<div className="mb-8 flex justify-end">
				<div className="relative w-full lg:w-96">
					<Search className="-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-muted-foreground" />
					<Input
						type="text"
						value={search ?? ""}
						onChange={(e) => setSearch(e.target.value || null)}
						placeholder={`Search in ${category.name}...`}
						className="h-12 rounded-xl border-border bg-white pr-12 pl-12"
					/>
					{search && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSearch(null)}
							className="-translate-y-1/2 absolute top-1/2 right-2 h-8 w-8 p-0"
						>
							<X className="h-4 w-4" />
							<span className="sr-only">Clear search</span>
						</Button>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-8 lg:flex-row">
				<aside className="w-full shrink-0 lg:w-64">
					<div className="space-y-6 lg:sticky lg:top-24">
						<div className="rounded-xl border border-border/50 bg-white p-5">
							<div className="mb-4 flex items-center justify-between">
								<h3 className="flex items-center gap-2 font-semibold text-sm">
									<SlidersHorizontal className="h-4 w-4" />
									Quick Filters
								</h3>
								{hasFilters && (
									<Button
										variant="ghost"
										size="sm"
										className="h-auto py-1 text-xs"
										onClick={clearAllFilters}
									>
										Clear all
									</Button>
								)}
							</div>

							<div className="mb-5">
								<h4 className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
									Pricing
								</h4>
								<div className="flex flex-wrap gap-2">
									{PRICING_OPTIONS.map((pricing) => {
										const isSelected = filters.pricing.includes(pricing);
										return (
											<Toggle
												key={pricing}
												pressed={isSelected}
												onPressedChange={() =>
													toggleArrayValue("pricing", pricing)
												}
												size="sm"
												variant="outline"
												className="rounded-full px-3 text-xs data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
											>
												{pricing}
											</Toggle>
										);
									})}
								</div>
							</div>

							<div>
								<h4 className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
									Tags
								</h4>
								<div className="flex flex-wrap gap-2">
									{tags.slice(0, 6).map((tag) => {
										const isSelected = filters.tagIds.includes(tag.id);
										return (
											<Toggle
												key={tag.id}
												pressed={isSelected}
												onPressedChange={() =>
													toggleArrayValue("tagIds", tag.id)
												}
												size="sm"
												variant="outline"
												className="rounded-full px-3 text-xs data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
											>
												{tag.name}
											</Toggle>
										);
									})}
								</div>
							</div>
						</div>

						<div className="rounded-xl border border-border/50 bg-white p-5">
							<h3 className="mb-4 font-semibold text-sm">Related Categories</h3>
							<div className="space-y-2">
								{relatedCategories.map((cat) => {
									const Icon = getIcon(cat.icon);
									return (
										<Link
											key={cat.id}
											href={`/categories/${cat.slug}`}
											className="-mx-2 group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/50"
										>
											<Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
											<span className="flex-1 text-muted-foreground text-sm group-hover:text-primary">
												{cat.name}
											</span>
											<span className="text-muted-foreground/70 text-xs">
												{cat.toolCount}
											</span>
										</Link>
									);
								})}
							</div>
						</div>
					</div>
				</aside>

				<div className="min-w-0 flex-1">
					<div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
						<div className="flex flex-wrap items-center gap-3">
							<span className="text-muted-foreground text-sm">
								{isLoading
									? "Loading..."
									: hasMorePages
										? `Showing ${allTools.length} tools`
										: `Showing ${allTools.length} tool${allTools.length !== 1 ? "s" : ""}`}
							</span>

							{hasFilters && (
								<div className="flex flex-wrap items-center gap-2">
									{search && (
										<Badge variant="secondary" className="gap-1 pr-1">
											"{search}"
											<button
												type="button"
												onClick={() => setSearch(null)}
												className="ml-1 rounded-full p-0.5 hover:bg-muted"
											>
												<X className="h-3 w-3" />
												<span className="sr-only">Remove search filter</span>
											</button>
										</Badge>
									)}
									{filters.pricing.map((p) => (
										<Badge key={p} variant="secondary" className="gap-1 pr-1">
											{p}
											<button
												type="button"
												onClick={() => removeFilter("pricing", p)}
												className="ml-1 rounded-full p-0.5 hover:bg-muted"
											>
												<X className="h-3 w-3" />
												<span className="sr-only">Remove {p} filter</span>
											</button>
										</Badge>
									))}
									{filters.tagIds.map((tagId) => {
										const tag = tags.find((t) => t.id === tagId);
										return (
											<Badge
												key={tagId}
												variant="secondary"
												className="gap-1 pr-1"
											>
												{tag?.name || tagId}
												<button
													type="button"
													onClick={() => removeFilter("tagIds", tagId)}
													className="ml-1 rounded-full p-0.5 hover:bg-muted"
												>
													<X className="h-3 w-3" />
													<span className="sr-only">
														Remove {tag?.name || tagId} filter
													</span>
												</button>
											</Badge>
										);
									})}
								</div>
							)}
						</div>

						<div className="flex items-center gap-3">
							<Select
								value={filters.sortBy}
								onValueChange={(value) =>
									setFilters({
										sortBy: value as "newest" | "name" | "popular",
									})
								}
							>
								<SelectTrigger className="w-[160px] border-border/50 bg-white">
									<ArrowUpDown className="h-4 w-4 text-muted-foreground" />
									<SelectValue placeholder="Sort by" />
								</SelectTrigger>
								<SelectContent>
									{SORT_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<div className="flex items-center overflow-hidden rounded-lg border border-border">
								<Button
									type="button"
									size="icon"
									variant="ghost"
									className="rounded-none bg-primary text-white hover:bg-primary"
									aria-label="Grid view"
								>
									<Grid3X3 className="h-4 w-4" />
								</Button>
								<Button
									type="button"
									size="icon"
									variant="ghost"
									className="rounded-none"
									aria-label="List view"
								>
									<List className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					{isLoading && (
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							{Array.from({ length: 6 }).map((_, i) => (
								<ToolCardSkeleton key={`skeleton-${i.toString()}`} />
							))}
						</div>
					)}

					{isError && (
						<div className="py-12 text-center text-destructive">
							Failed to load tools. Please try again.
						</div>
					)}

					{!isLoading && !isError && allTools.length === 0 && (
						<div className="rounded-2xl bg-secondary/20 py-12 text-center">
							<p className="mb-4 text-muted-foreground">
								No tools found matching your criteria.
							</p>
							{hasFilters ? (
								<Button variant="outline" onClick={clearAllFilters}>
									Clear filters
								</Button>
							) : (
								<Link href="/submit" className="text-primary hover:underline">
									Submit the first tool →
								</Link>
							)}
						</div>
					)}

					{!isLoading && !isError && allTools.length > 0 && (
						<>
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								{allTools.map((tool) => (
									<ToolCard key={tool.id} tool={tool} />
								))}
							</div>

							<div ref={loadMoreRef} className="mt-12 flex justify-center">
								{isFetchingNextPage && (
									<div className="flex items-center gap-2 text-muted-foreground">
										<Loader2 className="h-5 w-5 animate-spin" />
										<span className="text-sm">Loading more tools...</span>
									</div>
								)}
								{!hasNextPage && allTools.length > 0 && !isFetchingNextPage && (
									<p className="text-muted-foreground text-sm">
										You've seen all {allTools.length} tool
										{allTools.length !== 1 ? "s" : ""} in this category
									</p>
								)}
							</div>
						</>
					)}
				</div>
			</div>
		</Container>
	);
}
