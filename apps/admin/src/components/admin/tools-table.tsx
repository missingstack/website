"use client";

import type { ToolCollection, ToolQueryOptions } from "@missingstack/api/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	Loader2,
	Search,
	X,
} from "lucide-react";
import { useQueryState, useQueryStates } from "nuqs";
import { useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { api } from "~/lib/eden";
import {
	type ToolSortColumn,
	adminToolsSearchParamsParsersClient,
} from "~/lib/search-params";

export function ToolsTable() {
	const loadMoreRef = useRef<HTMLTableRowElement>(null);

	const [search, setSearch] = useQueryState("search", {
		...adminToolsSearchParamsParsersClient.search,
		shallow: false,
		throttleMs: 300,
	});

	const [filters, setFilters] = useQueryStates(
		{
			sortBy: adminToolsSearchParamsParsersClient.sortBy,
			sortOrder: adminToolsSearchParamsParsersClient.sortOrder,
		},
		{ shallow: false },
	);

	const fetchTools = async ({ pageParam }: { pageParam?: string }) => {
		const query: Partial<ToolQueryOptions> = {};

		if (search) query.search = search;
		// Map sortBy to ToolQueryOptions sortBy (name, newest, popular, relevance)
		if (filters.sortBy) {
			if (filters.sortBy === "newest") {
				query.sortBy = "newest";
			} else if (filters.sortBy === "popular") {
				query.sortBy = "popular";
			} else if (filters.sortBy === "name") {
				query.sortBy = "name";
			}
		}
		if (filters.sortOrder) query.sortOrder = filters.sortOrder;
		if (pageParam) query.cursor = pageParam;
		query.limit = 20;

		const { data, error } = await api.v1.tools.get({
			query: query as ToolQueryOptions,
		});

		if (error) throw new Error(error.value.message ?? "Failed to fetch tools");
		if (!data) throw new Error("No data returned from API");

		return {
			items: data.items,
			nextCursor: data.nextCursor,
			hasMore: data.hasMore,
		} as ToolCollection;
	};

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useInfiniteQuery({
		queryKey: ["adminTools", search, filters.sortBy, filters.sortOrder],
		queryFn: fetchTools,
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage, allPages) => {
			// Stop if no more pages or no cursor
			if (!lastPage.hasMore || !lastPage.nextCursor) {
				return undefined;
			}

			// Stop if we got no items (safety check)
			if (lastPage.items.length === 0) {
				return undefined;
			}

			// Prevent fetching the same cursor twice
			// Check if this nextCursor matches any previous page's nextCursor
			// This indicates we're in a loop where the API keeps returning the same cursor
			const previousNextCursors = allPages
				.slice(0, -1) // Exclude the current (last) page
				.map((page) => page.nextCursor)
				.filter((cursor): cursor is string => cursor !== null);

			// If we've seen this cursor before, stop to prevent infinite loop
			if (previousNextCursors.includes(lastPage.nextCursor)) {
				return undefined;
			}

			return lastPage.nextCursor;
		},
	});

	useEffect(() => {
		// Only set up observer if there are more pages to load
		if (!hasNextPage || isFetchingNextPage || isLoading) {
			return;
		}

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

	const toggleSort = (column: ToolSortColumn) => {
		if (filters.sortBy === column) {
			setFilters({
				sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
			});
		} else {
			setFilters({
				sortBy: column,
				sortOrder: "asc",
			});
		}
	};

	const SortButton = ({ column }: { column: ToolSortColumn }) => {
		const isActive = filters.sortBy === column;
		return (
			<Button
				variant="ghost"
				size="sm"
				className="h-8 gap-1"
				onClick={() => toggleSort(column)}
			>
				{isActive ? (
					filters.sortOrder === "asc" ? (
						<ArrowUp className="h-4 w-4" />
					) : (
						<ArrowDown className="h-4 w-4" />
					)
				) : (
					<ArrowUpDown className="h-4 w-4 opacity-50" />
				)}
			</Button>
		);
	};

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex items-center gap-2">
				<div className="relative max-w-sm flex-1">
					<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value || null)}
						placeholder="Search tools..."
						className="pr-9 pl-9"
					/>
					{search && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setSearch(null)}
							className="-translate-y-1/2 absolute top-1/2 right-1 h-7 w-7 p-0"
						>
							<X className="h-4 w-4" />
							<span className="sr-only">Clear search</span>
						</Button>
					)}
				</div>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[200px]">
								<div className="flex items-center gap-2">
									<span>Name</span>
									<SortButton column="name" />
								</div>
							</TableHead>
							<TableHead>
								<div className="flex items-center gap-2">
									<span>Slug</span>
								</div>
							</TableHead>
							<TableHead className="w-[100px]">
								<div className="flex items-center gap-2">
									<span>Created</span>
									<SortButton column="newest" />
								</div>
							</TableHead>
							<TableHead className="w-[150px]">Description</TableHead>
							<TableHead className="w-[100px]">Website</TableHead>
							<TableHead className="w-[100px]">Featured</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading && (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									<div className="flex items-center justify-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span className="text-muted-foreground">
											Loading tools...
										</span>
									</div>
								</TableCell>
							</TableRow>
						)}

						{isError && (
							<TableRow>
								<TableCell
									colSpan={6}
									className="h-24 text-center text-destructive"
								>
									Failed to load tools. Please try again.
								</TableCell>
							</TableRow>
						)}

						{!isLoading && !isError && allTools.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={6}
									className="h-24 text-center text-muted-foreground"
								>
									No tools found.
								</TableCell>
							</TableRow>
						)}

						{!isLoading &&
							!isError &&
							allTools.map((tool) => (
								<TableRow key={tool.id}>
									<TableCell className="font-medium">{tool.name}</TableCell>
									<TableCell className="font-mono text-muted-foreground text-sm">
										{tool.slug}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{new Date(tool.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
										{tool.description || "-"}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{tool.website ? (
											<a
												href={tool.website}
												target="_blank"
												rel="noopener noreferrer"
												className="text-primary hover:underline"
											>
												{tool.website}
											</a>
										) : (
											"-"
										)}
									</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{tool.featured ? "Yes" : "No"}
									</TableCell>
								</TableRow>
							))}

						{!isLoading && !isError && allTools.length > 0 && (
							<TableRow ref={hasNextPage ? loadMoreRef : undefined}>
								<TableCell colSpan={6} className="h-16 text-center">
									{isFetchingNextPage && (
										<div className="flex items-center justify-center gap-2 text-muted-foreground">
											<Loader2 className="h-4 w-4 animate-spin" />
											<span className="text-sm">Loading more tools...</span>
										</div>
									)}
									{!hasNextPage && !isFetchingNextPage && (
										<p className="text-muted-foreground text-sm">
											Showing all {allTools.length} tool
											{allTools.length !== 1 ? "s" : ""}
										</p>
									)}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
