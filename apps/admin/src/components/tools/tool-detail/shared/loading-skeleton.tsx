"use client";

import { useMemo } from "react";
import { Skeleton } from "~/components/ui/skeleton";

interface LoadingSkeletonProps {
	count?: number;
	className?: string;
}

export function LoadingSkeleton({
	count = 3,
	className = "h-20 w-full",
}: LoadingSkeletonProps) {
	const skeletonKeys = useMemo(
		() =>
			Array.from({ length: count }, (_, i) => `skeleton-${Date.now()}-${i}`),
		[count],
	);

	return (
		<div className="space-y-4">
			{skeletonKeys.map((key) => (
				<Skeleton key={key} className={className} />
			))}
		</div>
	);
}
