"use client";

import { TableCell, TableRow } from "~/components/ui/table";

interface CategoriesTableEmptyProps {
	colSpan: number;
	message?: string;
}

export function CategoriesTableEmpty({
	colSpan,
	message = "No categories found.",
}: CategoriesTableEmptyProps) {
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
