"use client";

import { Button } from "~/components/ui/button";

interface StacksEmptyStateProps {
	searchQuery: string;
	onClearSearch: () => void;
}

export function StacksEmptyState({
	searchQuery,
	onClearSearch,
}: StacksEmptyStateProps) {
	return (
		<div className="rounded-xl bg-secondary/20 py-10 text-center sm:rounded-2xl sm:py-12">
			<p className="mb-4 text-muted-foreground text-sm sm:text-base">
				No stacks found matching &quot;{searchQuery}&quot;
			</p>
			<Button
				variant="outline"
				onClick={onClearSearch}
				className="transition-all duration-200 hover:scale-105 active:scale-95"
			>
				Clear search
			</Button>
		</div>
	);
}
