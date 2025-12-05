"use client";

import { useState } from "react";
import { Table, TableBody } from "~/components/ui/table";
import {
	useDeleteSponsorship,
	useInfiniteScroll,
	useSponsorshipFilters,
	useSponsorshipToolMap,
	useSponsorships,
} from "~/hooks/sponsorships";
import { EditSponsorshipForm } from "../sponsorship-form/edit-sponsorship-form";
import {
	getPaymentStatusBadgeVariant,
	getTierBadgeVariant,
} from "./shared/badge-variants";
import { SponsorshipDeleteDialog } from "./sponsorship-delete-dialog";
import { SponsorshipsTableEmpty } from "./sponsorships-table-empty";
import { SponsorshipsTableError } from "./sponsorships-table-error";
import { SponsorshipsTableFooter } from "./sponsorships-table-footer";
import { SponsorshipsTableHeader } from "./sponsorships-table-header";
import { SponsorshipsTableLoading } from "./sponsorships-table-loading";
import { SponsorshipsTableRow } from "./sponsorships-table-row";
import { SponsorshipsTableSearch } from "./sponsorships-table-search";

export function SponsorshipsTable() {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [sponsorshipToDelete, setSponsorshipToDelete] = useState<{
		id: string;
		toolName: string;
	} | null>(null);
	const [selectedSponsorshipId, setSelectedSponsorshipId] = useState<
		string | null
	>(null);
	const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

	const { search, setSearch, filters, toggleSort } = useSponsorshipFilters();
	const toolMap = useSponsorshipToolMap();

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useSponsorships({
		search: search || undefined,
		sortBy: filters.sortBy,
		sortOrder: filters.sortOrder,
	});

	const deleteMutation = useDeleteSponsorship();
	const loadMoreRef = useInfiniteScroll({
		hasNextPage: hasNextPage ?? false,
		isFetchingNextPage: isFetchingNextPage ?? false,
		isLoading: isLoading ?? false,
		fetchNextPage,
	});

	const allSponsorships = data?.pages.flatMap((page) => page.items) ?? [];

	const handleDeleteClick = (sponsorship: { id: string; toolId: string }) => {
		const toolName = toolMap.get(sponsorship.toolId) || "Unknown Tool";
		setSponsorshipToDelete({ id: sponsorship.id, toolName });
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (sponsorshipToDelete) {
			deleteMutation.mutate(sponsorshipToDelete.id, {
				onSuccess: () => {
					setDeleteDialogOpen(false);
					setSponsorshipToDelete(null);
				},
			});
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

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex items-center gap-2">
				<SponsorshipsTableSearch value={search} onChange={setSearch} />
			</div>

			<div className="rounded-md border">
				<Table>
					<SponsorshipsTableHeader
						sortBy={filters.sortBy}
						sortOrder={filters.sortOrder}
						onSort={toggleSort}
					/>
					<TableBody>
						{isLoading && <SponsorshipsTableLoading colSpan={9} />}
						{isError && <SponsorshipsTableError colSpan={9} />}
						{!isLoading && !isError && allSponsorships.length === 0 && (
							<SponsorshipsTableEmpty colSpan={9} />
						)}
						{!isLoading &&
							!isError &&
							allSponsorships.map((sponsorship) => {
								const toolName = toolMap.get(sponsorship.toolId) || "Unknown";
								return (
									<SponsorshipsTableRow
										key={sponsorship.id}
										sponsorship={sponsorship}
										toolName={toolName}
										onClick={() => handleRowClick(sponsorship.id)}
										onDelete={handleDeleteClick}
										getTierBadgeVariant={getTierBadgeVariant}
										getPaymentStatusBadgeVariant={getPaymentStatusBadgeVariant}
									/>
								);
							})}
						{!isLoading && !isError && allSponsorships.length > 0 && (
							<SponsorshipsTableFooter
								colSpan={9}
								ref={loadMoreRef}
								hasNextPage={hasNextPage ?? false}
								isFetchingNextPage={isFetchingNextPage ?? false}
								totalCount={allSponsorships.length}
							/>
						)}
					</TableBody>
				</Table>
			</div>

			<SponsorshipDeleteDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
				toolName={sponsorshipToDelete?.toolName}
				isDeleting={deleteMutation.isPending}
				onConfirm={handleDeleteConfirm}
			/>

			<EditSponsorshipForm
				sponsorshipId={selectedSponsorshipId}
				open={isEditDrawerOpen}
				onOpenChange={handleEditDrawerClose}
			/>
		</div>
	);
}
