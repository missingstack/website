"use client";

import { useState } from "react";
import { Table, TableBody } from "~/components/ui/table";
import {
	useAffiliateLinkFilters,
	useAffiliateLinkToolMap,
	useAffiliateLinks,
	useDeleteAffiliateLink,
	useInfiniteScroll,
} from "~/hooks/affiliate-links";
import { EditAffiliateLinkForm } from "../affiliate-link-form/edit-affiliate-link-form";
import { AffiliateLinkDeleteDialog } from "./affiliate-link-delete-dialog";
import { AffiliateLinksTableEmpty } from "./affiliate-links-table-empty";
import { AffiliateLinksTableError } from "./affiliate-links-table-error";
import { AffiliateLinksTableFooter } from "./affiliate-links-table-footer";
import { AffiliateLinksTableHeader } from "./affiliate-links-table-header";
import { AffiliateLinksTableLoading } from "./affiliate-links-table-loading";
import { AffiliateLinksTableRow } from "./affiliate-links-table-row";
import { AffiliateLinksTableSearch } from "./affiliate-links-table-search";

export function AffiliateLinksTable() {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [affiliateLinkToDelete, setAffiliateLinkToDelete] = useState<{
		id: string;
		toolName: string;
	} | null>(null);
	const [selectedAffiliateLinkId, setSelectedAffiliateLinkId] = useState<
		string | null
	>(null);
	const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

	const { search, setSearch, filters, toggleSort } = useAffiliateLinkFilters();
	const toolMap = useAffiliateLinkToolMap();

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useAffiliateLinks({
		search: search || undefined,
		sortBy: filters.sortBy,
		sortOrder: filters.sortOrder,
	});

	const deleteMutation = useDeleteAffiliateLink();
	const loadMoreRef = useInfiniteScroll({
		hasNextPage: hasNextPage ?? false,
		isFetchingNextPage: isFetchingNextPage ?? false,
		isLoading: isLoading ?? false,
		fetchNextPage,
	});

	const allAffiliateLinks = data?.pages.flatMap((page) => page.items) ?? [];

	const handleDeleteClick = (affiliateLink: { id: string; toolId: string }) => {
		const toolName = toolMap.get(affiliateLink.toolId) || "Unknown Tool";
		setAffiliateLinkToDelete({ id: affiliateLink.id, toolName });
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (affiliateLinkToDelete) {
			deleteMutation.mutate(affiliateLinkToDelete.id, {
				onSuccess: () => {
					setDeleteDialogOpen(false);
					setAffiliateLinkToDelete(null);
				},
			});
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

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex items-center gap-2">
				<AffiliateLinksTableSearch value={search} onChange={setSearch} />
			</div>

			<div className="rounded-md border">
				<Table>
					<AffiliateLinksTableHeader
						sortBy={filters.sortBy}
						sortOrder={filters.sortOrder}
						onSort={toggleSort}
					/>
					<TableBody>
						{isLoading && <AffiliateLinksTableLoading colSpan={8} />}
						{isError && <AffiliateLinksTableError colSpan={8} />}
						{!isLoading && !isError && allAffiliateLinks.length === 0 && (
							<AffiliateLinksTableEmpty colSpan={8} />
						)}
						{!isLoading &&
							!isError &&
							allAffiliateLinks.map((affiliateLink) => {
								const toolName = toolMap.get(affiliateLink.toolId) || "Unknown";
								return (
									<AffiliateLinksTableRow
										key={affiliateLink.id}
										affiliateLink={affiliateLink}
										toolName={toolName}
										onClick={() => handleRowClick(affiliateLink.id)}
										onDelete={handleDeleteClick}
									/>
								);
							})}
						{!isLoading && !isError && allAffiliateLinks.length > 0 && (
							<AffiliateLinksTableFooter
								colSpan={8}
								ref={loadMoreRef}
								hasNextPage={hasNextPage ?? false}
								isFetchingNextPage={isFetchingNextPage ?? false}
								totalCount={allAffiliateLinks.length}
							/>
						)}
					</TableBody>
				</Table>
			</div>

			<AffiliateLinkDeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				toolName={affiliateLinkToDelete?.toolName}
				isDeleting={deleteMutation.isPending}
				onConfirm={handleDeleteConfirm}
			/>

			<EditAffiliateLinkForm
				affiliateLinkId={selectedAffiliateLinkId}
				open={isEditDrawerOpen}
				onOpenChange={handleEditDrawerClose}
			/>
		</div>
	);
}
