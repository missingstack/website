"use client";

import { TableCell, TableRow } from "~/components/ui/table";

interface CategoriesTableErrorProps {
	colSpan: number;
	message?: string;
}

export function CategoriesTableError({
	colSpan,
	message = "Failed to load categories. Please try again.",
}: CategoriesTableErrorProps) {
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
