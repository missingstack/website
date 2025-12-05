"use client";

import { TableCell, TableRow } from "~/components/ui/table";

interface ToolsTableErrorProps {
	colSpan: number;
	message?: string;
}

export function ToolsTableError({
	colSpan,
	message = "Failed to load tools. Please try again.",
}: ToolsTableErrorProps) {
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
