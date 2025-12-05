"use client";

import { TableCell, TableRow } from "~/components/ui/table";

interface SponsorshipsTableEmptyProps {
	colSpan: number;
	message?: string;
}

export function SponsorshipsTableEmpty({
	colSpan,
	message = "No sponsorships found.",
}: SponsorshipsTableEmptyProps) {
	return (
		<TableRow>
			<TableCell
				colSpan={colSpan}
				className="h-24 text-center text-muted-foreground"
			>
				{message}
			</TableCell>
		</TableRow>
	);
}
