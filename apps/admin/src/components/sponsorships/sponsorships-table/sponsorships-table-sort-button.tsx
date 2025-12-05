"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { SponsorshipSortColumn } from "~/lib/search-params";

interface SponsorshipsTableSortButtonProps {
	column: SponsorshipSortColumn;
	isActive: boolean;
	sortOrder?: "asc" | "desc";
	onClick: () => void;
}

export function SponsorshipsTableSortButton({
	isActive,
	sortOrder,
	onClick,
}: SponsorshipsTableSortButtonProps) {
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
