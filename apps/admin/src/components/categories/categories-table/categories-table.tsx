"use client";

import { useState } from "react";
import { Table, TableBody } from "~/components/ui/table";
import {
	useCategories,
	useCategoryFilters,
	useDeleteCategory,
	useInfiniteScroll,
} from "~/hooks/categories";
import { EditCategoryForm } from "../category-form";
import { CategoriesTableEmpty } from "./categories-table-empty";
import { CategoriesTableError } from "./categories-table-error";
import { CategoriesTableFooter } from "./categories-table-footer";
import { CategoriesTableHeader } from "./categories-table-header";
import { CategoriesTableLoading } from "./categories-table-loading";
import { CategoriesTableRow } from "./categories-table-row";
import { CategoriesTableSearch } from "./categories-table-search";
import { CategoryDeleteDialog } from "./category-delete-dialog";

export function CategoriesTable() {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [categoryToDelete, setCategoryToDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
		null,
	);
	const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

	const { search, setSearch, filters, toggleSort } = useCategoryFilters();
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useCategories(filters);
	const deleteMutation = useDeleteCategory();
	const loadMoreRef = useInfiniteScroll<HTMLTableRowElement>({
		hasNextPage: hasNextPage ?? false,
		isFetchingNextPage: isFetchingNextPage ?? false,
		isLoading: isLoading ?? false,
		fetchNextPage,
	});

	const allCategories = data?.pages.flatMap((page) => page.items) ?? [];

	const handleDeleteClick = (category: { id: string; name: string }) => {
		setCategoryToDelete(category);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (categoryToDelete) {
			deleteMutation.mutate(categoryToDelete.id, {
				onSuccess: () => {
					setDeleteDialogOpen(false);
					setCategoryToDelete(null);
				},
			});
		}
	};

	const handleRowClick = (categoryId: string) => {
		setSelectedCategoryId(categoryId);
		setIsEditDrawerOpen(true);
	};

	const handleEditDrawerClose = (open: boolean) => {
		setIsEditDrawerOpen(open);
		if (!open) {
			setSelectedCategoryId(null);
		}
	};

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex items-center gap-2">
				<CategoriesTableSearch value={search} onChange={setSearch} />
			</div>

			<div className="rounded-md border">
				<Table>
					<CategoriesTableHeader
						sortBy={filters.sortBy}
						sortOrder={filters.sortOrder}
						onSort={toggleSort}
					/>
					<TableBody>
						{isLoading && <CategoriesTableLoading colSpan={7} />}
						{isError && <CategoriesTableError colSpan={7} />}
						{!isLoading && !isError && allCategories.length === 0 && (
							<CategoriesTableEmpty colSpan={7} />
						)}
						{!isLoading &&
							!isError &&
							allCategories.map((category) => (
								<CategoriesTableRow
									key={category.id}
									category={category}
									onClick={() => handleRowClick(category.id)}
									onDelete={handleDeleteClick}
								/>
							))}
						{!isLoading && !isError && allCategories.length > 0 && (
							<CategoriesTableFooter
								ref={hasNextPage ? loadMoreRef : undefined}
								colSpan={7}
								isLoading={isFetchingNextPage ?? false}
								hasMore={hasNextPage ?? false}
								totalCount={allCategories.length}
							/>
						)}
					</TableBody>
				</Table>
			</div>

			<CategoryDeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				categoryName={categoryToDelete?.name}
				isDeleting={deleteMutation.isPending}
				onConfirm={handleDeleteConfirm}
			/>

			<EditCategoryForm
				categoryId={selectedCategoryId}
				open={isEditDrawerOpen}
				onOpenChange={handleEditDrawerClose}
			/>
		</div>
	);
}
