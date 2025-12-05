"use client";

import { TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type { SponsorshipSortColumn } from "~/lib/search-params";
import { SponsorshipsTableSortButton } from "./sponsorships-table-sort-button";

interface SponsorshipsTableHeaderProps {
	sortBy?: SponsorshipSortColumn;
	sortOrder?: "asc" | "desc";
	onSort: (column: SponsorshipSortColumn) => void;
}

export function SponsorshipsTableHeader({
	sortBy,
	sortOrder,
	onSort,
}: SponsorshipsTableHeaderProps) {
	return (
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
						<SponsorshipsTableSortButton
							column="startDate"
							isActive={sortBy === "startDate"}
							sortOrder={sortOrder}
							onClick={() => onSort("startDate")}
						/>
					</div>
				</TableHead>
				<TableHead className="w-[120px]">
					<div className="flex items-center gap-2">
						<span>End Date</span>
						<SponsorshipsTableSortButton
							column="endDate"
							isActive={sortBy === "endDate"}
							sortOrder={sortOrder}
							onClick={() => onSort("endDate")}
						/>
					</div>
				</TableHead>
				<TableHead className="w-[120px]">
					<div className="flex items-center gap-2">
						<span>Priority</span>
						<SponsorshipsTableSortButton
							column="priorityWeight"
							isActive={sortBy === "priorityWeight"}
							sortOrder={sortOrder}
							onClick={() => onSort("priorityWeight")}
						/>
					</div>
				</TableHead>
				<TableHead className="w-[120px]">Payment Status</TableHead>
				<TableHead className="w-[100px]">Active</TableHead>
				<TableHead className="w-[100px]">
					<div className="flex items-center gap-2">
						<span>Created</span>
						<SponsorshipsTableSortButton
							column="createdAt"
							isActive={sortBy === "createdAt"}
							sortOrder={sortOrder}
							onClick={() => onSort("createdAt")}
						/>
					</div>
				</TableHead>
				<TableHead className="w-[100px]">Actions</TableHead>
			</TableRow>
		</TableHeader>
	);
}
