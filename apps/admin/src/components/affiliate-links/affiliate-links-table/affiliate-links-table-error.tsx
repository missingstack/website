"use client";

import { TableCell, TableRow } from "~/components/ui/table";

interface AffiliateLinksTableErrorProps {
	colSpan: number;
	message?: string;
}

export function AffiliateLinksTableError({
	colSpan,
	message = "Failed to load affiliate links. Please try again.",
}: AffiliateLinksTableErrorProps) {
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
