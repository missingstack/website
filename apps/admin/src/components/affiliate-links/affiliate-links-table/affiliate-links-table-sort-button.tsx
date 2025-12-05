"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { AffiliateLinkSortColumn } from "~/lib/search-params";

interface AffiliateLinksTableSortButtonProps {
	column: AffiliateLinkSortColumn;
	isActive: boolean;
	sortOrder?: "asc" | "desc";
	onClick: () => void;
}

export function AffiliateLinksTableSortButton({
	isActive,
	sortOrder,
	onClick,
}: AffiliateLinksTableSortButtonProps) {
	return (
		<Button variant="ghost" size="sm" className="h-8 gap-1" onClick={onClick}>
			{isActive ? (
				sortOrder === "asc" ? (
					<ArrowUp className="h-4 w-4" />
				) : (
					<ArrowDown className="h-4 w-4" />
				)
			) : (
				<ArrowUpDown className="h-4 w-4 opacity-50" />
			)}
		</Button>
	);
}
