"use client";

import { TableCell, TableRow } from "~/components/ui/table";

interface ToolsTableEmptyProps {
	colSpan: number;
	message?: string;
}

export function ToolsTableEmpty({
	colSpan,
	message = "No tools found.",
}: ToolsTableEmptyProps) {
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
