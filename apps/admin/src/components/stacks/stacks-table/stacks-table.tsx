"use client";

import { useState } from "react";
import { Table, TableBody } from "~/components/ui/table";
import {
	useDeleteStack,
	useFilteredStacks,
	useStackFilters,
	useStacks,
} from "~/hooks/stacks";
import { EditStackForm } from "../stack-form";
import { StackDeleteDialog } from "./stack-delete-dialog";
import { StacksTableEmpty } from "./stacks-table-empty";
import { StacksTableError } from "./stacks-table-error";
import { StacksTableHeader } from "./stacks-table-header";
import { StacksTableLoading } from "./stacks-table-loading";
import { StacksTableRow } from "./stacks-table-row";
import { StacksTableSearch } from "./stacks-table-search";

export function StacksTable() {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [stackToDelete, setStackToDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [selectedStackId, setSelectedStackId] = useState<string | null>(null);
	const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

	const { search, setSearch, filters, toggleSort } = useStackFilters();
	const { data: stacks, isLoading, isError } = useStacks();
	const deleteMutation = useDeleteStack();

	const filteredStacks = useFilteredStacks(
		stacks,
		search,
		filters.sortBy,
		filters.sortOrder,
	);

	const handleDeleteClick = (stack: { id: string; name: string }) => {
		setStackToDelete(stack);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (stackToDelete) {
			deleteMutation.mutate(stackToDelete.id, {
				onSuccess: () => {
					setDeleteDialogOpen(false);
					setStackToDelete(null);
				},
			});
		}
	};

	const handleRowClick = (stackId: string) => {
		setSelectedStackId(stackId);
		setIsEditDrawerOpen(true);
	};

	const handleEditDrawerClose = (open: boolean) => {
		setIsEditDrawerOpen(open);
		if (!open) {
			setSelectedStackId(null);
		}
	};

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex items-center gap-2">
				<StacksTableSearch value={search} onChange={setSearch} />
			</div>

			<div className="rounded-md border">
				<Table>
					<StacksTableHeader
						sortBy={filters.sortBy}
						sortOrder={filters.sortOrder}
						onSort={toggleSort}
					/>
					<TableBody>
						{isLoading && <StacksTableLoading colSpan={7} />}
						{isError && <StacksTableError colSpan={7} />}
						{!isLoading && !isError && filteredStacks.length === 0 && (
							<StacksTableEmpty colSpan={7} />
						)}
						{!isLoading &&
							!isError &&
							filteredStacks.map((stack) => (
								<StacksTableRow
									key={stack.id}
									stack={stack}
									onClick={() => handleRowClick(stack.id)}
									onDelete={handleDeleteClick}
								/>
							))}
					</TableBody>
				</Table>
			</div>

			<StackDeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				stackName={stackToDelete?.name}
				isDeleting={deleteMutation.isPending}
				onConfirm={handleDeleteConfirm}
			/>

			<EditStackForm
				stackId={selectedStackId}
				open={isEditDrawerOpen}
				onOpenChange={handleEditDrawerClose}
			/>
		</div>
	);
}
