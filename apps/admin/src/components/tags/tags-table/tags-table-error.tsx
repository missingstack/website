"use client";

import { TableCell, TableRow } from "~/components/ui/table";

interface TagsTableErrorProps {
	colSpan: number;
	message?: string;
}

export function TagsTableError({
	colSpan,
	message = "Failed to load tags. Please try again.",
}: TagsTableErrorProps) {
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
