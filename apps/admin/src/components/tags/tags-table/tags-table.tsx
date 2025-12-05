"use client";

import { useState } from "react";
import { Table, TableBody } from "~/components/ui/table";
import {
	useDeleteTag,
	useFilteredTags,
	useTagFilters,
	useTags,
} from "~/hooks/tags";
import { EditTagForm } from "../tag-form/edit-tag-form";
import { TagDeleteDialog } from "./tag-delete-dialog";
import { TagsTableEmpty } from "./tags-table-empty";
import { TagsTableError } from "./tags-table-error";
import { TagsTableHeader } from "./tags-table-header";
import { TagsTableLoading } from "./tags-table-loading";
import { TagsTableRow } from "./tags-table-row";
import { TagsTableSearch } from "./tags-table-search";

export function TagsTable() {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [tagToDelete, setTagToDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
	const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

	const { search, setSearch, filters, toggleSort } = useTagFilters();
	const { data: tags, isLoading, isError } = useTags();
	const deleteMutation = useDeleteTag();

	const filteredTags = useFilteredTags(
		tags,
		search,
		filters.sortBy,
		filters.sortOrder,
	);

	const handleDeleteClick = (tag: { id: string; name: string }) => {
		setTagToDelete(tag);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (tagToDelete) {
			deleteMutation.mutate(tagToDelete.id, {
				onSuccess: () => {
					setDeleteDialogOpen(false);
					setTagToDelete(null);
				},
			});
		}
	};

	const handleRowClick = (tagId: string) => {
		setSelectedTagId(tagId);
		setIsEditDrawerOpen(true);
	};

	const handleEditDrawerClose = (open: boolean) => {
		setIsEditDrawerOpen(open);
		if (!open) {
			setSelectedTagId(null);
		}
	};

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex items-center gap-2">
				<TagsTableSearch value={search} onChange={setSearch} />
			</div>

			<div className="rounded-md border">
				<Table>
					<TagsTableHeader
						sortBy={filters.sortBy}
						sortOrder={filters.sortOrder}
						onSort={toggleSort}
					/>
					<TableBody>
						{isLoading && <TagsTableLoading colSpan={6} />}
						{isError && <TagsTableError colSpan={6} />}
						{!isLoading && !isError && filteredTags.length === 0 && (
							<TagsTableEmpty colSpan={6} />
						)}
						{!isLoading &&
							!isError &&
							filteredTags.map((tag) => (
								<TagsTableRow
									key={tag.id}
									tag={tag}
									onClick={() => handleRowClick(tag.id)}
									onDelete={handleDeleteClick}
								/>
							))}
					</TableBody>
				</Table>
			</div>

			<TagDeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				tagName={tagToDelete?.name}
				isDeleting={deleteMutation.isPending}
				onConfirm={handleDeleteConfirm}
			/>

			<EditTagForm
				tagId={selectedTagId}
				open={isEditDrawerOpen}
				onOpenChange={handleEditDrawerClose}
			/>
		</div>
	);
}
