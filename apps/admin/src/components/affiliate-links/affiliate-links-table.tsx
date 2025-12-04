"use client";

import type {
	AffiliateLinkCollection,
	AffiliateLinkQueryOptions,
} from "@missingstack/api/features/affiliate-links";
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	Loader2,
	Search,
	Trash2,
	X,
} from "lucide-react";
import { useQueryState, useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EditAffiliateLinkForm } from "~/components/affiliate-links/edit-affiliate-link-form";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
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
	type AffiliateLinkSortColumn,
	adminAffiliateLinksSearchParamsParsersClient,
} from "~/lib/search-params";

export function AffiliateLinksTable() {
	const loadMoreRef = useRef<HTMLTableRowElement>(null);
	const queryClient = useQueryClient();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [affiliateLinkToDelete, setAffiliateLinkToDelete] = useState<{
		id: string;
		toolName: string;
	} | null>(null);
	const [selectedAffiliateLinkId, setSelectedAffiliateLinkId] = useState<
		string | null
	>(null);
	const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

	const [search, setSearch] = useQueryState("search", {
		...adminAffiliateLinksSearchParamsParsersClient.search,
		shallow: false,
		throttleMs: 300,
	});

	const [filters, setFilters] = useQueryStates(
		{
			sortBy: adminAffiliateLinksSearchParamsParsersClient.sortBy,
			sortOrder: adminAffiliateLinksSearchParamsParsersClient.sortOrder,
		},
		{ shallow: false },
	);

	// Fetch all tools to map toolId to tool name
	const { data: toolsData } = useQuery({
		queryKey: ["tools", "for-affiliate-links"],
		queryFn: async () => {
			const { data, error } = await api.v1.tools.get({
				query: { limit: 1000 },
			});
			if (error)
				throw new Error(error.value.message ?? "Failed to fetch tools");
			return data;
		},
	});

	const toolMap = new Map(
		toolsData?.items.map((tool) => [tool.id, tool.name]) ?? [],
	);

	const fetchAffiliateLinks = async ({ pageParam }: { pageParam?: string }) => {
		const query: Partial<AffiliateLinkQueryOptions> = {};

		if (search) query.search = search;
		if (filters.sortBy) query.sortBy = filters.sortBy;
		if (filters.sortOrder) query.sortOrder = filters.sortOrder;
		if (pageParam) query.cursor = pageParam;
		query.limit = 20;

		const { data, error } = await api.v1["affiliate-links"].get({
			query: query as AffiliateLinkQueryOptions,
		});

		if (error)
			throw new Error(error.value.message ?? "Failed to fetch affiliate links");
		if (!data) throw new Error("No data returned from API");

		return {
			items: data.items,
			nextCursor: data.nextCursor,
			hasMore: data.hasMore,
		} as AffiliateLinkCollection;
	};

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const { error } = await api.v1["affiliate-links"]({ id }).delete();
			if (error)
				throw new Error(
					error.value.message ?? "Failed to delete affiliate link",
				);
		},
		onSuccess: () => {
			toast.success("Affiliate link deleted successfully");
			queryClient.resetQueries({ queryKey: ["adminAffiliateLinks"] });
			setDeleteDialogOpen(false);
			setAffiliateLinkToDelete(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete affiliate link");
		},
	});

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useInfiniteQuery({
		queryKey: [
			"adminAffiliateLinks",
			search,
			filters.sortBy,
			filters.sortOrder,
		],
		queryFn: fetchAffiliateLinks,
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

	useEffect(() => {
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

	const allAffiliateLinks = data?.pages.flatMap((page) => page.items) ?? [];

	const toggleSort = (column: AffiliateLinkSortColumn) => {
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

	const SortButton = ({ column }: { column: AffiliateLinkSortColumn }) => {
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

	const handleDeleteClick = (affiliateLink: { id: string; toolId: string }) => {
		const toolName = toolMap.get(affiliateLink.toolId) || "Unknown Tool";
		setAffiliateLinkToDelete({ id: affiliateLink.id, toolName });
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (affiliateLinkToDelete) {
			deleteMutation.mutate(affiliateLinkToDelete.id);
		}
	};

	const handleRowClick = (affiliateLinkId: string) => {
		setSelectedAffiliateLinkId(affiliateLinkId);
		setIsEditDrawerOpen(true);
	};

	const handleEditDrawerClose = (open: boolean) => {
		setIsEditDrawerOpen(open);
		if (!open) {
			setSelectedAffiliateLinkId(null);
		}
	};

	const formatCommissionRate = (rate: string | null) => {
		if (!rate) return "0%";
		const num = Number.parseFloat(rate);
		return `${(num * 100).toFixed(2)}%`;
	};

	const formatRevenue = (cents: number | null) => {
		if (!cents) return "$0.00";
		return `$${(cents / 100).toFixed(2)}`;
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
						placeholder="Search by tool name..."
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
							<TableHead className="w-[200px]">Tool</TableHead>
							<TableHead className="w-[300px]">Affiliate URL</TableHead>
							<TableHead className="w-[100px]">
								<div className="flex items-center gap-2">
									<span>Primary</span>
								</div>
							</TableHead>
							<TableHead className="w-[120px]">
								<div className="flex items-center gap-2">
									<span>Commission</span>
									<SortButton column="commissionRate" />
								</div>
							</TableHead>
							<TableHead className="w-[120px]">
								<div className="flex items-center gap-2">
									<span>Clicks</span>
									<SortButton column="clickCount" />
								</div>
							</TableHead>
							<TableHead className="w-[120px]">
								<div className="flex items-center gap-2">
									<span>Revenue</span>
									<SortButton column="revenueTracked" />
								</div>
							</TableHead>
							<TableHead className="w-[100px]">
								<div className="flex items-center gap-2">
									<span>Created</span>
									<SortButton column="createdAt" />
								</div>
							</TableHead>
							<TableHead className="w-[100px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading && (
							<TableRow>
								<TableCell colSpan={8} className="h-24 text-center">
									<div className="flex items-center justify-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span className="text-muted-foreground">
											Loading affiliate links...
										</span>
									</div>
								</TableCell>
							</TableRow>
						)}

						{isError && (
							<TableRow>
								<TableCell
									colSpan={8}
									className="h-24 text-center text-destructive"
								>
									Failed to load affiliate links. Please try again.
								</TableCell>
							</TableRow>
						)}

						{!isLoading && !isError && allAffiliateLinks.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={8}
									className="h-24 text-center text-muted-foreground"
								>
									No affiliate links found.
								</TableCell>
							</TableRow>
						)}

						{!isLoading &&
							!isError &&
							allAffiliateLinks.map((affiliateLink) => {
								const toolName = toolMap.get(affiliateLink.toolId) || "Unknown";
								return (
									<TableRow
										key={affiliateLink.id}
										onClick={() => handleRowClick(affiliateLink.id)}
										className="cursor-pointer"
									>
										<TableCell className="font-medium">{toolName}</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											<div className="max-w-[300px] truncate">
												{affiliateLink.affiliateUrl}
											</div>
										</TableCell>
										<TableCell>
											{affiliateLink.isPrimary ? (
												<Badge variant="default">Primary</Badge>
											) : (
												<span className="text-muted-foreground text-sm">
													No
												</span>
											)}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{formatCommissionRate(affiliateLink.commissionRate)}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{affiliateLink.clickCount ?? 0}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{formatRevenue(affiliateLink.revenueTracked)}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{new Date(affiliateLink.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell onClick={(e) => e.stopPropagation()}>
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													handleDeleteClick({
														id: affiliateLink.id,
														toolId: affiliateLink.toolId,
													})
												}
												className="text-destructive hover:text-destructive"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								);
							})}

						{!isLoading && !isError && allAffiliateLinks.length > 0 && (
							<TableRow ref={hasNextPage ? loadMoreRef : undefined}>
								<TableCell colSpan={8} className="h-16 text-center">
									{isFetchingNextPage && (
										<div className="flex items-center justify-center gap-2 text-muted-foreground">
											<Loader2 className="h-4 w-4 animate-spin" />
											<span className="text-sm">
												Loading more affiliate links...
											</span>
										</div>
									)}
									{!hasNextPage && !isFetchingNextPage && (
										<p className="text-muted-foreground text-sm">
											Showing all {allAffiliateLinks.length} affiliate link
											{allAffiliateLinks.length !== 1 ? "s" : ""}
										</p>
									)}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Affiliate Link</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the affiliate link for "
							{affiliateLinkToDelete?.toolName}"? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setDeleteDialogOpen(false);
								setAffiliateLinkToDelete(null);
							}}
							disabled={deleteMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteConfirm}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								"Delete"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<EditAffiliateLinkForm
				affiliateLinkId={selectedAffiliateLinkId}
				open={isEditDrawerOpen}
				onOpenChange={handleEditDrawerClose}
			/>
		</div>
	);
}
