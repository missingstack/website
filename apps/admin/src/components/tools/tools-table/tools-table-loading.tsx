"use client";

import { Loader2 } from "lucide-react";
import { TableCell, TableRow } from "~/components/ui/table";

interface ToolsTableLoadingProps {
	colSpan: number;
	message?: string;
}

export function ToolsTableLoading({
	colSpan,
	message = "Loading tools...",
}: ToolsTableLoadingProps) {
	return (
		<TableRow>
			<TableCell colSpan={colSpan} className="h-24 text-center">
				<div className="flex items-center justify-center gap-2">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span className="text-muted-foreground">{message}</span>
				</div>
			</TableCell>
		</TableRow>
	);
}
