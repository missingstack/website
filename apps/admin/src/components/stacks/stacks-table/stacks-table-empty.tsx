"use client";

import { TableCell, TableRow } from "~/components/ui/table";

interface StacksTableEmptyProps {
	colSpan: number;
	message?: string;
}

export function StacksTableEmpty({
	colSpan,
	message = "No stacks found.",
}: StacksTableEmptyProps) {
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
