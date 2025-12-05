"use client";

import { TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type { AffiliateLinkSortColumn } from "~/lib/search-params";
import { AffiliateLinksTableSortButton } from "./affiliate-links-table-sort-button";

interface AffiliateLinksTableHeaderProps {
	sortBy?: AffiliateLinkSortColumn;
	sortOrder?: "asc" | "desc";
	onSort: (column: AffiliateLinkSortColumn) => void;
}

export function AffiliateLinksTableHeader({
	sortBy,
	sortOrder,
	onSort,
}: AffiliateLinksTableHeaderProps) {
	return (
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
						<AffiliateLinksTableSortButton
							column="commissionRate"
							isActive={sortBy === "commissionRate"}
							sortOrder={sortOrder}
							onClick={() => onSort("commissionRate")}
						/>
					</div>
				</TableHead>
				<TableHead className="w-[120px]">
					<div className="flex items-center gap-2">
						<span>Clicks</span>
						<AffiliateLinksTableSortButton
							column="clickCount"
							isActive={sortBy === "clickCount"}
							sortOrder={sortOrder}
							onClick={() => onSort("clickCount")}
						/>
					</div>
				</TableHead>
				<TableHead className="w-[120px]">
					<div className="flex items-center gap-2">
						<span>Revenue</span>
						<AffiliateLinksTableSortButton
							column="revenueTracked"
							isActive={sortBy === "revenueTracked"}
							sortOrder={sortOrder}
							onClick={() => onSort("revenueTracked")}
						/>
					</div>
				</TableHead>
				<TableHead className="w-[100px]">
					<div className="flex items-center gap-2">
						<span>Created</span>
						<AffiliateLinksTableSortButton
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
