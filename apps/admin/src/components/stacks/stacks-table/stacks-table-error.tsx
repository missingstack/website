"use client";

import { TableCell, TableRow } from "~/components/ui/table";

interface StacksTableErrorProps {
	colSpan: number;
	message?: string;
}

export function StacksTableError({
	colSpan,
	message = "Failed to load stacks. Please try again.",
}: StacksTableErrorProps) {
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
