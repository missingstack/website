"use client";

import { TableCell, TableRow } from "~/components/ui/table";

interface AffiliateLinksTableEmptyProps {
	colSpan: number;
	message?: string;
}

export function AffiliateLinksTableEmpty({
	colSpan,
	message = "No affiliate links found.",
}: AffiliateLinksTableEmptyProps) {
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
