"use client";

import { TableCell, TableRow } from "~/components/ui/table";

interface SponsorshipsTableErrorProps {
	colSpan: number;
	message?: string;
}

export function SponsorshipsTableError({
	colSpan,
	message = "Failed to load sponsorships. Please try again.",
}: SponsorshipsTableErrorProps) {
	return (
		<TableRow>
			<TableCell
				colSpan={colSpan}
				className="h-24 text-center text-destructive"
			>
				{message}
			</TableCell>
		</TableRow>
	);
}
