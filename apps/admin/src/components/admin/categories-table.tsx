"use client";

import type {
	CategoryCollection,
	CategoryQueryOptions,
} from "@missingstack/api/types";
import {
	useInfiniteQuery,
	useMutation,
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
	type CategorySortColumn,
	adminSearchParamsParsersClient,
} from "~/lib/search-params";

export function CategoriesTable() {
	const loadMoreRef = useRef<HTMLTableRowElement>(null);
	const queryClient = useQueryClient();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);

	const [search, setSearch] = useQueryState("search", {
		...adminSearchParamsParsersClient.search,
		shallow: false,
		throttleMs: 300,
	});

	const [filters, setFilters] = useQueryStates(
		{
			sortBy: adminSearchParamsParsersClient.sortBy,
			sortOrder: adminSearchParamsParsersClient.sortOrder,
		},
		{ shallow: false },
	);

	const fetchCategories = async ({ pageParam }: { pageParam?: string }) => {
		const query: Partial<CategoryQueryOptions> = {};

		if (search) query.search = search;
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
	};

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const { error } = await api.v1.categories({ id }).delete();
			if (error)
				throw new Error(error.value.message ?? "Failed to delete category");
		},
		onSuccess: () => {
			toast.success("Category deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
			setDeleteDialogOpen(false);
			setCategoryToDelete(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete category");
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
		queryKey: ["adminCategories", search, filters],
		queryFn: fetchCategories,
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});

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

	const allCategories = data?.pages.flatMap((page) => page.items) ?? [];

	const toggleSort = (column: CategorySortColumn) => {
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

	const SortButton = ({ column }: { column: CategorySortColumn }) => {
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

	const handleDeleteClick = (category: { id: string; name: string }) => {
		setCategoryToDelete(category);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (categoryToDelete) {
			deleteMutation.mutate(categoryToDelete.id);
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
						placeholder="Search categories..."
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
							<TableHead className="w-[100px]">
								<div className="flex items-center gap-2">
									<span>Name</span>
									<SortButton column="name" />
								</div>
							</TableHead>
							<TableHead>
								<div className="flex items-center gap-2">
									<span>Slug</span>
									<SortButton column="slug" />
								</div>
							</TableHead>
							<TableHead className="w-[100px]">
								<div className="flex items-center gap-2">
									<span>Weight</span>
									<SortButton column="weight" />
								</div>
							</TableHead>
							<TableHead className="w-[200px]">
								<div className="flex items-center gap-2">
									<span>Created</span>
									<SortButton column="createdAt" />
								</div>
							</TableHead>
							<TableHead className="w-[100px]">Description</TableHead>
							<TableHead className="w-[100px]">Icon</TableHead>
							<TableHead className="w-[100px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading && (
							<TableRow>
								<TableCell colSpan={7} className="h-24 text-center">
									<div className="flex items-center justify-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										<span className="text-muted-foreground">
											Loading categories...
										</span>
									</div>
								</TableCell>
							</TableRow>
						)}

						{isError && (
							<TableRow>
								<TableCell
									colSpan={7}
									className="h-24 text-center text-destructive"
								>
									Failed to load categories. Please try again.
								</TableCell>
							</TableRow>
						)}

						{!isLoading && !isError && allCategories.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={7}
									className="h-24 text-center text-muted-foreground"
								>
									No categories found.
								</TableCell>
							</TableRow>
						)}

						{!isLoading &&
							!isError &&
							allCategories.map((category) => (
								<TableRow key={category.id}>
									<TableCell className="font-medium">{category.name}</TableCell>
									<TableCell className="font-mono text-muted-foreground text-sm">
										{category.slug}
									</TableCell>
									<TableCell>{category.weight}</TableCell>
									<TableCell className="text-muted-foreground text-sm">
										{new Date(category.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">
										{category.description || "-"}
									</TableCell>
									<TableCell className="font-mono text-muted-foreground text-xs">
										{category.icon}
									</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												handleDeleteClick({
													id: category.id,
													name: category.name,
												})
											}
											className="text-destructive hover:text-destructive"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}

						{!isLoading && !isError && allCategories.length > 0 && (
							<TableRow ref={loadMoreRef}>
								<TableCell colSpan={7} className="h-16 text-center">
									{isFetchingNextPage && (
										<div className="flex items-center justify-center gap-2 text-muted-foreground">
											<Loader2 className="h-4 w-4 animate-spin" />
											<span className="text-sm">
												Loading more categories...
											</span>
										</div>
									)}
									{!hasNextPage &&
										allCategories.length > 0 &&
										!isFetchingNextPage && (
											<p className="text-muted-foreground text-sm">
												Showing all {allCategories.length} categor
												{allCategories.length !== 1 ? "ies" : "y"}
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
						<DialogTitle>Delete Category</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete "{categoryToDelete?.name}"? This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setDeleteDialogOpen(false);
								setCategoryToDelete(null);
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
		</div>
	);
}
