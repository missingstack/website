"use client";

import { TableCell, TableRow } from "~/components/ui/table";

interface TagsTableEmptyProps {
	colSpan: number;
	message?: string;
}

export function TagsTableEmpty({
	colSpan,
	message = "No tags found.",
}: TagsTableEmptyProps) {
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
