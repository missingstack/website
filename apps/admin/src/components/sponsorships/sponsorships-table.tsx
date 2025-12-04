"use client";

import type {
	SponsorshipCollection,
	SponsorshipQueryOptions,
} from "@missingstack/api/features/sponsorships";
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
import { EditSponsorshipForm } from "~/components/sponsorships/edit-sponsorship-form";
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
	type SponsorshipSortColumn,
	adminSponsorshipsSearchParamsParsersClient,
} from "~/lib/search-params";

export function SponsorshipsTable() {
	const loadMoreRef = useRef<HTMLTableRowElement>(null);
	const queryClient = useQueryClient();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [sponsorshipToDelete, setSponsorshipToDelete] = useState<{
		id: string;
		toolName: string;
	} | null>(null);
	const [selectedSponsorshipId, setSelectedSponsorshipId] = useState<
		string | null
	>(null);
	const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

	const [search, setSearch] = useQueryState("search", {
		...adminSponsorshipsSearchParamsParsersClient.search,
		shallow: false,
		throttleMs: 300,
	});

	const [filters, setFilters] = useQueryStates(
		{
			sortBy: adminSponsorshipsSearchParamsParsersClient.sortBy,
			sortOrder: adminSponsorshipsSearchParamsParsersClient.sortOrder,
		},
		{ shallow: false },
	);

	// Fetch all tools to map toolId to tool name
	const { data: toolsData } = useQuery({
		queryKey: ["tools", "for-sponsorships"],
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

	const fetchSponsorships = async ({ pageParam }: { pageParam?: string }) => {
		const query: Partial<SponsorshipQueryOptions> = {};

		if (search) query.search = search;
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
	};

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const { error } = await api.v1.sponsorships({ id }).delete();
			if (error)
				throw new Error(error.value.message ?? "Failed to delete sponsorship");
		},
		onSuccess: () => {
			toast.success("Sponsorship deleted successfully");
			queryClient.resetQueries({ queryKey: ["adminSponsorships"] });
			setDeleteDialogOpen(false);
			setSponsorshipToDelete(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete sponsorship");
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
		queryKey: ["adminSponsorships", search, filters.sortBy, filters.sortOrder],
		queryFn: fetchSponsorships,
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

	const allSponsorships = data?.pages.flatMap((page) => page.items) ?? [];

	const toggleSort = (column: SponsorshipSortColumn) => {
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

	const SortButton = ({ column }: { column: SponsorshipSortColumn }) => {
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

	const handleDeleteClick = (sponsorship: { id: string; toolId: string }) => {
		const toolName = toolMap.get(sponsorship.toolId) || "Unknown Tool";
		setSponsorshipToDelete({ id: sponsorship.id, toolName });
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (sponsorshipToDelete) {
			deleteMutation.mutate(sponsorshipToDelete.id);
		}
	};

	const handleRowClick = (sponsorshipId: string) => {
		setSelectedSponsorshipId(sponsorshipId);
		setIsEditDrawerOpen(true);
	};

	const handleEditDrawerClose = (open: boolean) => {
		setIsEditDrawerOpen(open);
		if (!open) {
			setSelectedSponsorshipId(null);
		}
	};

	const getTierBadgeVariant = (tier: string) => {
		switch (tier) {
			case "enterprise":
				return "default";
			case "premium":
				return "blue";
			case "basic":
				return "secondary";
			default:
				return "outline";
		}
	};

	const getPaymentStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "completed":
				return "default";
			case "pending":
				return "secondary";
			case "failed":
				return "destructive";
			case "refunded":
				return "outline";
			default:
				return "outline";
		}
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
							<TableHead className="w-[100px]">
								<div className="flex items-center gap-2">
									<span>Tier</span>
								</div>
							</TableHead>
							<TableHead className="w-[120px]">
								<div className="flex items-center gap-2">
									<span>Start Date</span>
									<SortButton column="startDate" />
								</div>
							</TableHead>
							<TableHead className="w-[120px]">
								<div className="flex items-center gap-2">
									<span>End Date</span>
									<SortButton column="endDate" />
								</div>
							</TableHead>
							<TableHead className="w-[120px]">
								<div className="flex items-center gap-2">
									<span>Priority</span>
									<SortButton column="priorityWeight" />
								</div>
							</TableHead>
							<TableHead className="w-[120px]">Payment Status</TableHead>
							<TableHead className="w-[100px]">Active</TableHead>
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
								<TableCell colSpan={9} className="h-24 text-center">
									<div className="flex items-center justify-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span className="text-muted-foreground">
											Loading sponsorships...
										</span>
									</div>
								</TableCell>
							</TableRow>
						)}

						{isError && (
							<TableRow>
								<TableCell
									colSpan={9}
									className="h-24 text-center text-destructive"
								>
									Failed to load sponsorships. Please try again.
								</TableCell>
							</TableRow>
						)}

						{!isLoading && !isError && allSponsorships.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={9}
									className="h-24 text-center text-muted-foreground"
								>
									No sponsorships found.
								</TableCell>
							</TableRow>
						)}

						{!isLoading &&
							!isError &&
							allSponsorships.map((sponsorship) => {
								const toolName = toolMap.get(sponsorship.toolId) || "Unknown";
								return (
									<TableRow
										key={sponsorship.id}
										onClick={() => handleRowClick(sponsorship.id)}
										className="cursor-pointer"
									>
										<TableCell className="font-medium">{toolName}</TableCell>
										<TableCell>
											<Badge variant={getTierBadgeVariant(sponsorship.tier)}>
												{sponsorship.tier}
											</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{new Date(sponsorship.startDate).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{new Date(sponsorship.endDate).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{sponsorship.priorityWeight}
										</TableCell>
										<TableCell>
											<Badge
												variant={getPaymentStatusBadgeVariant(
													sponsorship.paymentStatus,
												)}
											>
												{sponsorship.paymentStatus}
											</Badge>
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{sponsorship.isActive ? "Yes" : "No"}
										</TableCell>
										<TableCell className="text-muted-foreground text-sm">
											{new Date(sponsorship.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell onClick={(e) => e.stopPropagation()}>
											<Button
												variant="ghost"
												size="sm"
												onClick={() =>
													handleDeleteClick({
														id: sponsorship.id,
														toolId: sponsorship.toolId,
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

						{!isLoading && !isError && allSponsorships.length > 0 && (
							<TableRow ref={hasNextPage ? loadMoreRef : undefined}>
								<TableCell colSpan={9} className="h-16 text-center">
									{isFetchingNextPage && (
										<div className="flex items-center justify-center gap-2 text-muted-foreground">
											<Loader2 className="h-4 w-4 animate-spin" />
											<span className="text-sm">
												Loading more sponsorships...
											</span>
										</div>
									)}
									{!hasNextPage && !isFetchingNextPage && (
										<p className="text-muted-foreground text-sm">
											Showing all {allSponsorships.length} sponsorship
											{allSponsorships.length !== 1 ? "s" : ""}
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
						<DialogTitle>Delete Sponsorship</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the sponsorship for "
							{sponsorshipToDelete?.toolName}"? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setDeleteDialogOpen(false);
								setSponsorshipToDelete(null);
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

			<EditSponsorshipForm
				sponsorshipId={selectedSponsorshipId}
				open={isEditDrawerOpen}
				onOpenChange={handleEditDrawerClose}
			/>
		</div>
	);
}
