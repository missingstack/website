"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";
import { TableCell, TableRow } from "~/components/ui/table";

interface CategoriesTableFooterProps {
	colSpan: number;
	isLoading: boolean;
	hasMore: boolean;
	totalCount: number;
}

export const CategoriesTableFooter = React.forwardRef<
	HTMLTableRowElement,
	CategoriesTableFooterProps
>(function CategoriesTableFooter(
	{ colSpan, isLoading, hasMore, totalCount },
	ref,
) {
	if (!hasMore && !isLoading) {
		return (
			<TableRow ref={ref}>
				<TableCell colSpan={colSpan} className="h-16 text-center">
					<p className="text-muted-foreground text-sm">
						Showing all {totalCount} categor
						{totalCount !== 1 ? "ies" : "y"}
					</p>
				</TableCell>
			</TableRow>
		);
	}

	return (
		<TableRow ref={ref}>
			<TableCell colSpan={colSpan} className="h-16 text-center">
				{isLoading && (
					<div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span>Loading more categories...</span>
					</div>
				)}
			</TableCell>
		</TableRow>
	);
});
