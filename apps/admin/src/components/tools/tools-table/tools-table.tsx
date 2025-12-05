"use client";

import { useState } from "react";
import { Table, TableBody } from "~/components/ui/table";
import {
	useDeleteTool,
	useInfiniteScroll,
	useToolFilters,
	useTools,
} from "~/hooks/tools";
import { EditToolForm } from "../tool-form/edit-tool-form";
import { ToolDeleteDialog } from "./tool-delete-dialog";
import { ToolsTableEmpty } from "./tools-table-empty";
import { ToolsTableError } from "./tools-table-error";
import { ToolsTableFooter } from "./tools-table-footer";
import { ToolsTableHeader } from "./tools-table-header";
import { ToolsTableLoading } from "./tools-table-loading";
import { ToolsTableRow } from "./tools-table-row";
import { ToolsTableSearch } from "./tools-table-search";

export function ToolsTable() {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [toolToDelete, setToolToDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
	const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

	const { search, setSearch, filters, toggleSort } = useToolFilters();
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useTools(filters);
	const deleteMutation = useDeleteTool();
	const loadMoreRef = useInfiniteScroll({
		hasNextPage: hasNextPage ?? false,
		isFetchingNextPage: isFetchingNextPage ?? false,
		isLoading: isLoading ?? false,
		fetchNextPage,
	});

	const allTools = data?.pages.flatMap((page) => page.items) ?? [];

	const handleDeleteClick = (tool: { id: string; name: string }) => {
		setToolToDelete(tool);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (toolToDelete) {
			deleteMutation.mutate(toolToDelete.id, {
				onSuccess: () => {
					setDeleteDialogOpen(false);
					setToolToDelete(null);
				},
			});
		}
	};

	const handleEditDrawerClose = (open: boolean) => {
		setIsEditDrawerOpen(open);
		if (!open) {
			setSelectedToolId(null);
		}
	};

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex items-center gap-2">
				<ToolsTableSearch value={search} onChange={setSearch} />
			</div>

			<div className="rounded-md border">
				<Table>
					<ToolsTableHeader
						sortBy={filters.sortBy}
						sortOrder={filters.sortOrder}
						onSort={toggleSort}
					/>
					<TableBody>
						{isLoading && <ToolsTableLoading colSpan={7} />}
						{isError && <ToolsTableError colSpan={7} />}
						{!isLoading && !isError && allTools.length === 0 && (
							<ToolsTableEmpty colSpan={7} />
						)}
						{!isLoading &&
							!isError &&
							allTools.map((tool) => (
								<ToolsTableRow
									key={tool.id}
									tool={tool}
									onDelete={handleDeleteClick}
								/>
							))}
						{!isLoading && !isError && allTools.length > 0 && (
							<ToolsTableFooter
								ref={hasNextPage ? loadMoreRef : undefined}
								colSpan={7}
								isLoading={isFetchingNextPage ?? false}
								hasMore={hasNextPage ?? false}
								totalCount={allTools.length}
							/>
						)}
					</TableBody>
				</Table>
			</div>

			<ToolDeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				toolName={toolToDelete?.name}
				isDeleting={deleteMutation.isPending}
				onConfirm={handleDeleteConfirm}
			/>

			<EditToolForm
				toolId={selectedToolId}
				open={isEditDrawerOpen}
				onOpenChange={handleEditDrawerClose}
			/>
		</div>
	);
}
