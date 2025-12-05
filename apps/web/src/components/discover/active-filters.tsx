"use client";

import { useQueryStates } from "nuqs";
import { searchParamsParsers } from "~/lib/search-params";
import { formatPlatformDisplay, formatPricingDisplay } from "~/lib/utils";
import { FilterBadge } from "./filter-badge";

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
				<FilterBadge
					label={`"${filters.search}"`}
					onRemove={clearSearch}
					ariaLabel="Remove search filter"
				/>
			)}
			{filters.categoryIds.map((id) => (
				<FilterBadge
					key={id}
					label={categoryNames[id] ?? id}
					onRemove={() => removeFilter("categoryIds", id)}
					ariaLabel="Remove category filter"
				/>
			))}
			{filters.pricing.map((p) => (
				<FilterBadge
					key={p}
					label={formatPricingDisplay(p)}
					onRemove={() => removeFilter("pricing", p)}
					ariaLabel={`Remove ${formatPricingDisplay(p)} filter`}
				/>
			))}
			{filters.platforms.map((p) => (
				<FilterBadge
					key={p}
					label={formatPlatformDisplay(p)}
					onRemove={() => removeFilter("platforms", p)}
					ariaLabel={`Remove ${p} filter`}
				/>
			))}
			{filters.tagIds.map((id) => (
				<FilterBadge
					key={id}
					label={tagNames[id] ?? id}
					onRemove={() => removeFilter("tagIds", id)}
					ariaLabel="Remove tag filter"
				/>
			))}
		</div>
	);
}
