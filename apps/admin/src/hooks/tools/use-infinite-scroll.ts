"use client";

import { useEffect, useRef } from "react";

interface UseInfiniteScrollProps {
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	isLoading: boolean;
	fetchNextPage: () => void;
}

export function useInfiniteScroll<T extends HTMLElement = HTMLTableRowElement>({
	hasNextPage,
	isFetchingNextPage,
	isLoading,
	fetchNextPage,
}: UseInfiniteScrollProps) {
	const loadMoreRef = useRef<T>(null);

	useEffect(() => {
		if (!hasNextPage || isFetchingNextPage || isLoading) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (
					entries[0].isIntersecting &&
					hasNextPage &&
					!isFetchingNextPage &&
					!isLoading
				) {
					fetchNextPage();
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
	}, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

	return loadMoreRef;
}
