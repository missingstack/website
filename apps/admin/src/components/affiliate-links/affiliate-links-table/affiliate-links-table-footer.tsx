"use client";

import { Loader2 } from "lucide-react";
import * as React from "react";
import { TableCell, TableRow } from "~/components/ui/table";

interface AffiliateLinksTableFooterProps {
	colSpan: number;
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	totalCount: number;
}

export const AffiliateLinksTableFooter = React.forwardRef<
	HTMLTableRowElement,
	AffiliateLinksTableFooterProps
>(function AffiliateLinksTableFooter(
	{ colSpan, hasNextPage, isFetchingNextPage, totalCount },
	ref,
) {
	if (!hasNextPage && !isFetchingNextPage) {
		return (
			<TableRow ref={ref}>
				<TableCell colSpan={colSpan} className="h-16 text-center">
					<p className="text-muted-foreground text-sm">
						Showing all {totalCount} affiliate link
						{totalCount !== 1 ? "s" : ""}
					</p>
				</TableCell>
			</TableRow>
		);
	}

	return (
		<TableRow ref={ref}>
			<TableCell colSpan={colSpan} className="h-16 text-center">
				{isFetchingNextPage && (
					<div className="flex items-center justify-center gap-2 text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span className="text-sm">Loading more affiliate links...</span>
					</div>
				)}
			</TableCell>
		</TableRow>
	);
});
