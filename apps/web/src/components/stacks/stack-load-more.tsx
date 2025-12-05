"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface StackLoadMoreProps {
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	totalTools: number;
	onLoadMore: () => void;
}

export function StackLoadMore({
	hasNextPage,
	isFetchingNextPage,
	totalTools,
	onLoadMore,
}: StackLoadMoreProps) {
	const loadMoreRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					onLoadMore();
				}
			},
			{ threshold: 0.1, rootMargin: "100px" },
		);

		const currentRef = loadMoreRef.current;
		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
		};
	}, [hasNextPage, isFetchingNextPage, onLoadMore]);

	return (
		<div ref={loadMoreRef} className="mt-8 flex justify-center sm:mt-12">
			{isFetchingNextPage && (
				<div className="flex items-center gap-2 text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
					<span className="text-xs sm:text-sm">Loading more tools...</span>
				</div>
			)}
			{!hasNextPage && totalTools > 0 && !isFetchingNextPage && (
				<p className="text-muted-foreground text-xs sm:text-sm">
					You&apos;ve seen all {totalTools} tool{totalTools !== 1 ? "s" : ""} in
					this stack
				</p>
			)}
		</div>
	);
}
