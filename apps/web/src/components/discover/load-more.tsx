"use client";

import { Loader2 } from "lucide-react";

interface LoadMoreProps {
	isFetching: boolean;
	hasMore: boolean;
	isLoading: boolean;
	loadMoreRef: React.RefObject<HTMLDivElement>;
}

export function LoadMore({
	isFetching,
	hasMore,
	isLoading,
	loadMoreRef,
}: LoadMoreProps) {
	return (
		<div ref={loadMoreRef} className="mt-6 flex justify-center sm:mt-8">
			{isFetching && (
				<div className="flex items-center gap-2 text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
					<span className="text-xs sm:text-sm">Loading more tools...</span>
				</div>
			)}
			{!hasMore && !isLoading && !isFetching && (
				<p className="text-muted-foreground text-xs sm:text-sm">
					You've reached the end
				</p>
			)}
		</div>
	);
}
