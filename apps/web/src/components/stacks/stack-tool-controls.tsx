"use client";

import type { PricingModel, Tag } from "@missingstack/api/types";

import { StackMobileFilterSheet } from "./stack-mobile-filter-sheet";
import { StackSortControls } from "./stack-sort-controls";

interface StackToolControlsProps {
	search: string | null;
	pricing: PricingModel[];
	tagIds: string[];
	tags: Tag[];
	sortBy: string;
	onRemoveSearch: () => void;
	onRemovePricing: (value: PricingModel) => void;
	onRemoveTag: (tagId: string) => void;
	onSortChange: (value: "newest" | "name" | "popular") => void;
}

export function StackToolControls({
	search,
	pricing,
	tagIds,
	tags,
	sortBy,

	onSortChange,
}: StackToolControlsProps) {
	const filterCount = pricing.length + tagIds.length + (search ? 1 : 0);

	return (
		<div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
			<StackMobileFilterSheet tags={tags} filterCount={filterCount} />
			<StackSortControls sortBy={sortBy} onSortChange={onSortChange} />
		</div>
	);
}
