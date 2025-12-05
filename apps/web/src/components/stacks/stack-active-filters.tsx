"use client";

import type { PricingModel, Tag } from "@missingstack/api/types";
import { X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { formatPricingDisplay } from "~/lib/utils";

interface StackActiveFiltersProps {
	search: string | null;
	pricing: PricingModel[];
	tagIds: string[];
	tags: Tag[];
	onRemoveSearch: () => void;
	onRemovePricing: (value: PricingModel) => void;
	onRemoveTag: (tagId: string) => void;
}

export function StackActiveFilters({
	search,
	pricing,
	tagIds,
	tags,
	onRemoveSearch,
	onRemovePricing,
	onRemoveTag,
}: StackActiveFiltersProps) {
	const hasFilters = pricing.length > 0 || tagIds.length > 0 || search;

	if (!hasFilters) return null;

	return (
		<div className="flex flex-wrap items-center gap-2">
			{search && (
				<Badge variant="secondary" className="gap-1 pr-1">
					&quot;{search}&quot;
					<button
						type="button"
						onClick={onRemoveSearch}
						className="ml-1 rounded-full p-0.5 hover:bg-muted"
					>
						<X className="h-3 w-3" />
						<span className="sr-only">Remove search filter</span>
					</button>
				</Badge>
			)}
			{pricing.map((p) => (
				<Badge key={p} variant="secondary" className="gap-1 pr-1">
					{formatPricingDisplay(p)}
					<button
						type="button"
						onClick={() => onRemovePricing(p)}
						className="ml-1 rounded-full p-0.5 hover:bg-muted"
					>
						<X className="h-3 w-3" />
						<span className="sr-only">
							Remove {formatPricingDisplay(p)} filter
						</span>
					</button>
				</Badge>
			))}
			{tagIds.map((tagId) => {
				const tag = tags.find((t) => t.id === tagId);
				return (
					<Badge key={tagId} variant="secondary" className="gap-1 pr-1">
						{tag?.name || tagId}
						<button
							type="button"
							onClick={() => onRemoveTag(tagId)}
							className="ml-1 rounded-full p-0.5 hover:bg-muted"
						>
							<X className="h-3 w-3" />
							<span className="sr-only">
								Remove {tag?.name || tagId} filter
							</span>
						</button>
					</Badge>
				);
			})}
		</div>
	);
}
