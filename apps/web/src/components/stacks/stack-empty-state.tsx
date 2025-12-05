"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";

interface StackEmptyStateProps {
	hasFilters: boolean;
	onClearFilters: () => void;
}

export function StackEmptyState({
	hasFilters,
	onClearFilters,
}: StackEmptyStateProps) {
	return (
		<div className="rounded-2xl bg-secondary/20 py-12 text-center">
			<p className="mb-4 text-muted-foreground">
				No tools found matching your criteria.
			</p>
			{hasFilters ? (
				<Button variant="outline" onClick={onClearFilters}>
					Clear filters
				</Button>
			) : (
				<Link href="/submit" className="text-primary hover:underline">
					Submit the first tool →
				</Link>
			)}
		</div>
	);
}
