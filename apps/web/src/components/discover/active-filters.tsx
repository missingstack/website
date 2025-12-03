"use client";

import { X } from "lucide-react";
import { useQueryStates } from "nuqs";
import { Badge } from "~/components/ui/badge";
import { searchParamsParsers } from "~/lib/search-params";
import { formatPlatformDisplay, formatPricingDisplay } from "~/lib/utils";

interface ActiveFiltersProps {
	categoryNames: Record<string, string>;
	tagNames: Record<string, string>;
}

export function ActiveFilters({ categoryNames, tagNames }: ActiveFiltersProps) {
	const [filters, setFilters] = useQueryStates(
		{
			search: searchParamsParsers.search,
			categoryIds: searchParamsParsers.categoryIds,
			platforms: searchParamsParsers.platforms,
			pricing: searchParamsParsers.pricing,
			tagIds: searchParamsParsers.tagIds,
		},
		{ shallow: false },
	);

	const removeFilter = (
		key: "categoryIds" | "pricing" | "platforms" | "tagIds",
		value: string,
	) => {
		const current = filters[key];
		const newValues = current.filter((v) => v !== value);
		setFilters({ [key]: newValues.length > 0 ? newValues : null });
	};

	const clearSearch = () => {
		setFilters({ search: null });
	};

	const hasActiveFilters =
		filters.search ||
		filters.categoryIds.length > 0 ||
		filters.pricing.length > 0 ||
		filters.platforms.length > 0 ||
		filters.tagIds.length > 0;

	if (!hasActiveFilters) return null;

	return (
		<div className="flex flex-wrap items-center gap-2">
			{filters.search && (
				<Badge variant="secondary" className="gap-1 pr-1">
					"{filters.search}"
					<button
						type="button"
						onClick={clearSearch}
						className="ml-1 rounded-full p-0.5 hover:bg-muted"
					>
						<X className="h-3 w-3" />
						<span className="sr-only">Remove search filter</span>
					</button>
				</Badge>
			)}
			{filters.categoryIds.map((id) => (
				<Badge key={id} variant="secondary" className="gap-1 pr-1">
					{categoryNames[id] ?? id}
					<button
						type="button"
						onClick={() => removeFilter("categoryIds", id)}
						className="ml-1 rounded-full p-0.5 hover:bg-muted"
					>
						<X className="h-3 w-3" />
						<span className="sr-only">Remove category filter</span>
					</button>
				</Badge>
			))}
			{filters.pricing.map((p) => (
				<Badge key={p} variant="secondary" className="gap-1 pr-1">
					{formatPricingDisplay(p)}
					<button
						type="button"
						onClick={() => removeFilter("pricing", p)}
						className="ml-1 rounded-full p-0.5 hover:bg-muted"
					>
						<X className="h-3 w-3" />
						<span className="sr-only">
							Remove {formatPricingDisplay(p)} filter
						</span>
					</button>
				</Badge>
			))}
			{filters.platforms.map((p) => (
				<Badge key={p} variant="secondary" className="gap-1 pr-1">
					{formatPlatformDisplay(p)}
					<button
						type="button"
						onClick={() => removeFilter("platforms", p)}
						className="ml-1 rounded-full p-0.5 hover:bg-muted"
					>
						<X className="h-3 w-3" />
						<span className="sr-only">Remove {p} filter</span>
					</button>
				</Badge>
			))}
			{filters.tagIds.map((id) => (
				<Badge key={id} variant="secondary" className="gap-1 pr-1">
					{tagNames[id] ?? id}
					<button
						type="button"
						onClick={() => removeFilter("tagIds", id)}
						className="ml-1 rounded-full p-0.5 hover:bg-muted"
					>
						<X className="h-3 w-3" />
						<span className="sr-only">Remove tag filter</span>
					</button>
				</Badge>
			))}
		</div>
	);
}
